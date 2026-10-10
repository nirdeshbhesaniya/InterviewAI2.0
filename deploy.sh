#!/usr/bin/env bash

# ==============================================================================
#  InterviewAI - AWS EC2 Automated Deployment Script
#  Usage:
#    ./deploy.sh          (Deploys default 'main' branch)
#    ./deploy.sh <branch> (Deploys specific branch, e.g., ./deploy.sh dev)
# ==============================================================================

set -eo pipefail

# --- Color Codes for Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Configuration ---
BRANCH="${1:-main}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
PM2_APP_NAME="interview-ai-backend"
HEALTH_CHECK_URL="http://localhost:8080/api/health"

log_info() {
    echo -e "${BLUE}${BOLD}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}${BOLD}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}${BOLD}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}${BOLD}[ERROR]${NC} $1"
}

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "   🚀 Starting Deployment: Interview AI on AWS EC2       "
echo "=========================================================="
echo -e "${NC}"
log_info "Working directory: ${PROJECT_ROOT}"
log_info "Target git branch: ${BRANCH}"
log_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"

# ------------------------------------------------------------------------------
# 1. Verify Prerequisites
# ------------------------------------------------------------------------------
log_info "Step 1/6: Checking prerequisites..."

if ! command -v git &> /dev/null; then
    log_error "git is not installed. Please install it with: sudo apt install git -y"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js (>= 18.0.0)."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 is not installed globally. Installing pm2 now..."
    sudo npm install -g pm2
fi

log_success "Prerequisites checked (Node: $(node -v), NPM: $(npm -v), PM2: $(pm2 -v))"

# ------------------------------------------------------------------------------
# 2. Git Fetch & Pull Latest Code
# ------------------------------------------------------------------------------
log_info "Step 2/6: Fetching latest code from GitHub..."
cd "${PROJECT_ROOT}"

# Stash any local untracked/modified changes to prevent merge conflicts
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Local uncommitted changes detected. Creating git stash backup..."
    git stash push -u -m "Auto-stash before deploy $(date '+%Y%m%d_%H%M%S')" || true
fi

# Fetch and switch to the target branch
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

LATEST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%an, %ar)")
log_success "Repository updated to latest commit: ${LATEST_COMMIT}"

# ------------------------------------------------------------------------------
# 3. Backend: Install Dependencies & Restart Service
# ------------------------------------------------------------------------------
log_info "Step 3/6: Updating backend dependencies and restarting server..."
cd "${BACKEND_DIR}"

if [ ! -f ".env" ]; then
    log_warning "No .env file found in ${BACKEND_DIR}! Make sure environment variables are set."
fi

# Install dependencies (only production packages if preferred, or standard npm install)
npm install --no-audit --no-fund

# Ensure logs directory exists
mkdir -p "${BACKEND_DIR}/logs"

# Smart auto-detection: check if PM2 already has a process running for this backend
if ! pm2 describe "${PM2_APP_NAME}" &> /dev/null; then
    DETECTED_APP=$(pm2 jlist 2>/dev/null | node -e "
        let d = '';
        process.stdin.on('data', c => d += c);
        process.stdin.on('end', () => {
            try {
                const list = JSON.parse(d);
                const found = list.find(p => p.pm2_env && (p.pm2_env.pm_exec_path.endsWith('server.js') || p.name === 'server' || p.name.includes('backend')));
                if (found) process.stdout.write(found.name);
            } catch(e) {}
        });
    " 2>/dev/null || true)
    
    if [ -n "$DETECTED_APP" ]; then
        log_info "Detected currently running PM2 process: '${DETECTED_APP}'"
        PM2_APP_NAME="$DETECTED_APP"
    fi
fi

# Check if PM2 ecosystem config exists in project root or backend
if [ -f "${PROJECT_ROOT}/ecosystem.config.cjs" ] && [ "${PM2_APP_NAME}" = "interview-ai-backend" ]; then
    log_info "Using PM2 ecosystem config..."
    if pm2 describe "${PM2_APP_NAME}" &> /dev/null; then
        pm2 reload "${PROJECT_ROOT}/ecosystem.config.cjs" --update-env
        log_success "Reloaded backend via PM2 (zero-downtime)"
    else
        pm2 start "${PROJECT_ROOT}/ecosystem.config.cjs"
        log_success "Started backend via PM2"
    fi
else
    if pm2 describe "${PM2_APP_NAME}" &> /dev/null; then
        pm2 restart "${PM2_APP_NAME}" --update-env
        log_success "Restarted existing PM2 process: ${PM2_APP_NAME}"
    else
        pm2 start server.js --name "${PM2_APP_NAME}"
        log_success "Started new PM2 process: ${PM2_APP_NAME}"
    fi
fi

# Save PM2 process list so it recovers upon server reboot
pm2 save

# ------------------------------------------------------------------------------
# 4. Frontend: Install Dependencies & Build Production Assets
# ------------------------------------------------------------------------------
log_info "Step 4/6: Building frontend production bundle..."
cd "${FRONTEND_DIR}"

if [ ! -f ".env" ]; then
    log_warning "No .env file found in ${FRONTEND_DIR} (Vite may use defaults)."
fi

npm install --no-audit --no-fund
npm run build

if [ ! -d "${FRONTEND_DIR}/dist" ]; then
    log_error "Frontend build failed: dist directory was not created!"
    exit 1
fi
log_success "Frontend built successfully at ${FRONTEND_DIR}/dist"

# Optional: If you sync build files to /var/www/html or /var/www/interview-ai,
# you can uncomment the following line:
# sudo rsync -av --delete "${FRONTEND_DIR}/dist/" /var/www/html/

# ------------------------------------------------------------------------------
# 5. Reload Nginx (if installed and active)
# ------------------------------------------------------------------------------
log_info "Step 5/6: Checking Nginx reverse proxy..."
if command -v nginx &> /dev/null; then
    if sudo nginx -t 2>/dev/null; then
        sudo systemctl reload nginx
        log_success "Nginx configuration verified and reloaded."
    else
        log_warning "Nginx configuration test failed. Skipping Nginx reload."
    fi
else
    log_info "Nginx not detected on this system. Skipping web server reload."
fi

# ------------------------------------------------------------------------------
# 6. Verify Backend Health
# ------------------------------------------------------------------------------
log_info "Step 6/6: Verifying backend health..."
sleep 2

if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_CHECK_URL}" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        log_success "Backend health check passed! (${HEALTH_CHECK_URL} returned 200 OK)"
    else
        log_warning "Backend health check returned status code: ${HTTP_CODE}. Please check 'pm2 logs ${PM2_APP_NAME}'."
    fi
else
    log_info "curl not installed; skipping automatic health endpoint check."
fi

echo -e "\n${CYAN}----------------------------------------------------------${NC}"
echo -e "${BOLD}Current PM2 Status:${NC}"
pm2 list
echo -e "${CYAN}----------------------------------------------------------${NC}"

echo -e "\n${GREEN}${BOLD}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}\n"
