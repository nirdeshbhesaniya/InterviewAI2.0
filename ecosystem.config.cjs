const path = require('path');

module.exports = {
  apps: [
    {
      name: 'interview-ai-backend',
      script: 'server.js',
      cwd: path.resolve(__dirname, 'backend'),
      instances: 1,             // Use 1 for t2.micro/t3.micro (Free Tier)
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: path.resolve(__dirname, 'backend/logs/backend-error.log'),
      out_file: path.resolve(__dirname, 'backend/logs/backend-out.log'),
      merge_logs: true,
      time: true
    }
  ]
};
