// IT Career Roadmaps Data - All 20 Careers
// Each roadmap has: id, title, category, icon, gradient, difficulty, duration, salary, demand, phases

export const CATEGORIES = [
  { id: 'all', label: 'All Careers', icon: 'Globe' },
  { id: 'development', label: 'Development', icon: 'Code2' },
  { id: 'ai-data', label: 'AI & Data', icon: 'Brain' },
  { id: 'cloud', label: 'Cloud', icon: 'Cloud' },
  { id: 'security', label: 'Security', icon: 'ShieldCheck' },
  { id: 'networking', label: 'Networking', icon: 'Network' },
  { id: 'management', label: 'Management', icon: 'BarChart3' },
  { id: 'emerging', label: 'Emerging Tech', icon: 'Rocket' },
];

export const ROADMAPS = [
  // ─────────────────────────────────────────────────────────────
  // 1. MERN STACK DEVELOPER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'mern-stack',
    title: 'MERN Stack Developer',
    category: 'development',
    icon: 'Layers',
    iconColor: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    cardGradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    borderColor: 'border-blue-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '6-8 months',
    salary: '₹6L - ₹18L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['React', 'Node.js', 'MongoDB', 'Express'],
    description: 'Master the MERN stack and build full-stack web applications from scratch to deployment.',
    phases: [
      {
        id: 'phase-1',
        title: 'Phase 1: Fundamentals',
        color: 'bg-blue-500',
        ringColor: 'ring-blue-500/30',
        estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'computer-basics',
            title: 'Computer & Web Fundamentals',
            estimatedTime: '1 week',
            topics: [
              { id: 'cb-1', name: 'Computer Basics & OS', description: 'How computers work, file systems, processes' },
              { id: 'cb-2', name: 'Internet & How it Works', description: 'TCP/IP, DNS, HTTP/HTTPS, browsers' },
              { id: 'cb-3', name: 'Git & Version Control', description: 'git init, add, commit, push, branching, merging' },
              { id: 'cb-4', name: 'CLI Basics', description: 'Terminal commands, navigation, file operations' },
            ],
            projects: ['Set up GitHub profile', 'Create first repository'],
            resources: ['CS50 Introduction', 'The Odin Project Foundations', 'Git documentation'],
          },
          {
            id: 'html-stage',
            title: 'HTML5',
            estimatedTime: '1 week',
            topics: [
              { id: 'html-1', name: 'HTML Structure & Tags', description: 'DOCTYPE, head, body, semantic elements' },
              { id: 'html-2', name: 'Forms & Inputs', description: 'Form elements, validation, accessibility' },
              { id: 'html-3', name: 'SEO Basics', description: 'Meta tags, headings, alt text, structured data' },
              { id: 'html-4', name: 'Accessibility (a11y)', description: 'ARIA labels, screen readers, WCAG guidelines' },
            ],
            projects: ['Resume Website in HTML'],
            resources: ['MDN HTML Guide', 'freeCodeCamp HTML/CSS'],
          },
          {
            id: 'css-stage',
            title: 'CSS3 & Styling',
            estimatedTime: '2 weeks',
            topics: [
              { id: 'css-1', name: 'CSS Selectors & Box Model', description: 'Specificity, cascade, box model' },
              { id: 'css-2', name: 'Flexbox', description: 'Flex container, flex items, alignment' },
              { id: 'css-3', name: 'CSS Grid', description: 'Grid layout, template areas, responsive grids' },
              { id: 'css-4', name: 'Responsive Design', description: 'Media queries, mobile-first approach' },
              { id: 'css-5', name: 'Animations & Transitions', description: 'keyframes, transitions, transforms' },
            ],
            projects: ['Netflix Clone UI', 'Responsive Portfolio'],
            resources: ['CSS Tricks', 'Kevin Powell YouTube', 'Flexbox Froggy'],
          },
        ],
      },
      {
        id: 'phase-2',
        title: 'Phase 2: JavaScript & React',
        color: 'bg-yellow-500',
        ringColor: 'ring-yellow-500/30',
        estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'javascript-stage',
            title: 'JavaScript (ES6+)',
            estimatedTime: '4 weeks',
            topics: [
              { id: 'js-1', name: 'Variables, Data Types & Operators', description: 'let, const, var, primitives, type coercion' },
              { id: 'js-2', name: 'Functions & Scope', description: 'Arrow functions, closures, hoisting, IIFE' },
              { id: 'js-3', name: 'Arrays & Objects (ES6+)', description: 'Destructuring, spread, map, filter, reduce' },
              { id: 'js-4', name: 'DOM Manipulation', description: 'querySelector, events, innerHTML, classList' },
              { id: 'js-5', name: 'Async JS', description: 'Promises, async/await, fetch API, error handling' },
              { id: 'js-6', name: 'OOP in JS', description: 'Classes, inheritance, prototypes, this keyword' },
              { id: 'js-7', name: 'Modules & Bundlers', description: 'import/export, CommonJS, Webpack/Vite basics' },
            ],
            projects: ['Weather App', 'Task Manager', 'Quiz Game'],
            resources: ['JavaScript.info', 'Eloquent JavaScript', 'Namaste JavaScript (YouTube)'],
          },
          {
            id: 'react-stage',
            title: 'React.js',
            estimatedTime: '4 weeks',
            topics: [
              { id: 'react-1', name: 'JSX & Components', description: 'Functional components, props, composition' },
              { id: 'react-2', name: 'Hooks', description: 'useState, useEffect, useRef, useMemo, useCallback' },
              { id: 'react-3', name: 'React Router', description: 'BrowserRouter, Routes, Link, useNavigate, useParams' },
              { id: 'react-4', name: 'Context API', description: 'createContext, useContext, Provider pattern' },
              { id: 'react-5', name: 'Redux Toolkit', description: 'Store, slices, actions, useSelector, useDispatch' },
              { id: 'react-6', name: 'Performance Optimization', description: 'React.memo, lazy loading, code splitting' },
              { id: 'react-7', name: 'Testing in React', description: 'Jest, React Testing Library basics' },
            ],
            projects: ['E-Commerce Frontend', 'Social Media UI Clone'],
            resources: ['React Official Docs', 'Scrimba React Course', 'Jack Herrington YouTube'],
          },
        ],
      },
      {
        id: 'phase-3',
        title: 'Phase 3: Backend & Database',
        color: 'bg-green-500',
        ringColor: 'ring-green-500/30',
        estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'nodejs-stage',
            title: 'Node.js & Express.js',
            estimatedTime: '3 weeks',
            topics: [
              { id: 'node-1', name: 'Node.js Fundamentals', description: 'Event loop, modules, npm, fs, path, os' },
              { id: 'node-2', name: 'Express.js Framework', description: 'Routing, middleware, request/response cycle' },
              { id: 'node-3', name: 'REST API Design', description: 'HTTP methods, status codes, RESTful conventions' },
              { id: 'node-4', name: 'Authentication & JWT', description: 'bcrypt, JWT tokens, session vs token auth' },
              { id: 'node-5', name: 'File Uploads & Multer', description: 'Handling multipart form data, Cloudinary' },
              { id: 'node-6', name: 'Error Handling', description: 'Global error handlers, custom error classes' },
            ],
            projects: ['Authentication API', 'REST API for Blog'],
            resources: ['Node.js docs', 'Express docs', 'Traversy Media Node.js crash course'],
          },
          {
            id: 'mongodb-stage',
            title: 'MongoDB & Mongoose',
            estimatedTime: '2 weeks',
            topics: [
              { id: 'mongo-1', name: 'MongoDB Basics', description: 'Documents, collections, CRUD operations' },
              { id: 'mongo-2', name: 'Mongoose ODM', description: 'Schema, models, validation, middleware' },
              { id: 'mongo-3', name: 'Aggregation Pipeline', description: '$match, $group, $project, $lookup' },
              { id: 'mongo-4', name: 'Indexing & Performance', description: 'Index types, query optimization, explain()' },
            ],
            projects: ['Blog Platform Backend', 'E-Commerce Database Design'],
            resources: ['MongoDB University', 'Mongoose docs', 'Dave Gray MongoDB tutorial'],
          },
        ],
      },
      {
        id: 'phase-4',
        title: 'Phase 4: Advanced & DevOps',
        color: 'bg-purple-500',
        ringColor: 'ring-purple-500/30',
        estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'advanced-mern',
            title: 'Advanced MERN Concepts',
            estimatedTime: '3 weeks',
            topics: [
              { id: 'adv-1', name: 'WebSockets & Socket.io', description: 'Real-time communication, rooms, events' },
              { id: 'adv-2', name: 'Redis Caching', description: 'Caching strategies, session storage, pub/sub' },
              { id: 'adv-3', name: 'Docker Basics', description: 'Containers, images, Dockerfile, docker-compose' },
              { id: 'adv-4', name: 'CI/CD Pipelines', description: 'GitHub Actions, automated testing & deployment' },
              { id: 'adv-5', name: 'Microservices Intro', description: 'Service separation, API gateway, message queues' },
              { id: 'adv-6', name: 'Testing Strategies', description: 'Unit, integration, e2e testing with Jest/Cypress' },
            ],
            projects: ['Real-time Chat Application', 'Full MERN E-Commerce'],
            resources: ['Fireship Docker course', 'Socket.io docs', 'GitHub Actions docs'],
          },
          {
            id: 'deployment-stage',
            title: 'Deployment & DevOps',
            estimatedTime: '2 weeks',
            topics: [
              { id: 'dep-1', name: 'VPS & Linux Basics', description: 'SSH, file permissions, process management' },
              { id: 'dep-2', name: 'Nginx Web Server', description: 'Reverse proxy, SSL/TLS, load balancing' },
              { id: 'dep-3', name: 'PM2 Process Manager', description: 'Running Node.js in production, clusters' },
              { id: 'dep-4', name: 'Domain & DNS', description: 'A records, CNAME, SSL certificates, Let\'s Encrypt' },
              { id: 'dep-5', name: 'Cloud Platforms', description: 'AWS EC2/S3, Vercel, Railway, Render basics' },
            ],
            projects: ['Deploy Full MERN Application on VPS'],
            resources: ['Digital Ocean tutorials', 'Vercel docs', 'Fireship deployment course'],
          },
        ],
      },
      {
        id: 'phase-5',
        title: 'Phase 5: Placement Ready',
        color: 'bg-orange-500',
        ringColor: 'ring-orange-500/30',
        estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'placement-stage',
            title: 'Placement Preparation',
            estimatedTime: '3-4 weeks',
            topics: [
              { id: 'place-1', name: 'Data Structures & Algorithms', description: 'Arrays, linked lists, trees, graphs, sorting' },
              { id: 'place-2', name: 'System Design Basics', description: 'Scalability, load balancing, database design' },
              { id: 'place-3', name: 'Resume & LinkedIn', description: 'ATS-friendly resume, LinkedIn optimization' },
              { id: 'place-4', name: 'Portfolio Projects', description: 'Selecting and presenting best projects' },
              { id: 'place-5', name: 'Mock Interviews', description: 'Technical + behavioral interview practice' },
              { id: 'place-6', name: 'Salary Negotiation', description: 'Research salaries, negotiation tactics' },
            ],
            projects: ['Open Source Contribution', 'Capstone MERN Project'],
            resources: ['LeetCode', 'Naukri.com', 'Glassdoor salary data', 'InterviewAI Mock Interviews'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. FRONTEND DEVELOPER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'frontend',
    title: 'Frontend Developer',
    category: 'development',
    icon: 'PanelTop',
    iconColor: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-500',
    cardGradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    borderColor: 'border-pink-500/30',
    difficulty: 'Beginner',
    difficultyColor: 'bg-green-500/20 text-green-400',
    duration: '4-6 months',
    salary: '₹4L - ₹15L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    description: 'Build stunning, responsive user interfaces and become a professional frontend developer.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Web Basics', color: 'bg-pink-500', ringColor: 'ring-pink-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'fe-html', title: 'HTML & Document Structure', estimatedTime: '1 week',
            topics: [
              { id: 'fe-h1', name: 'Semantic HTML5', description: 'header, main, section, article, aside, footer' },
              { id: 'fe-h2', name: 'Forms & Validation', description: 'Input types, constraints, HTML5 validation' },
              { id: 'fe-h3', name: 'Accessibility', description: 'ARIA roles, keyboard navigation, screen readers' },
            ],
            projects: ['Personal Portfolio Page'], resources: ['MDN HTML Docs', 'W3Schools HTML Tutorial'],
          },
          {
            id: 'fe-css', title: 'CSS Mastery', estimatedTime: '2 weeks',
            topics: [
              { id: 'fe-c1', name: 'Flexbox & Grid', description: 'Complete layout systems' },
              { id: 'fe-c2', name: 'CSS Variables & Custom Properties', description: 'Design tokens, theming' },
              { id: 'fe-c3', name: 'Responsive Design', description: 'Media queries, fluid layouts, clamp()' },
              { id: 'fe-c4', name: 'CSS Animations', description: 'keyframes, transitions, transforms, will-change' },
              { id: 'fe-c5', name: 'Sass/SCSS', description: 'Nesting, mixins, variables, partials' },
            ],
            projects: ['Netflix UI Clone', 'Animated Landing Page'], resources: ['CSS Tricks', 'Kevin Powell YouTube'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: JavaScript Deep Dive', color: 'bg-yellow-500', ringColor: 'ring-yellow-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'fe-js', title: 'Advanced JavaScript', estimatedTime: '4 weeks',
            topics: [
              { id: 'fe-j1', name: 'ES6+ Features', description: 'Modules, destructuring, generators, proxies' },
              { id: 'fe-j2', name: 'DOM Mastery', description: 'Virtual DOM concepts, event delegation, MutationObserver' },
              { id: 'fe-j3', name: 'Async Programming', description: 'Promises, async/await, event loop in depth' },
              { id: 'fe-j4', name: 'Browser APIs', description: 'Fetch, localStorage, IndexedDB, WebStorage' },
              { id: 'fe-j5', name: 'TypeScript', description: 'Types, interfaces, generics, decorators' },
            ],
            projects: ['Infinite Scroll App', 'Real-time Search'], resources: ['javascript.info', 'TypeScript docs'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: React Ecosystem', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'fe-react', title: 'React + State Management', estimatedTime: '4 weeks',
            topics: [
              { id: 'fe-r1', name: 'React Fundamentals', description: 'Components, hooks, props, state lifecycle' },
              { id: 'fe-r2', name: 'Advanced Hooks', description: 'Custom hooks, useReducer, useContext' },
              { id: 'fe-r3', name: 'Redux/Zustand', description: 'Global state management patterns' },
              { id: 'fe-r4', name: 'React Query/SWR', description: 'Server state, caching, mutations' },
              { id: 'fe-r5', name: 'Next.js', description: 'SSR, SSG, ISR, App Router, API Routes' },
            ],
            projects: ['Full Featured Dashboard', 'E-Commerce Frontend'], resources: ['React docs', 'Next.js docs', 'Fireship React'],
          },
          {
            id: 'fe-tools', title: 'Frontend Tools & Performance', estimatedTime: '2 weeks',
            topics: [
              { id: 'fe-t1', name: 'Vite/Webpack', description: 'Build tools, bundling, tree-shaking, HMR' },
              { id: 'fe-t2', name: 'Performance', description: 'Lighthouse, Core Web Vitals, lazy loading, code splitting' },
              { id: 'fe-t3', name: 'Testing', description: 'Jest, Vitest, React Testing Library, Cypress' },
              { id: 'fe-t4', name: 'Storybook', description: 'Component documentation, visual testing' },
            ],
            projects: ['Optimized PWA'], resources: ['web.dev', 'Vite docs'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Design & UX', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '2-3 weeks',
        stages: [
          {
            id: 'fe-design', title: 'Design Systems & UI Libraries', estimatedTime: '2 weeks',
            topics: [
              { id: 'fe-d1', name: 'Figma Basics', description: 'Design handoff, inspect mode, components' },
              { id: 'fe-d2', name: 'UI Component Libraries', description: 'Shadcn, MUI, Ant Design, Radix UI' },
              { id: 'fe-d3', name: 'Tailwind CSS', description: 'Utility-first, JIT, plugins, design tokens' },
              { id: 'fe-d4', name: 'Animation Libraries', description: 'Framer Motion, GSAP, Lottie' },
            ],
            projects: ['Design System Component Library'], resources: ['Figma tutorials', 'Shadcn UI docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '2-3 weeks',
        stages: [
          {
            id: 'fe-career', title: 'Job Preparation', estimatedTime: '2-3 weeks',
            topics: [
              { id: 'fe-p1', name: 'Portfolio Building', description: 'GitHub Pages, project selection, README' },
              { id: 'fe-p2', name: 'Frontend Interviews', description: 'JS concepts, React patterns, coding challenges' },
              { id: 'fe-p3', name: 'Open Source', description: 'Contributing to projects, issue tracking, PRs' },
            ],
            projects: ['Open Source Contribution', 'Portfolio Website'], resources: ['Frontend Interview Handbook', 'LeetCode JS challenges'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. BACKEND DEVELOPER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'backend',
    title: 'Backend Developer',
    category: 'development',
    icon: 'Server',
    iconColor: 'text-slate-300',
    gradient: 'from-slate-500 to-gray-600',
    cardGradient: 'from-slate-500/20 via-gray-500/10 to-transparent',
    borderColor: 'border-slate-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '6-9 months',
    salary: '₹5L - ₹20L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['Node.js', 'Python', 'Databases', 'APIs'],
    description: 'Build scalable server-side applications, APIs, and databases that power modern web applications.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Programming Fundamentals', color: 'bg-slate-500', ringColor: 'ring-slate-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'be-prog', title: 'Choose Your Language', estimatedTime: '4 weeks',
            topics: [
              { id: 'be-p1', name: 'Node.js / Python / Java', description: 'Pick one: Node.js (JS), Python (Django/Flask), Java (Spring)' },
              { id: 'be-p2', name: 'Data Structures', description: 'Arrays, linked lists, stacks, queues, hash maps, trees' },
              { id: 'be-p3', name: 'Algorithms', description: 'Sorting, searching, recursion, dynamic programming' },
              { id: 'be-p4', name: 'Design Patterns', description: 'Singleton, Factory, Observer, Repository pattern' },
            ],
            projects: ['CLI Tool', 'Algorithm Visualizer'], resources: ['CS50P (Python)', 'Node.js docs', 'NeetCode DSA'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Server & APIs', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'be-server', title: 'Web Servers & Frameworks', estimatedTime: '3 weeks',
            topics: [
              { id: 'be-s1', name: 'HTTP Protocol Deep Dive', description: 'Methods, status codes, headers, cookies, CORS' },
              { id: 'be-s2', name: 'REST API Design', description: 'Resources, versioning, pagination, filtering' },
              { id: 'be-s3', name: 'GraphQL', description: 'Schema, resolvers, mutations, subscriptions' },
              { id: 'be-s4', name: 'Middleware', description: 'Authentication, logging, rate limiting, compression' },
            ],
            projects: ['REST API for Blog/E-commerce'], resources: ['Express docs', 'FastAPI docs', 'REST API Tutorial'],
          },
          {
            id: 'be-auth', title: 'Authentication & Security', estimatedTime: '2 weeks',
            topics: [
              { id: 'be-a1', name: 'JWT & Sessions', description: 'Token lifecycle, refresh tokens, session management' },
              { id: 'be-a2', name: 'OAuth 2.0 & OpenID Connect', description: 'Social login, scopes, flows' },
              { id: 'be-a3', name: 'API Security', description: 'Rate limiting, input validation, SQL injection prevention' },
              { id: 'be-a4', name: 'HTTPS & TLS', description: 'Certificate management, Let\'s Encrypt, HSTS' },
            ],
            projects: ['Secure Auth System'], resources: ['OWASP Top 10', 'Auth0 docs'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Databases', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'be-sql', title: 'SQL Databases', estimatedTime: '3 weeks',
            topics: [
              { id: 'be-sql1', name: 'PostgreSQL / MySQL', description: 'CRUD, joins, indexes, transactions, ACID' },
              { id: 'be-sql2', name: 'Database Design', description: 'Normalization, ERD, relationships, foreign keys' },
              { id: 'be-sql3', name: 'ORM (Prisma / Sequelize)', description: 'Models, migrations, relations, queries' },
              { id: 'be-sql4', name: 'Query Optimization', description: 'EXPLAIN, indexes, query planner, connection pooling' },
            ],
            projects: ['Database Design for Social Network'], resources: ['PostgreSQL Tutorial', 'Prisma docs'],
          },
          {
            id: 'be-nosql', title: 'NoSQL & Caching', estimatedTime: '2 weeks',
            topics: [
              { id: 'be-ns1', name: 'MongoDB', description: 'Documents, aggregation, sharding, replication' },
              { id: 'be-ns2', name: 'Redis', description: 'Caching strategies, pub/sub, sorted sets, TTL' },
              { id: 'be-ns3', name: 'Database Selection', description: 'When to use SQL vs NoSQL vs time-series' },
            ],
            projects: ['Caching Layer for API'], resources: ['MongoDB University', 'Redis docs'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Advanced Backend', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'be-advanced', title: 'Scalability & Architecture', estimatedTime: '4 weeks',
            topics: [
              { id: 'be-adv1', name: 'Microservices Architecture', description: 'Service decomposition, API gateway, service mesh' },
              { id: 'be-adv2', name: 'Message Queues', description: 'RabbitMQ, Kafka, pub/sub patterns, event-driven arch' },
              { id: 'be-adv3', name: 'Docker & Kubernetes', description: 'Containerization, orchestration, scaling' },
              { id: 'be-adv4', name: 'System Design', description: 'Load balancing, CDN, horizontal scaling, CAP theorem' },
              { id: 'be-adv5', name: 'Monitoring & Logging', description: 'Prometheus, Grafana, ELK stack, alerting' },
            ],
            projects: ['Microservices E-Commerce Platform'], resources: ['System Design Primer', 'Docker docs', 'Kafka docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Placement Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'be-placement', title: 'Backend Interviews & Career', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'be-pl1', name: 'System Design Interviews', description: 'HLD, LLD, case studies (Twitter, URL shortener)' },
              { id: 'be-pl2', name: 'DSA for Interviews', description: 'Top 150 LeetCode questions, patterns' },
              { id: 'be-pl3', name: 'Backend Interview Questions', description: 'REST vs GraphQL, database transactions, caching' },
              { id: 'be-pl4', name: 'Resume & GitHub', description: 'Backend-focused resume, pinned repos' },
            ],
            projects: ['URL Shortener (system design)', 'Open Source Backend Contribution'], resources: ['Grokking System Design', 'NeetCode', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. FULL STACK DEVELOPER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    category: 'development',
    icon: 'LayoutTemplate',
    iconColor: 'text-violet-400',
    gradient: 'from-violet-500 to-purple-600',
    cardGradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    borderColor: 'border-violet-500/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '10-12 months',
    salary: '₹7L - ₹25L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    description: 'Become a complete full stack developer capable of building entire products independently.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: HTML/CSS/JS Mastery', color: 'bg-violet-500', ringColor: 'ring-violet-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'fs-basics', title: 'Web Fundamentals', estimatedTime: '6 weeks',
            topics: [
              { id: 'fs-1', name: 'HTML5 + CSS3 + JavaScript', description: 'Complete web foundation' },
              { id: 'fs-2', name: 'TypeScript', description: 'Static typing for large applications' },
              { id: 'fs-3', name: 'Git & GitHub', description: 'Version control workflows, collaboration' },
              { id: 'fs-4', name: 'Command Line & Linux', description: 'Essential developer tools' },
            ],
            projects: ['Responsive Landing Page', 'JavaScript Game'], resources: ['The Odin Project', 'FreeCodeCamp'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Modern Frontend', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'fs-frontend', title: 'React & Next.js', estimatedTime: '8 weeks',
            topics: [
              { id: 'fs-f1', name: 'React (Hooks, Context, Router)', description: 'Complete React ecosystem' },
              { id: 'fs-f2', name: 'Next.js 14+ (App Router)', description: 'SSR, SSG, ISR, server components' },
              { id: 'fs-f3', name: 'State Management', description: 'Redux Toolkit, Zustand, React Query' },
              { id: 'fs-f4', name: 'UI Libraries + Animations', description: 'Shadcn, Tailwind, Framer Motion' },
            ],
            projects: ['Full SaaS Frontend', 'Dashboard Application'], resources: ['React docs', 'Next.js docs'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Backend & Databases', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'fs-backend', title: 'Node.js + PostgreSQL', estimatedTime: '8 weeks',
            topics: [
              { id: 'fs-b1', name: 'Node.js + Express or Fastify', description: 'Server-side JavaScript' },
              { id: 'fs-b2', name: 'PostgreSQL + Prisma ORM', description: 'Relational data management' },
              { id: 'fs-b3', name: 'Authentication (JWT + OAuth)', description: 'Secure user management' },
              { id: 'fs-b4', name: 'File Storage (S3/Cloudinary)', description: 'Media handling in production' },
            ],
            projects: ['Full Stack SaaS Application'], resources: ['Node.js docs', 'Prisma docs', 'PostgreSQL docs'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: DevOps & Deployment', color: 'bg-teal-500', ringColor: 'ring-teal-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'fs-devops', title: 'Deployment & Infrastructure', estimatedTime: '3 weeks',
            topics: [
              { id: 'fs-d1', name: 'Docker & Docker Compose', description: 'Container-based deployment' },
              { id: 'fs-d2', name: 'CI/CD (GitHub Actions)', description: 'Automated testing and deployment' },
              { id: 'fs-d3', name: 'Cloud Deployment', description: 'AWS, Vercel, Railway, DigitalOcean' },
              { id: 'fs-d4', name: 'Domain, SSL, Reverse Proxy', description: 'Production web server setup' },
            ],
            projects: ['Deploy Full Stack App to Production'], resources: ['Docker docs', 'GitHub Actions docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Professional Level', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'fs-pro', title: 'Architecture & Interviews', estimatedTime: '4 weeks',
            topics: [
              { id: 'fs-p1', name: 'System Design', description: 'Scalable architectures, database design' },
              { id: 'fs-p2', name: 'Technical Interviews', description: 'Full stack interview patterns' },
              { id: 'fs-p3', name: 'Open Source Contributions', description: 'Build credibility, get visibility' },
              { id: 'fs-p4', name: 'Freelance / Startup Path', description: 'Build and ship your own products' },
            ],
            projects: ['Complete SaaS Product Launch', 'Open Source Library'], resources: ['Grokking System Design', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. AI ENGINEER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    category: 'ai-data',
    icon: 'Bot',
    iconColor: 'text-purple-400',
    gradient: 'from-purple-500 to-indigo-600',
    cardGradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    borderColor: 'border-purple-500/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '10-14 months',
    salary: '₹12L - ₹40L',
    demand: 'Explosive',
    demandColor: 'text-purple-400',
    tags: ['Python', 'LLMs', 'LangChain', 'RAG'],
    description: 'Build production AI applications using LLMs, RAG systems, AI agents, and modern AI infrastructure.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Python & Math Foundation', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'ai-python', title: 'Python for AI', estimatedTime: '3 weeks',
            topics: [
              { id: 'ai-py1', name: 'Python Fundamentals', description: 'Variables, functions, OOP, file I/O, decorators' },
              { id: 'ai-py2', name: 'NumPy', description: 'Arrays, broadcasting, vectorization, linear algebra ops' },
              { id: 'ai-py3', name: 'Pandas', description: 'DataFrames, data cleaning, groupby, merge, visualization' },
              { id: 'ai-py4', name: 'Matplotlib/Seaborn', description: 'Data visualization, charts, statistical plots' },
            ],
            projects: ['Data Analysis Project', 'Python Automation Script'], resources: ['CS50P', 'Kaggle courses', 'NumPy docs'],
          },
          {
            id: 'ai-math', title: 'Mathematics for AI', estimatedTime: '4 weeks',
            topics: [
              { id: 'ai-m1', name: 'Linear Algebra', description: 'Vectors, matrices, eigenvalues, SVD, PCA' },
              { id: 'ai-m2', name: 'Calculus', description: 'Derivatives, chain rule, gradient descent, backpropagation' },
              { id: 'ai-m3', name: 'Statistics & Probability', description: 'Distributions, Bayes theorem, hypothesis testing' },
              { id: 'ai-m4', name: 'Information Theory', description: 'Entropy, cross-entropy, KL divergence' },
            ],
            projects: ['Statistical Analysis Dashboard'], resources: ['3Blue1Brown', 'Khan Academy', 'StatQuest YouTube'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Machine Learning', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'ai-ml', title: 'Classical Machine Learning', estimatedTime: '5 weeks',
            topics: [
              { id: 'ai-ml1', name: 'Supervised Learning', description: 'Regression, classification, SVM, decision trees, ensembles' },
              { id: 'ai-ml2', name: 'Unsupervised Learning', description: 'Clustering (K-means, DBSCAN), dimensionality reduction' },
              { id: 'ai-ml3', name: 'Scikit-learn', description: 'Pipeline, preprocessing, model evaluation, cross-validation' },
              { id: 'ai-ml4', name: 'Feature Engineering', description: 'Encoding, scaling, feature selection, PCA' },
              { id: 'ai-ml5', name: 'MLflow & Experiment Tracking', description: 'Tracking experiments, model registry' },
            ],
            projects: ['House Price Prediction', 'Customer Churn Model'], resources: ['Coursera ML (Andrew Ng)', 'Kaggle competitions'],
          },
          {
            id: 'ai-dl', title: 'Deep Learning', estimatedTime: '5 weeks',
            topics: [
              { id: 'ai-dl1', name: 'Neural Networks', description: 'Perceptrons, feedforward, backpropagation, activation functions' },
              { id: 'ai-dl2', name: 'CNNs', description: 'Conv layers, pooling, ResNet, transfer learning for images' },
              { id: 'ai-dl3', name: 'RNNs & LSTMs', description: 'Sequence modeling, time series, text generation' },
              { id: 'ai-dl4', name: 'Transformers', description: 'Attention mechanism, BERT, GPT architecture' },
              { id: 'ai-dl5', name: 'PyTorch', description: 'Tensors, autograd, custom datasets, training loops' },
            ],
            projects: ['Image Classifier', 'Text Sentiment Analyzer'], resources: ['Fast.ai', 'd2l.ai', 'Andrej Karpathy YouTube'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: LLMs & Generative AI', color: 'bg-violet-500', ringColor: 'ring-violet-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'ai-llm', title: 'Large Language Models', estimatedTime: '4 weeks',
            topics: [
              { id: 'ai-l1', name: 'LLM Architecture', description: 'Transformer architecture, attention heads, tokenization' },
              { id: 'ai-l2', name: 'Prompt Engineering', description: 'Few-shot, chain-of-thought, ReAct, system prompts' },
              { id: 'ai-l3', name: 'OpenAI & Gemini APIs', description: 'Chat completions, function calling, embeddings' },
              { id: 'ai-l4', name: 'Fine-tuning', description: 'LoRA, QLoRA, PEFT, instruction tuning, DPO' },
              { id: 'ai-l5', name: 'HuggingFace', description: 'Transformers library, model hub, inference API' },
            ],
            projects: ['Custom Chatbot', 'Resume Analyzer with AI'], resources: ['OpenAI Cookbook', 'HuggingFace course', 'LLM course'],
          },
          {
            id: 'ai-rag', title: 'RAG & AI Agents', estimatedTime: '4 weeks',
            topics: [
              { id: 'ai-r1', name: 'Vector Databases', description: 'Pinecone, ChromaDB, Weaviate, embeddings, similarity search' },
              { id: 'ai-r2', name: 'RAG Architecture', description: 'Indexing, retrieval, generation, chunking strategies' },
              { id: 'ai-r3', name: 'LangChain', description: 'Chains, agents, tools, memory, retrievers' },
              { id: 'ai-r4', name: 'LlamaIndex', description: 'Document indexing, query engines, knowledge graphs' },
              { id: 'ai-r5', name: 'AI Agents', description: 'ReAct, tool use, multi-agent systems, CrewAI' },
            ],
            projects: ['RAG-based Document Q&A', 'AI Agent with Tools'], resources: ['LangChain docs', 'LlamaIndex docs', 'Deeplearning.ai courses'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: MLOps & Deployment', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'ai-mlops', title: 'MLOps & Production AI', estimatedTime: '4 weeks',
            topics: [
              { id: 'ai-op1', name: 'MLOps Fundamentals', description: 'CI/CD for ML, data versioning, model versioning' },
              { id: 'ai-op2', name: 'Model Serving', description: 'FastAPI, BentoML, TorchServe, Triton Inference' },
              { id: 'ai-op3', name: 'Monitoring AI Systems', description: 'Model drift, data drift, Evidently AI, Prometheus' },
              { id: 'ai-op4', name: 'Cloud AI Services', description: 'AWS SageMaker, GCP Vertex AI, Azure ML' },
              { id: 'ai-op5', name: 'Evaluation Frameworks', description: 'RAGAS, TruLens, LangSmith, AI guardrails' },
            ],
            projects: ['Production AI API with Monitoring', 'AI Interview Assistant'], resources: ['Made With ML', 'MLflow docs', 'AWS SageMaker docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: AI Career Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'ai-career', title: 'Portfolio & Interviews', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'ai-c1', name: 'AI Portfolio Projects', description: 'Showcasing production-ready AI projects' },
              { id: 'ai-c2', name: 'ML Interview Prep', description: 'ML concepts, coding, system design for AI' },
              { id: 'ai-c3', name: 'Research Papers', description: 'Reading and implementing papers, arXiv, Arxiv Sanity' },
              { id: 'ai-c4', name: 'Kaggle Competitions', description: 'Build credentials with competition rankings' },
            ],
            projects: ['End-to-End AI Product', 'Research Paper Implementation'], resources: ['Papers with Code', 'Kaggle', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. MACHINE LEARNING ENGINEER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'ai-data',
    icon: 'BrainCircuit',
    iconColor: 'text-indigo-400',
    gradient: 'from-indigo-500 to-blue-600',
    cardGradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    borderColor: 'border-indigo-500/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '12-16 months',
    salary: '₹15L - ₹45L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['Python', 'PyTorch', 'MLOps', 'Scikit-learn'],
    description: 'Build, train, and deploy production machine learning models at scale.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Foundations', color: 'bg-indigo-500', ringColor: 'ring-indigo-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'mle-foundation', title: 'Python + Math + Stats', estimatedTime: '8 weeks',
            topics: [
              { id: 'mle-1', name: 'Python for Data Science', description: 'NumPy, Pandas, Matplotlib, Scipy' },
              { id: 'mle-2', name: 'Linear Algebra & Calculus', description: 'For understanding ML algorithms deeply' },
              { id: 'mle-3', name: 'Statistics & Probability', description: 'Distributions, inference, Bayesian thinking' },
              { id: 'mle-4', name: 'SQL & Data Engineering Basics', description: 'Querying, joins, data pipelines' },
            ],
            projects: ['EDA Project on Real Dataset'], resources: ['Coursera Math for ML', 'Kaggle Python course'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: ML Algorithms', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '10-12 weeks',
        stages: [
          {
            id: 'mle-algos', title: 'Classical ML + Deep Learning', estimatedTime: '10 weeks',
            topics: [
              { id: 'mle-a1', name: 'Regression & Classification', description: 'Linear, logistic, SVM, naive Bayes' },
              { id: 'mle-a2', name: 'Tree-based Models', description: 'Decision trees, Random Forest, XGBoost, LightGBM' },
              { id: 'mle-a3', name: 'Neural Networks & Deep Learning', description: 'MLP, CNNs, RNNs, Transformers' },
              { id: 'mle-a4', name: 'Model Evaluation', description: 'Cross-validation, bias-variance tradeoff, metrics' },
              { id: 'mle-a5', name: 'Hyperparameter Tuning', description: 'Grid search, Optuna, AutoML' },
            ],
            projects: ['Fraud Detection System', 'Image Recognition Model'], resources: ['Hands-On ML Book', 'Fast.ai', 'Kaggle competitions'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: MLOps & Scale', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'mle-mlops', title: 'Production ML Systems', estimatedTime: '6 weeks',
            topics: [
              { id: 'mle-o1', name: 'Data Pipelines', description: 'Airflow, Prefect, dbt, feature stores' },
              { id: 'mle-o2', name: 'Experiment Tracking', description: 'MLflow, Weights & Biases, DVC' },
              { id: 'mle-o3', name: 'Model Deployment', description: 'FastAPI, Docker, Kubernetes, model serving' },
              { id: 'mle-o4', name: 'CI/CD for ML', description: 'Testing models, automated retraining, GitHub Actions' },
              { id: 'mle-o5', name: 'Feature Engineering at Scale', description: 'Feast, Tecton, online/offline stores' },
            ],
            projects: ['End-to-End ML Pipeline', 'Production ML API'], resources: ['Chip Huyen MLSys book', 'MLOps Community'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Specialization', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'mle-spec', title: 'LLMs & Generative AI', estimatedTime: '6 weeks',
            topics: [
              { id: 'mle-s1', name: 'Large Language Models', description: 'Architecture, pre-training, fine-tuning' },
              { id: 'mle-s2', name: 'Fine-tuning Techniques', description: 'LoRA, QLoRA, RLHF, instruction tuning' },
              { id: 'mle-s3', name: 'Distributed Training', description: 'Multi-GPU, PyTorch DDP, DeepSpeed, FSDP' },
              { id: 'mle-s4', name: 'Model Optimization', description: 'Quantization, pruning, distillation, ONNX' },
            ],
            projects: ['Fine-tuned Domain LLM', 'Distributed Training Pipeline'], resources: ['HuggingFace docs', 'DeepSpeed docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career & Research', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'mle-career', title: 'Career Preparation', estimatedTime: '4 weeks',
            topics: [
              { id: 'mle-c1', name: 'ML System Design', description: 'Designing recommendation systems, search engines' },
              { id: 'mle-c2', name: 'ML Interviews', description: 'Coding + ML concept + system design rounds' },
              { id: 'mle-c3', name: 'Research & Papers', description: 'Staying current with ML research, NeurIPS, ICML' },
              { id: 'mle-c4', name: 'Kaggle & Competitions', description: 'Building competitive ML credentials' },
            ],
            projects: ['Research Paper Replication', 'Kaggle Gold Medal Project'], resources: ['Papers with Code', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. DATA SCIENTIST
  // ─────────────────────────────────────────────────────────────
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'ai-data',
    icon: 'ChartScatter',
    iconColor: 'text-teal-400',
    gradient: 'from-teal-500 to-cyan-500',
    cardGradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
    borderColor: 'border-teal-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '8-12 months',
    salary: '₹8L - ₹30L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['Python', 'SQL', 'Statistics', 'ML'],
    description: 'Extract insights from data, build predictive models, and communicate findings to drive business decisions.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Data Foundations', color: 'bg-teal-500', ringColor: 'ring-teal-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'ds-found', title: 'Python + SQL + Statistics', estimatedTime: '6 weeks',
            topics: [
              { id: 'ds-1', name: 'Python for Data Analysis', description: 'NumPy, Pandas, data wrangling' },
              { id: 'ds-2', name: 'SQL for Data Scientists', description: 'Complex queries, window functions, CTEs' },
              { id: 'ds-3', name: 'Statistics Fundamentals', description: 'Descriptive stats, distributions, hypothesis testing' },
              { id: 'ds-4', name: 'Exploratory Data Analysis', description: 'Data profiling, outliers, missing data, correlations' },
            ],
            projects: ['EDA on Real-World Dataset'], resources: ['Kaggle courses', 'Mode SQL tutorial', 'StatQuest'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: ML & Modeling', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'ds-ml', title: 'Machine Learning for Data Science', estimatedTime: '8 weeks',
            topics: [
              { id: 'ds-m1', name: 'Supervised Learning', description: 'Regression, classification, model selection' },
              { id: 'ds-m2', name: 'Feature Engineering', description: 'Encoding, scaling, creating features' },
              { id: 'ds-m3', name: 'Model Evaluation', description: 'Cross-validation, RMSE, AUC-ROC, confusion matrix' },
              { id: 'ds-m4', name: 'A/B Testing', description: 'Experimental design, statistical power, p-values' },
              { id: 'ds-m5', name: 'Time Series Analysis', description: 'ARIMA, Prophet, seasonality, forecasting' },
            ],
            projects: ['Sales Forecasting Model', 'Customer Segmentation'], resources: ['Scikit-learn docs', 'Kaggle competitions'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Data Visualization & Storytelling', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'ds-viz', title: 'Visualization & Communication', estimatedTime: '3 weeks',
            topics: [
              { id: 'ds-v1', name: 'Matplotlib & Seaborn', description: 'Static charts, statistical plots' },
              { id: 'ds-v2', name: 'Plotly & Dash', description: 'Interactive visualizations, dashboards' },
              { id: 'ds-v3', name: 'Tableau / Power BI', description: 'Business intelligence tools' },
              { id: 'ds-v4', name: 'Data Storytelling', description: 'Communicating insights to non-technical stakeholders' },
            ],
            projects: ['Interactive Business Dashboard'], resources: ['Tableau Public', 'Plotly docs', 'Storytelling with Data book'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Advanced Analytics', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'ds-advanced', title: 'NLP & Deep Learning', estimatedTime: '4 weeks',
            topics: [
              { id: 'ds-a1', name: 'NLP Fundamentals', description: 'Text preprocessing, TF-IDF, word embeddings' },
              { id: 'ds-a2', name: 'Transformer Models for NLP', description: 'BERT, sentiment analysis, text classification' },
              { id: 'ds-a3', name: 'Computer Vision', description: 'CNNs for image analysis, object detection' },
              { id: 'ds-a4', name: 'Big Data Tools', description: 'PySpark, Hadoop basics, distributed computing' },
            ],
            projects: ['NLP Sentiment Analysis Product', 'Big Data Pipeline'], resources: ['HuggingFace NLP course', 'PySpark docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'ds-career', title: 'DS Interviews & Portfolio', estimatedTime: '3 weeks',
            topics: [
              { id: 'ds-c1', name: 'Data Science Interviews', description: 'Statistics, SQL, ML concepts, case studies' },
              { id: 'ds-c2', name: 'Business Case Studies', description: 'Product metrics, data-driven decisions' },
              { id: 'ds-c3', name: 'Kaggle Portfolio', description: 'Competition notebooks, dataset exploration' },
            ],
            projects: ['Capstone Data Science Project', 'Kaggle Notebook Portfolio'], resources: ['Ace the Data Science Interview book', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. DATA ANALYST
  // ─────────────────────────────────────────────────────────────
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'ai-data',
    icon: 'TrendingUp',
    iconColor: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    cardGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-amber-500/30',
    difficulty: 'Beginner',
    difficultyColor: 'bg-green-500/20 text-green-400',
    duration: '4-6 months',
    salary: '₹4L - ₹12L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['SQL', 'Excel', 'Python', 'Power BI'],
    description: 'Analyze data to find patterns, create reports, and drive business decisions through insights.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Core Tools', color: 'bg-amber-500', ringColor: 'ring-amber-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'da-tools', title: 'Excel + SQL + Python', estimatedTime: '4 weeks',
            topics: [
              { id: 'da-1', name: 'Excel & Spreadsheets', description: 'VLOOKUP, pivot tables, charts, formulas' },
              { id: 'da-2', name: 'SQL Fundamentals', description: 'SELECT, WHERE, JOIN, GROUP BY, subqueries' },
              { id: 'da-3', name: 'Python Basics', description: 'Pandas, data manipulation, basic visualization' },
              { id: 'da-4', name: 'Data Cleaning', description: 'Handling nulls, duplicates, outliers, standardization' },
            ],
            projects: ['Sales Analysis Report'], resources: ['Google Data Analytics Certificate', 'Mode SQL tutorial'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Visualization & BI', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'da-viz', title: 'BI Tools & Dashboards', estimatedTime: '4 weeks',
            topics: [
              { id: 'da-v1', name: 'Power BI', description: 'Reports, dashboards, DAX, Power Query' },
              { id: 'da-v2', name: 'Tableau', description: 'Workbooks, calculated fields, Tableau Public' },
              { id: 'da-v3', name: 'Google Looker Studio', description: 'Free BI tool, data connectors' },
              { id: 'da-v4', name: 'Dashboard Design Principles', description: 'Color theory, layout, KPIs, storytelling' },
            ],
            projects: ['Interactive Sales Dashboard', 'Marketing Analytics Dashboard'], resources: ['Power BI guided learning', 'Tableau Public tutorials'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Statistics & Advanced SQL', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'da-stats', title: 'Statistical Analysis', estimatedTime: '3 weeks',
            topics: [
              { id: 'da-s1', name: 'Descriptive Statistics', description: 'Mean, median, variance, standard deviation, percentiles' },
              { id: 'da-s2', name: 'A/B Testing', description: 'Hypothesis testing, t-tests, p-values, statistical significance' },
              { id: 'da-s3', name: 'Advanced SQL', description: 'Window functions, CTEs, recursive queries, performance' },
              { id: 'da-s4', name: 'Cohort Analysis', description: 'User retention, funnel analysis, LTV calculation' },
            ],
            projects: ['A/B Test Analysis', 'User Retention Dashboard'], resources: ['SQL for Analytics book', 'Statistics course Coursera'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Domain Expertise', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'da-domain', title: 'Business Intelligence & Domain Knowledge', estimatedTime: '3 weeks',
            topics: [
              { id: 'da-d1', name: 'Product Analytics', description: 'DAU, MAU, retention, churn, NPS' },
              { id: 'da-d2', name: 'Marketing Analytics', description: 'Attribution, CAC, ROAS, campaign performance' },
              { id: 'da-d3', name: 'Financial Analytics', description: 'P&L analysis, forecasting, budget variance' },
              { id: 'da-d4', name: 'Google Analytics 4', description: 'Web analytics, events, conversions, attribution' },
            ],
            projects: ['End-to-End Product Analytics Report'], resources: ['Google Analytics Certification', 'Lean Analytics book'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '2-3 weeks',
        stages: [
          {
            id: 'da-career', title: 'DA Interviews', estimatedTime: '2-3 weeks',
            topics: [
              { id: 'da-c1', name: 'SQL Interview Questions', description: 'Top 50 SQL interview problems' },
              { id: 'da-c2', name: 'Case Study Interviews', description: 'Business problem analysis, stakeholder questions' },
              { id: 'da-c3', name: 'Portfolio Projects', description: 'End-to-end analysis projects on GitHub' },
            ],
            projects: ['Portfolio on GitHub/Tableau Public'], resources: ['StrataScratch SQL', 'DataLemur', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. DEVOPS ENGINEER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'devops',
    title: 'DevOps Engineer',
    category: 'cloud',
    icon: 'GitMerge',
    iconColor: 'text-orange-400',
    gradient: 'from-orange-500 to-red-500',
    cardGradient: 'from-orange-500/20 via-red-500/10 to-transparent',
    borderColor: 'border-orange-500/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '10-14 months',
    salary: '₹10L - ₹35L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    description: 'Bridge development and operations by automating deployments, infrastructure, and monitoring.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Linux & Networking', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'devops-linux', title: 'Linux & Shell Scripting', estimatedTime: '4 weeks',
            topics: [
              { id: 'dv-1', name: 'Linux Fundamentals', description: 'File system, permissions, processes, services, cron' },
              { id: 'dv-2', name: 'Shell Scripting (Bash)', description: 'Variables, loops, functions, script automation' },
              { id: 'dv-3', name: 'Networking Basics', description: 'TCP/IP, DNS, HTTP, SSH, firewalls, subnetting' },
              { id: 'dv-4', name: 'Git Advanced', description: 'Branching strategies, GitFlow, rebase, hooks' },
            ],
            projects: ['System Monitoring Script', 'Auto-Backup Script'], resources: ['Linux Command Line book', 'Linux Foundation courses'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Containers & Orchestration', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'devops-docker', title: 'Docker & Kubernetes', estimatedTime: '6 weeks',
            topics: [
              { id: 'dv-d1', name: 'Docker', description: 'Images, containers, Dockerfile, Docker Compose, registries' },
              { id: 'dv-d2', name: 'Kubernetes', description: 'Pods, deployments, services, ingress, ConfigMaps, secrets' },
              { id: 'dv-d3', name: 'Helm', description: 'Package manager for Kubernetes, charts, values' },
              { id: 'dv-d4', name: 'Service Mesh', description: 'Istio, Linkerd basics, traffic management' },
            ],
            projects: ['Containerized Application Deployment', 'K8s Cluster Setup'], resources: ['Docker docs', 'Kubernetes.io', 'KodeKloud'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: CI/CD & IaC', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'devops-cicd', title: 'CI/CD Pipelines', estimatedTime: '3 weeks',
            topics: [
              { id: 'dv-c1', name: 'Jenkins', description: 'Pipelines as code, Jenkinsfile, agents, plugins' },
              { id: 'dv-c2', name: 'GitHub Actions', description: 'Workflows, jobs, steps, secrets, reusable workflows' },
              { id: 'dv-c3', name: 'GitLab CI', description: 'Stages, artifacts, environments, runners' },
              { id: 'dv-c4', name: 'ArgoCD', description: 'GitOps, application sync, rollback' },
            ],
            projects: ['Full CI/CD Pipeline for App'], resources: ['Jenkins docs', 'GitHub Actions docs'],
          },
          {
            id: 'devops-iac', title: 'Infrastructure as Code', estimatedTime: '3 weeks',
            topics: [
              { id: 'dv-i1', name: 'Terraform', description: 'Providers, resources, state, modules, workspaces' },
              { id: 'dv-i2', name: 'Ansible', description: 'Playbooks, roles, inventory, idempotency' },
              { id: 'dv-i3', name: 'Pulumi', description: 'Infrastructure as code in programming languages' },
            ],
            projects: ['AWS Infrastructure with Terraform'], resources: ['Terraform docs', 'Ansible docs'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Cloud & Monitoring', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'devops-cloud', title: 'Cloud Platforms', estimatedTime: '4 weeks',
            topics: [
              { id: 'dv-cl1', name: 'AWS Core Services', description: 'EC2, S3, RDS, Lambda, VPC, IAM, EKS, ECS' },
              { id: 'dv-cl2', name: 'Azure / GCP Basics', description: 'Multi-cloud concepts, core services comparison' },
              { id: 'dv-cl3', name: 'Monitoring & Alerting', description: 'Prometheus, Grafana, Loki, PagerDuty, CloudWatch' },
              { id: 'dv-cl4', name: 'Security & Compliance', description: 'DevSecOps, SAST/DAST, secret management, Vault' },
            ],
            projects: ['Production Deployment Pipeline', 'Monitoring Dashboard'], resources: ['AWS free tier', 'A Cloud Guru', 'Prometheus docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: DevOps Career', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'devops-career', title: 'Certifications & Interviews', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'dv-ca1', name: 'AWS Solutions Architect / CKA', description: 'Industry certifications that boost career' },
              { id: 'dv-ca2', name: 'DevOps Interview Questions', description: 'Docker, K8s, CI/CD, system design' },
              { id: 'dv-ca3', name: 'SRE Concepts', description: 'SLO/SLI/SLA, error budgets, blameless postmortems' },
            ],
            projects: ['Full Production DevOps Project', 'Open Source DevOps Tool'], resources: ['KodeKloud exams', 'InterviewAI DevOps Q&A'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. CLOUD ENGINEER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    category: 'cloud',
    icon: 'Cloud',
    iconColor: 'text-sky-400',
    gradient: 'from-sky-400 to-blue-600',
    cardGradient: 'from-sky-400/20 via-blue-500/10 to-transparent',
    borderColor: 'border-sky-400/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '8-12 months',
    salary: '₹10L - ₹30L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['AWS', 'Azure', 'GCP', 'Terraform'],
    description: 'Design, implement, and manage cloud infrastructure for scalable, reliable applications.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Cloud Fundamentals', color: 'bg-sky-500', ringColor: 'ring-sky-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'ce-basics', title: 'Linux + Networking + Git', estimatedTime: '4 weeks',
            topics: [
              { id: 'ce-1', name: 'Linux Administration', description: 'Commands, file system, processes, networking' },
              { id: 'ce-2', name: 'Networking', description: 'VPC, subnets, routing, firewalls, DNS, load balancers' },
              { id: 'ce-3', name: 'Scripting', description: 'Bash + Python for automation' },
            ],
            projects: ['Linux Administration Tasks'], resources: ['Linux Foundation', 'Networking basics Udemy'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: AWS Mastery', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'ce-aws', title: 'AWS Core Services', estimatedTime: '8 weeks',
            topics: [
              { id: 'ce-a1', name: 'Compute: EC2, Lambda, ECS, EKS', description: 'Virtual machines, serverless, containers' },
              { id: 'ce-a2', name: 'Storage: S3, EFS, EBS', description: 'Object, file, block storage' },
              { id: 'ce-a3', name: 'Networking: VPC, ALB, CloudFront', description: 'Virtual networks, CDN, load balancing' },
              { id: 'ce-a4', name: 'Databases: RDS, DynamoDB, ElastiCache', description: 'Managed databases and caching' },
              { id: 'ce-a5', name: 'Security: IAM, KMS, GuardDuty', description: 'Identity, encryption, threat detection' },
              { id: 'ce-a6', name: 'DevOps: CodePipeline, CloudFormation', description: 'CI/CD and infrastructure as code on AWS' },
            ],
            projects: ['3-Tier AWS Architecture', 'Serverless API on Lambda'], resources: ['AWS free tier', 'AWS docs', 'A Cloud Guru'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Multi-Cloud & IaC', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'ce-iac', title: 'Terraform & Multi-Cloud', estimatedTime: '4 weeks',
            topics: [
              { id: 'ce-i1', name: 'Terraform Advanced', description: 'Modules, state management, workspaces, remote state' },
              { id: 'ce-i2', name: 'Azure Fundamentals', description: 'Azure services comparison with AWS' },
              { id: 'ce-i3', name: 'GCP Fundamentals', description: 'GCP services, BigQuery, GKE, Cloud Run' },
              { id: 'ce-i4', name: 'Cloud Cost Optimization', description: 'Reserved instances, spot instances, tagging, budgets' },
            ],
            projects: ['Multi-Cloud Infrastructure with Terraform'], resources: ['Terraform docs', 'Azure learn', 'GCP training'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Architecture & Security', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'ce-arch', title: 'Cloud Architecture Patterns', estimatedTime: '4 weeks',
            topics: [
              { id: 'ce-ar1', name: 'Well-Architected Framework', description: 'Reliability, security, cost, performance, sustainability' },
              { id: 'ce-ar2', name: 'Disaster Recovery', description: 'RTO/RPO, backup strategies, multi-region' },
              { id: 'ce-ar3', name: 'Cloud Security', description: 'Zero trust, encryption at rest/transit, compliance' },
              { id: 'ce-ar4', name: 'FinOps', description: 'Cloud cost management, tagging, budget alerts' },
            ],
            projects: ['HA Multi-Region Architecture Design'], resources: ['AWS Well-Architected docs', 'Cloud Security Alliance'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Certifications & Career', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'ce-cert', title: 'Certifications & Interviews', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'ce-c1', name: 'AWS SAA / DVA / SAP', description: 'Associate and Professional level certifications' },
              { id: 'ce-c2', name: 'GCP ACE / Azure AZ-900', description: 'Multi-cloud certifications' },
              { id: 'ce-c3', name: 'Cloud Interview Prep', description: 'Architecture questions, service comparisons, scenarios' },
            ],
            projects: ['Cloud Architecture Portfolio', 'Open Source Cloud Tool'], resources: ['AWS exam guide', 'ExamPro', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 11. CYBER SECURITY ENGINEER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cybersecurity',
    title: 'Cyber Security Engineer',
    category: 'security',
    icon: 'ShieldCheck',
    iconColor: 'text-red-400',
    gradient: 'from-red-500 to-rose-600',
    cardGradient: 'from-red-500/20 via-rose-500/10 to-transparent',
    borderColor: 'border-red-500/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '10-14 months',
    salary: '₹8L - ₹25L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['Linux', 'Networking', 'SIEM', 'Penetration Testing'],
    description: 'Protect organizations from cyber threats through security architecture, monitoring, and incident response.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Networking & OS Security', color: 'bg-red-500', ringColor: 'ring-red-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'cs-net', title: 'Networking & Operating Systems', estimatedTime: '6 weeks',
            topics: [
              { id: 'cs-1', name: 'TCP/IP & Network Protocols', description: 'OSI model, TCP/UDP, ICMP, DNS, DHCP, ARP' },
              { id: 'cs-2', name: 'Linux Security', description: 'Permissions, sudo, SELinux, AppArmor, auditd' },
              { id: 'cs-3', name: 'Windows Security', description: 'Active Directory, GPO, Event Viewer, PowerShell' },
              { id: 'cs-4', name: 'Cryptography', description: 'Symmetric/asymmetric encryption, PKI, certificates, hashing' },
            ],
            projects: ['Home Lab Setup', 'Network Security Scanner'], resources: ['Professor Messer', 'TryHackMe basics', 'CompTIA Security+'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Offensive Security', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'cs-offensive', title: 'Penetration Testing & Ethical Hacking', estimatedTime: '8 weeks',
            topics: [
              { id: 'cs-o1', name: 'Reconnaissance', description: 'OSINT, Shodan, theHarvester, Maltego, passive/active recon' },
              { id: 'cs-o2', name: 'Vulnerability Scanning', description: 'Nmap, Nessus, OpenVAS, Nikto' },
              { id: 'cs-o3', name: 'Exploitation', description: 'Metasploit, Burp Suite, SQLmap, payload generation' },
              { id: 'cs-o4', name: 'Web Application Security', description: 'OWASP Top 10, XSS, SQLi, IDOR, CSRF, SSRF' },
              { id: 'cs-o5', name: 'Post-Exploitation', description: 'Privilege escalation, lateral movement, persistence' },
            ],
            projects: ['CTF Challenges', 'DVWA Penetration Test'], resources: ['TryHackMe', 'HackTheBox', 'PortSwigger Web Security Academy'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Defensive Security', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'cs-defensive', title: 'SOC & Blue Team', estimatedTime: '6 weeks',
            topics: [
              { id: 'cs-d1', name: 'SIEM (Splunk / Elastic)', description: 'Log management, alerting, threat detection' },
              { id: 'cs-d2', name: 'Incident Response', description: 'IR lifecycle, playbooks, forensics, chain of custody' },
              { id: 'cs-d3', name: 'Threat Intelligence', description: 'IOCs, TTPs, MITRE ATT&CK framework' },
              { id: 'cs-d4', name: 'Firewall & IDS/IPS', description: 'pfSense, Snort, Suricata, WAF configuration' },
            ],
            projects: ['SOC Analyst Simulation', 'Threat Hunting Exercise'], resources: ['Blue Team Labs Online', 'Splunk free training'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Cloud & Application Security', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'cs-cloud', title: 'Cloud & AppSec', estimatedTime: '4 weeks',
            topics: [
              { id: 'cs-cl1', name: 'Cloud Security (AWS/GCP)', description: 'IAM misconfigurations, S3 security, CloudTrail' },
              { id: 'cs-cl2', name: 'DevSecOps', description: 'SAST, DAST, SCA, secrets scanning in CI/CD' },
              { id: 'cs-cl3', name: 'Zero Trust Architecture', description: 'Micro-segmentation, least privilege, ZTNA' },
              { id: 'cs-cl4', name: 'Compliance Frameworks', description: 'ISO 27001, GDPR, SOC 2, HIPAA, PCI DSS' },
            ],
            projects: ['AWS Security Assessment', 'DevSecOps Pipeline'], resources: ['AWS Security specialty', 'SANS courses'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Certifications & Career', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'cs-career', title: 'Certs & Interviews', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'cs-c1', name: 'CompTIA Security+ / CEH / OSCP', description: 'Industry certifications path' },
              { id: 'cs-c2', name: 'Bug Bounty Programs', description: 'HackerOne, Bugcrowd, responsible disclosure' },
              { id: 'cs-c3', name: 'Security Interview Prep', description: 'Technical and behavioral security interviews' },
            ],
            projects: ['Bug Bounty Submission', 'Security Research Report'], resources: ['OSCP preparation', 'Bug Bounty Bootcamp', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 12. ETHICAL HACKER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ethical-hacker',
    title: 'Ethical Hacker',
    category: 'security',
    icon: 'ScanSearch',
    iconColor: 'text-gray-300',
    gradient: 'from-gray-700 to-slate-800',
    cardGradient: 'from-gray-700/20 via-slate-700/10 to-transparent',
    borderColor: 'border-gray-600/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '10-14 months',
    salary: '₹6L - ₹20L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['Kali Linux', 'Burp Suite', 'Metasploit', 'OSCP'],
    description: 'Master penetration testing, vulnerability assessment, and security research to find weaknesses before attackers do.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Hacking Foundations', color: 'bg-gray-600', ringColor: 'ring-gray-600/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'eh-found', title: 'Networking, Linux & Kali', estimatedTime: '6 weeks',
            topics: [
              { id: 'eh-1', name: 'Kali Linux Setup & Tools', description: 'Installing Kali, essential tools overview' },
              { id: 'eh-2', name: 'Networking for Hackers', description: 'Packet analysis, Wireshark, network sniffing' },
              { id: 'eh-3', name: 'Python for Hacking', description: 'Writing exploits, port scanners, network tools' },
              { id: 'eh-4', name: 'Cryptography & Encoding', description: 'Base64, hashing, encryption weaknesses' },
            ],
            projects: ['Network Scanning Tool in Python', 'Kali Linux Lab Setup'], resources: ['Practical Ethical Hacking Course', 'TryHackMe'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Web Application Hacking', color: 'bg-red-600', ringColor: 'ring-red-600/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'eh-web', title: 'Web App Exploitation', estimatedTime: '6 weeks',
            topics: [
              { id: 'eh-w1', name: 'OWASP Top 10 Deep Dive', description: 'Injection, broken auth, XSS, IDOR, SSRF, XXE' },
              { id: 'eh-w2', name: 'Burp Suite Mastery', description: 'Proxy, scanner, intruder, repeater, decoder' },
              { id: 'eh-w3', name: 'SQL Injection', description: 'Manual + automated, blind SQLi, time-based' },
              { id: 'eh-w4', name: 'Authentication Bypass', description: 'JWT attacks, OAuth flaws, password attacks' },
            ],
            projects: ['DVWA Complete Exploitation', 'Bug Bounty Recon Framework'], resources: ['PortSwigger Web Security Academy', 'BWAPP'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Network & System Hacking', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '8-10 weeks',
        stages: [
          {
            id: 'eh-network', title: 'Network Penetration Testing', estimatedTime: '6 weeks',
            topics: [
              { id: 'eh-n1', name: 'Reconnaissance', description: 'Passive/active, OSINT tools, Shodan, Maltego' },
              { id: 'eh-n2', name: 'Exploitation with Metasploit', description: 'Modules, payloads, meterpreter sessions' },
              { id: 'eh-n3', name: 'Active Directory Attacks', description: 'Pass-the-hash, kerberoasting, BloodHound' },
              { id: 'eh-n4', name: 'Wireless Hacking', description: 'WPA2 cracking, evil twin, captive portals' },
              { id: 'eh-n5', name: 'Social Engineering', description: 'Phishing, pretexting, USB drops, SET' },
            ],
            projects: ['Internal Network Pentest Lab', 'AD Attack Simulation'], resources: ['HackTheBox Pro Labs', 'PNPT course'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Advanced Exploitation', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'eh-advanced', title: 'Advanced Techniques', estimatedTime: '4 weeks',
            topics: [
              { id: 'eh-a1', name: 'Binary Exploitation', description: 'Buffer overflows, ROP chains, heap exploitation' },
              { id: 'eh-a2', name: 'Malware Analysis', description: 'Static/dynamic analysis, sandboxing, reverse engineering' },
              { id: 'eh-a3', name: 'Cloud Penetration Testing', description: 'AWS/Azure attack paths, SSRF to cloud creds' },
              { id: 'eh-a4', name: 'Report Writing', description: 'Executive summary, technical findings, remediation' },
            ],
            projects: ['Full Penetration Test Report', 'CTF Competition'], resources: ['pwn.college', 'HackTheBox', 'VulnHub'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career & OSCP', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'eh-career', title: 'OSCP & Bug Bounty Career', estimatedTime: '4 weeks',
            topics: [
              { id: 'eh-c1', name: 'OSCP Exam Preparation', description: '24-hour practical exam, buffer overflows, AD' },
              { id: 'eh-c2', name: 'Bug Bounty Hunting', description: 'HackerOne, Bugcrowd, program selection, methodology' },
              { id: 'eh-c3', name: 'Security Researcher Path', description: 'CVE research, responsible disclosure, publications' },
            ],
            projects: ['First Bug Bounty Submission', 'OSCP Preparation Lab'], resources: ['Offensive Security PEN-200', 'Bug Bounty Playbook'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 13. BLOCKCHAIN DEVELOPER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'blockchain',
    title: 'Blockchain Developer',
    category: 'emerging',
    icon: 'Link2',
    iconColor: 'text-amber-400',
    gradient: 'from-amber-400 to-yellow-500',
    cardGradient: 'from-amber-400/20 via-yellow-500/10 to-transparent',
    borderColor: 'border-amber-400/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '8-12 months',
    salary: '₹10L - ₹40L',
    demand: 'Growing',
    demandColor: 'text-yellow-400',
    tags: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts'],
    description: 'Build decentralized applications, smart contracts, and blockchain solutions on Ethereum and beyond.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Blockchain Fundamentals', color: 'bg-amber-500', ringColor: 'ring-amber-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'bc-found', title: 'Blockchain Basics', estimatedTime: '4 weeks',
            topics: [
              { id: 'bc-1', name: 'Blockchain Architecture', description: 'Blocks, chains, consensus, nodes, P2P networks' },
              { id: 'bc-2', name: 'Cryptography in Blockchain', description: 'Hash functions, digital signatures, wallets, keys' },
              { id: 'bc-3', name: 'Ethereum & EVM', description: 'Accounts, gas, transactions, EVM architecture' },
              { id: 'bc-4', name: 'JavaScript/TypeScript Prerequisite', description: 'ES6+, async patterns, Node.js basics' },
            ],
            projects: ['Simple Blockchain Implementation in JS'], resources: ['Bitcoin Whitepaper', 'Ethereum docs', 'CryptoZombies'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Smart Contract Development', color: 'bg-yellow-500', ringColor: 'ring-yellow-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'bc-solidity', title: 'Solidity & Smart Contracts', estimatedTime: '6 weeks',
            topics: [
              { id: 'bc-s1', name: 'Solidity Fundamentals', description: 'Types, functions, events, modifiers, inheritance' },
              { id: 'bc-s2', name: 'ERC Standards', description: 'ERC-20, ERC-721, ERC-1155, ERC-4626' },
              { id: 'bc-s3', name: 'Hardhat & Foundry', description: 'Development frameworks, testing, deployment scripts' },
              { id: 'bc-s4', name: 'OpenZeppelin', description: 'Security-audited contract templates, access control' },
              { id: 'bc-s5', name: 'Smart Contract Security', description: 'Reentrancy, overflow, front-running, audit techniques' },
            ],
            projects: ['ERC-20 Token', 'NFT Collection', 'Voting Smart Contract'], resources: ['CryptoZombies', 'Solidity by Example', 'Hardhat docs'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: DApp Development', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'bc-dapp', title: 'Web3 Frontend & DApps', estimatedTime: '4 weeks',
            topics: [
              { id: 'bc-d1', name: 'Web3.js / Ethers.js', description: 'Connecting to blockchain, signing transactions' },
              { id: 'bc-d2', name: 'Wagmi & RainbowKit', description: 'Modern React hooks for Web3' },
              { id: 'bc-d3', name: 'IPFS & Decentralized Storage', description: 'Pinata, Arweave, decentralized file storage' },
              { id: 'bc-d4', name: 'The Graph', description: 'Indexing blockchain data, GraphQL queries' },
            ],
            projects: ['NFT Marketplace DApp', 'DEX Interface'], resources: ['Alchemy University', 'Ethers.js docs'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: DeFi & Layer 2', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'bc-defi', title: 'DeFi & Advanced Blockchain', estimatedTime: '4 weeks',
            topics: [
              { id: 'bc-df1', name: 'DeFi Protocols', description: 'AMMs (Uniswap), lending (Aave), stablecoins (DAI)' },
              { id: 'bc-df2', name: 'Layer 2 Solutions', description: 'Optimistic rollups (Arbitrum), ZK rollups (Polygon zkEVM)' },
              { id: 'bc-df3', name: 'Cross-chain & Bridges', description: 'Chainlink CCIP, LayerZero, bridge security' },
              { id: 'bc-df4', name: 'Smart Contract Auditing', description: 'Security analysis, common vulnerabilities, Slither' },
            ],
            projects: ['DeFi Yield Aggregator', 'Token Staking Platform'], resources: ['DeFi MOOC', 'Secureum', 'Uniswap v3 docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Web3 Career', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          {
            id: 'bc-career', title: 'Web3 Career Path', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'bc-c1', name: 'Smart Contract Auditing Career', description: 'Code4rena, Sherlock, Immunefi bounties' },
              { id: 'bc-c2', name: 'Web3 Interview Prep', description: 'DeFi concepts, security, Solidity patterns' },
              { id: 'bc-c3', name: 'Building a Web3 Presence', description: 'GitHub, Twitter/X, ENS domain, on-chain identity' },
            ],
            projects: ['Full DeFi Protocol', 'Security Audit Report'], resources: ['Immunefi', 'Code4rena', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 14. MOBILE APP DEVELOPER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'mobile-dev',
    title: 'Mobile App Developer',
    category: 'development',
    icon: 'Smartphone',
    iconColor: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    cardGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '6-10 months',
    salary: '₹5L - ₹18L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['React Native', 'Flutter', 'iOS', 'Android'],
    description: 'Build cross-platform mobile applications using React Native or Flutter for iOS and Android.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Foundation', color: 'bg-emerald-500', ringColor: 'ring-emerald-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'mob-found', title: 'Choose Stack: React Native or Flutter', estimatedTime: '4 weeks',
            topics: [
              { id: 'mob-1', name: 'JavaScript/Dart Fundamentals', description: 'JS for React Native OR Dart for Flutter' },
              { id: 'mob-2', name: 'Mobile UX Principles', description: 'Touch targets, navigation patterns, gestures' },
              { id: 'mob-3', name: 'Development Setup', description: 'Expo/RN CLI, Android Studio, Xcode, simulators' },
            ],
            projects: ['Hello World Mobile App'], resources: ['React Native docs', 'Flutter docs', 'Expo documentation'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Core Development', color: 'bg-teal-500', ringColor: 'ring-teal-500/30', estimatedTime: '6-8 weeks',
        stages: [
          {
            id: 'mob-core', title: 'Core Mobile Development', estimatedTime: '6 weeks',
            topics: [
              { id: 'mob-c1', name: 'Components & Navigation', description: 'React Navigation / Flutter Navigator, tab bars, drawers' },
              { id: 'mob-c2', name: 'State Management', description: 'Zustand, Redux / Riverpod, Bloc pattern' },
              { id: 'mob-c3', name: 'Native APIs', description: 'Camera, location, notifications, sensors, permissions' },
              { id: 'mob-c4', name: 'Animations', description: 'Animated API, Reanimated / Flutter animations' },
              { id: 'mob-c5', name: 'Networking', description: 'REST APIs, GraphQL, WebSockets on mobile' },
            ],
            projects: ['Weather App', 'Chat Application'], resources: ['William Candillon (React Native)', 'Flutter Boring Show'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Backend & Auth', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '4-6 weeks',
        stages: [
          {
            id: 'mob-backend', title: 'Mobile Backend Integration', estimatedTime: '4 weeks',
            topics: [
              { id: 'mob-b1', name: 'Firebase Integration', description: 'Firestore, Auth, Storage, Cloud Functions, FCM' },
              { id: 'mob-b2', name: 'Supabase', description: 'Real-time database, authentication, storage' },
              { id: 'mob-b3', name: 'Payment Integration', description: 'Stripe, in-app purchases, subscription management' },
              { id: 'mob-b4', name: 'Offline Support', description: 'AsyncStorage, SQLite, offline-first patterns' },
            ],
            projects: ['E-Commerce Mobile App', 'Social App with Firebase'], resources: ['Firebase docs', 'Supabase docs'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Publishing & Performance', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '2-3 weeks',
        stages: [
          {
            id: 'mob-publish', title: 'App Store & Performance', estimatedTime: '2-3 weeks',
            topics: [
              { id: 'mob-p1', name: 'Performance Optimization', description: 'FlatList optimization, memo, image caching' },
              { id: 'mob-p2', name: 'Play Store Publishing', description: 'APK/AAB, signing, store listing, screenshots' },
              { id: 'mob-p3', name: 'App Store Publishing', description: 'iOS provisioning, TestFlight, App Store review' },
              { id: 'mob-p4', name: 'Analytics & Monitoring', description: 'Crashlytics, Firebase Analytics, error tracking' },
            ],
            projects: ['Published App on Play Store'], resources: ['App Store guidelines', 'Play Console docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '2-3 weeks',
        stages: [
          {
            id: 'mob-career', title: 'Mobile Developer Interviews', estimatedTime: '2-3 weeks',
            topics: [
              { id: 'mob-ca1', name: 'Mobile Interview Questions', description: 'RN/Flutter concepts, performance, architecture' },
              { id: 'mob-ca2', name: 'Portfolio Apps', description: '3-5 published apps showcasing range of skills' },
            ],
            projects: ['Full-Featured Published App', 'Open Source RN/Flutter Library'], resources: ['InterviewAI', 'Mobile Interview Handbook'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 15. ANDROID DEVELOPER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'android',
    title: 'Android Developer',
    category: 'development',
    icon: 'TabletSmartphone',
    iconColor: 'text-green-400',
    gradient: 'from-green-500 to-lime-500',
    cardGradient: 'from-green-500/20 via-lime-500/10 to-transparent',
    borderColor: 'border-green-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '6-10 months',
    salary: '₹5L - ₹18L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['Kotlin', 'Jetpack Compose', 'Android SDK'],
    description: 'Build native Android applications using Kotlin, Jetpack Compose, and modern Android architecture.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Kotlin & Android Basics', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'and-kotlin', title: 'Kotlin Programming', estimatedTime: '4 weeks',
            topics: [
              { id: 'and-1', name: 'Kotlin Fundamentals', description: 'Variables, functions, lambdas, extension functions, coroutines' },
              { id: 'and-2', name: 'Android Studio', description: 'IDE setup, project structure, Gradle, AVD' },
              { id: 'and-3', name: 'Android Basics', description: 'Activities, fragments, intents, lifecycle' },
            ],
            projects: ['Simple Calculator App'], resources: ['Kotlin docs', 'Android Basics in Kotlin (Google)'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Jetpack Compose & Architecture', color: 'bg-teal-500', ringColor: 'ring-teal-500/30', estimatedTime: '6-8 weeks',
        stages: [
          { id: 'and-compose', title: 'Jetpack Compose', estimatedTime: '6 weeks',
            topics: [
              { id: 'and-c1', name: 'Compose Fundamentals', description: 'Composables, state, recomposition, modifiers' },
              { id: 'and-c2', name: 'MVVM Architecture', description: 'ViewModel, LiveData, StateFlow, Repository pattern' },
              { id: 'and-c3', name: 'Navigation Compose', description: 'Navigation graph, arguments, deep links' },
              { id: 'and-c4', name: 'Room Database', description: 'Entities, DAOs, database migrations' },
              { id: 'and-c5', name: 'Hilt Dependency Injection', description: 'DI patterns in Android with Hilt' },
            ],
            projects: ['Notes App with Room', 'News App with MVVM'], resources: ['Android Developers docs', 'Compose samples'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Advanced Android', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'and-advanced', title: 'Advanced Android Concepts', estimatedTime: '4 weeks',
            topics: [
              { id: 'and-a1', name: 'Coroutines & Flow', description: 'Async programming, StateFlow, SharedFlow, channels' },
              { id: 'and-a2', name: 'WorkManager', description: 'Background tasks, constraints, periodic work' },
              { id: 'and-a3', name: 'Retrofit & Networking', description: 'REST API integration, OkHttp, Moshi/Gson' },
              { id: 'and-a4', name: 'Firebase for Android', description: 'Auth, Firestore, FCM push notifications' },
              { id: 'and-a5', name: 'Testing', description: 'Unit tests, instrumented tests, Espresso, UI testing' },
            ],
            projects: ['Social Media App Clone', 'E-Commerce Android App'], resources: ['Android Codelab', 'Philipp Lackner YouTube'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Publishing', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '1-2 weeks',
        stages: [
          { id: 'and-publish', title: 'Google Play Publishing', estimatedTime: '1-2 weeks',
            topics: [
              { id: 'and-p1', name: 'App Signing & Release', description: 'Keystore, ProGuard, AAB build' },
              { id: 'and-p2', name: 'Play Console', description: 'Store listing, screenshots, ASO optimization' },
              { id: 'and-p3', name: 'In-App Purchases', description: 'Billing library, subscriptions, one-time products' },
            ],
            projects: ['Published Play Store App'], resources: ['Google Play Console docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '2-3 weeks',
        stages: [
          { id: 'and-career', title: 'Android Interviews', estimatedTime: '2-3 weeks',
            topics: [
              { id: 'and-ca1', name: 'Android Interview Questions', description: 'Activity lifecycle, Compose, coroutines, architecture' },
              { id: 'and-ca2', name: 'Portfolio & Open Source', description: 'Showcasing apps, contributing to Android projects' },
            ],
            projects: ['Open Source Android App', 'Play Store Portfolio'], resources: ['Android Interview Handbook', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 16. NETWORK ENGINEER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'network-engineer',
    title: 'Network Engineer',
    category: 'networking',
    icon: 'Network',
    iconColor: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
    cardGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    borderColor: 'border-cyan-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '8-12 months',
    salary: '₹5L - ₹15L',
    demand: 'Steady',
    demandColor: 'text-blue-400',
    tags: ['Cisco', 'CCNA', 'Routing', 'Switching'],
    description: 'Design, implement, and maintain computer networks for organizations.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Networking Fundamentals', color: 'bg-cyan-500', ringColor: 'ring-cyan-500/30', estimatedTime: '6-8 weeks',
        stages: [
          { id: 'net-found', title: 'OSI Model & Protocols', estimatedTime: '6 weeks',
            topics: [
              { id: 'net-1', name: 'OSI & TCP/IP Model', description: 'All 7 layers, encapsulation, protocols per layer' },
              { id: 'net-2', name: 'IP Addressing & Subnetting', description: 'IPv4, IPv6, CIDR, VLSM, subnetting practice' },
              { id: 'net-3', name: 'Routing Protocols', description: 'RIP, OSPF, EIGRP, BGP concepts, routing tables' },
              { id: 'net-4', name: 'Switching', description: 'VLANs, STP, trunking, EtherChannel, port security' },
            ],
            projects: ['Network Design in Packet Tracer'], resources: ['Cisco NetAcad', 'Professor Messer CCNA', 'Keith Barker YouTube'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Cisco Skills', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '6-8 weeks',
        stages: [
          { id: 'net-cisco', title: 'Cisco IOS & Configuration', estimatedTime: '6 weeks',
            topics: [
              { id: 'net-c1', name: 'Cisco IOS CLI', description: 'Router/switch configuration, troubleshooting commands' },
              { id: 'net-c2', name: 'OSPF Configuration', description: 'Single/multi-area OSPF, route summarization' },
              { id: 'net-c3', name: 'NAT/PAT', description: 'Static NAT, dynamic NAT, PAT, troubleshooting' },
              { id: 'net-c4', name: 'Access Control Lists', description: 'Standard, extended, named ACLs, troubleshooting' },
            ],
            projects: ['Enterprise Network Design Lab'], resources: ['Cisco Packet Tracer labs', 'CCNA official cert guide'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Security & WAN', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'net-security', title: 'Network Security & WAN', estimatedTime: '4 weeks',
            topics: [
              { id: 'net-s1', name: 'Firewall & IDS/IPS', description: 'Cisco ASA, zone-based firewall, Snort' },
              { id: 'net-s2', name: 'VPN Technologies', description: 'Site-to-site VPN, remote access VPN, SSL VPN' },
              { id: 'net-s3', name: 'WAN Technologies', description: 'MPLS, SD-WAN, leased lines, Metro Ethernet' },
              { id: 'net-s4', name: 'Wireless Networking', description: 'WiFi standards, 802.11, WPA3, wireless security' },
            ],
            projects: ['Secure Branch Office Network'], resources: ['Cisco documentation', 'INE networking courses'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Automation & SDN', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'net-auto', title: 'Network Automation', estimatedTime: '3 weeks',
            topics: [
              { id: 'net-a1', name: 'Python for Network Engineers', description: 'Paramiko, Netmiko, NAPALM, automation scripts' },
              { id: 'net-a2', name: 'Ansible for Networks', description: 'Network modules, playbooks for Cisco/Juniper' },
              { id: 'net-a3', name: 'SD-WAN & SDN', description: 'Cisco DNA Center, NSO, network programmability' },
            ],
            projects: ['Network Automation Scripts', 'Automated Config Backup'], resources: ['Network Programmability and Automation book'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: CCNA & Career', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'net-career', title: 'CCNA Certification & Career', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'net-ca1', name: 'CCNA 200-301 Exam Prep', description: 'Full exam topic coverage, practice tests' },
              { id: 'net-ca2', name: 'Network Interview Questions', description: 'Troubleshooting scenarios, routing/switching, security' },
              { id: 'net-ca3', name: 'CCNP Path', description: 'Enterprise, Security, Data Center specializations' },
            ],
            projects: ['Network Documentation Portfolio'], resources: ['Boson CCNA Practice Exams', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 17. SOFTWARE ENGINEER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'development',
    icon: 'Code2',
    iconColor: 'text-blue-400',
    gradient: 'from-blue-600 to-indigo-600',
    cardGradient: 'from-blue-600/20 via-indigo-500/10 to-transparent',
    borderColor: 'border-blue-600/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '10-14 months',
    salary: '₹8L - ₹30L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['CS Fundamentals', 'DSA', 'System Design', 'Java/Python'],
    description: 'Build a strong foundation in computer science principles, algorithms, and software engineering practices.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: CS Fundamentals', color: 'bg-blue-600', ringColor: 'ring-blue-600/30', estimatedTime: '8-10 weeks',
        stages: [
          { id: 'se-cs', title: 'Core Computer Science', estimatedTime: '8 weeks',
            topics: [
              { id: 'se-1', name: 'Data Structures', description: 'Arrays, linked lists, stacks, queues, trees, graphs, hash tables' },
              { id: 'se-2', name: 'Algorithms', description: 'Sorting, searching, dynamic programming, greedy, divide & conquer' },
              { id: 'se-3', name: 'Big O Notation', description: 'Time/space complexity analysis, amortized analysis' },
              { id: 'se-4', name: 'Object Oriented Programming', description: 'Encapsulation, inheritance, polymorphism, SOLID principles' },
              { id: 'se-5', name: 'Functional Programming', description: 'Pure functions, immutability, higher-order functions' },
            ],
            projects: ['Custom Data Structure Implementation', 'Algorithm Visualizer'], resources: ['CLRS book', 'NeetCode 150', 'CS50'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Language Mastery', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '6-8 weeks',
        stages: [
          { id: 'se-lang', title: 'Master a Programming Language', estimatedTime: '6 weeks',
            topics: [
              { id: 'se-l1', name: 'Java or Python or C++', description: 'Deep expertise in one primary language' },
              { id: 'se-l2', name: 'Design Patterns', description: 'Gang of Four patterns, architectural patterns' },
              { id: 'se-l3', name: 'Testing', description: 'Unit testing, TDD, integration testing, mocking' },
              { id: 'se-l4', name: 'Concurrency', description: 'Threads, async/await, synchronization, deadlocks' },
            ],
            projects: ['Library/Framework Build', 'Open Source Contribution'], resources: ['Effective Java', 'Python Cookbook', 'Head First Design Patterns'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: System Design', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'se-system', title: 'System Design Fundamentals', estimatedTime: '4 weeks',
            topics: [
              { id: 'se-s1', name: 'Scalability Patterns', description: 'Horizontal/vertical scaling, caching, CDNs' },
              { id: 'se-s2', name: 'Database Design', description: 'Schema design, indexes, sharding, replication' },
              { id: 'se-s3', name: 'Distributed Systems', description: 'CAP theorem, eventual consistency, consensus' },
              { id: 'se-s4', name: 'API Design', description: 'REST, GraphQL, gRPC, API versioning, rate limiting' },
              { id: 'se-s5', name: 'Real-world Case Studies', description: 'Twitter, Uber, WhatsApp, Netflix system designs' },
            ],
            projects: ['System Design Document (Twitter Clone)'], resources: ['Grokking System Design', 'System Design Interview book'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Software Engineering Practices', color: 'bg-teal-500', ringColor: 'ring-teal-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'se-practices', title: 'Software Engineering Best Practices', estimatedTime: '4 weeks',
            topics: [
              { id: 'se-p1', name: 'Clean Code', description: 'Naming, functions, comments, formatting, refactoring' },
              { id: 'se-p2', name: 'Git Workflows', description: 'Conventional commits, PR reviews, code reviews' },
              { id: 'se-p3', name: 'Agile & Scrum', description: 'Sprints, standups, retrospectives, product backlog' },
              { id: 'se-p4', name: 'Documentation', description: 'Technical writing, API docs, README best practices' },
            ],
            projects: ['Contribute to Large Open Source Project'], resources: ['Clean Code book', 'The Pragmatic Programmer'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: FAANG Prep', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'se-faang', title: 'Top Tier Interview Preparation', estimatedTime: '4-6 weeks',
            topics: [
              { id: 'se-f1', name: 'LeetCode Top 150', description: 'Must-solve problems, patterns, time-boxing practice' },
              { id: 'se-f2', name: 'Behavioral Interviews', description: 'STAR method, leadership principles, Amazon LP' },
              { id: 'se-f3', name: 'System Design Interviews', description: 'Whiteboard design sessions, communication skills' },
              { id: 'se-f4', name: 'Resume for Top Companies', description: 'ATS optimization, quantified achievements' },
            ],
            projects: ['Competitive Programming Profile', 'Open Source Project'], resources: ['Cracking the Coding Interview', 'LeetCode', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 18. QA / AUTOMATION TESTER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'qa-tester',
    title: 'QA / Automation Tester',
    category: 'development',
    icon: 'TestTube2',
    iconColor: 'text-lime-400',
    gradient: 'from-lime-500 to-green-600',
    cardGradient: 'from-lime-500/20 via-green-500/10 to-transparent',
    borderColor: 'border-lime-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '5-8 months',
    salary: '₹4L - ₹15L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['Selenium', 'Cypress', 'Jest', 'JIRA'],
    description: 'Ensure software quality through manual and automated testing strategies.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: Testing Fundamentals', color: 'bg-lime-500', ringColor: 'ring-lime-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'qa-found', title: 'QA Basics', estimatedTime: '3 weeks',
            topics: [
              { id: 'qa-1', name: 'Software Testing Life Cycle', description: 'STLC, test planning, execution, reporting' },
              { id: 'qa-2', name: 'Test Types', description: 'Unit, integration, system, regression, UAT, smoke' },
              { id: 'qa-3', name: 'Bug Tracking (JIRA)', description: 'Bug lifecycle, severity vs priority, defect reports' },
              { id: 'qa-4', name: 'Agile Testing', description: 'Scrum ceremonies, sprint testing, shifting left' },
            ],
            projects: ['Manual Test Plan for Sample App'], resources: ['ISTQB Foundation study material', 'Guru99 testing'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Automation Fundamentals', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '6-8 weeks',
        stages: [
          { id: 'qa-auto', title: 'Test Automation', estimatedTime: '6 weeks',
            topics: [
              { id: 'qa-a1', name: 'Selenium WebDriver', description: 'Locators, waits, page objects, cross-browser testing' },
              { id: 'qa-a2', name: 'Cypress', description: 'Modern E2E testing, command chains, network stubbing' },
              { id: 'qa-a3', name: 'Playwright', description: 'Multi-browser automation, async API, visual comparison' },
              { id: 'qa-a4', name: 'Appium', description: 'Mobile test automation for Android/iOS' },
            ],
            projects: ['Automated E2E Test Suite for Web App'], resources: ['Cypress docs', 'Selenium docs', 'Playwright docs'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: API & Performance Testing', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'qa-api', title: 'API & Performance Testing', estimatedTime: '3 weeks',
            topics: [
              { id: 'qa-ap1', name: 'Postman / REST Assured', description: 'API validation, collections, environments, Newman' },
              { id: 'qa-ap2', name: 'JMeter', description: 'Load testing, thread groups, results analysis' },
              { id: 'qa-ap3', name: 'k6 / Gatling', description: 'Modern load testing as code' },
              { id: 'qa-ap4', name: 'Performance Metrics', description: 'Response time, throughput, error rate, percentiles' },
            ],
            projects: ['API Test Automation Suite', 'Performance Benchmark Report'], resources: ['Postman learning center', 'JMeter docs'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: CI/CD & Frameworks', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '2-3 weeks',
        stages: [
          { id: 'qa-cicd', title: 'Test in CI/CD', estimatedTime: '2 weeks',
            topics: [
              { id: 'qa-c1', name: 'GitHub Actions for QA', description: 'Running tests in CI, artifacts, reporting' },
              { id: 'qa-c2', name: 'Test Reporting', description: 'Allure, HTML reports, dashboard integration' },
              { id: 'qa-c3', name: 'BDD (Cucumber)', description: 'Gherkin syntax, feature files, step definitions' },
            ],
            projects: ['CI-integrated Test Suite'], resources: ['BDD in Action book', 'Allure docs'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: Career Ready', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '2-3 weeks',
        stages: [
          { id: 'qa-career', title: 'QA Career & Certifications', estimatedTime: '2-3 weeks',
            topics: [
              { id: 'qa-ca1', name: 'ISTQB Certification', description: 'Foundation level exam preparation' },
              { id: 'qa-ca2', name: 'QA Interview Questions', description: 'Manual + automation interview scenarios' },
              { id: 'qa-ca3', name: 'Portfolio', description: 'GitHub with test frameworks, Selenium, Cypress projects' },
            ],
            projects: ['Open Source QA Tool', 'Full Test Portfolio'], resources: ['ISTQB syllabus', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 19. SITE RELIABILITY ENGINEER (SRE)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'sre',
    title: 'Site Reliability Engineer',
    category: 'cloud',
    icon: 'ShieldHalf',
    iconColor: 'text-slate-300',
    gradient: 'from-slate-600 to-gray-700',
    cardGradient: 'from-slate-600/20 via-gray-600/10 to-transparent',
    borderColor: 'border-slate-500/30',
    difficulty: 'Advanced',
    difficultyColor: 'bg-red-500/20 text-red-400',
    duration: '12-16 months',
    salary: '₹15L - ₹45L',
    demand: 'Very High',
    demandColor: 'text-green-400',
    tags: ['Kubernetes', 'Prometheus', 'Python', 'Go'],
    description: 'Apply software engineering principles to reliability, scalability, and operational excellence.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: SRE Foundations', color: 'bg-slate-600', ringColor: 'ring-slate-600/30', estimatedTime: '6-8 weeks',
        stages: [
          { id: 'sre-found', title: 'Linux, Networking & Programming', estimatedTime: '6 weeks',
            topics: [
              { id: 'sre-1', name: 'Linux Systems Administration', description: 'Kernel, systemd, namespaces, cgroups, eBPF' },
              { id: 'sre-2', name: 'Go or Python for SRE', description: 'Go preferred, writing automation tools and services' },
              { id: 'sre-3', name: 'Networking Deep Dive', description: 'TCP internals, HTTP/2, gRPC, load balancing algorithms' },
              { id: 'sre-4', name: 'SRE Book Concepts', description: 'Error budgets, SLOs, SLIs, SLAs, toil reduction' },
            ],
            projects: ['Custom Monitoring Tool in Python/Go'], resources: ['Google SRE Book (free)', 'Linux internals resources'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Observability', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'sre-obs', title: 'Monitoring, Logging & Tracing', estimatedTime: '4 weeks',
            topics: [
              { id: 'sre-o1', name: 'Prometheus & Grafana', description: 'Metrics, PromQL, dashboards, alerting' },
              { id: 'sre-o2', name: 'ELK Stack', description: 'Elasticsearch, Logstash, Kibana, log aggregation' },
              { id: 'sre-o3', name: 'Distributed Tracing', description: 'Jaeger, Zipkin, OpenTelemetry, trace correlation' },
              { id: 'sre-o4', name: 'Incident Management', description: 'On-call, runbooks, postmortems, alerting fatigue' },
            ],
            projects: ['Full Observability Stack Setup'], resources: ['Prometheus docs', 'OpenTelemetry docs'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Platform Engineering', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '6-8 weeks',
        stages: [
          { id: 'sre-platform', title: 'Kubernetes & Infrastructure', estimatedTime: '6 weeks',
            topics: [
              { id: 'sre-p1', name: 'Kubernetes Deep Dive', description: 'Operators, custom resources, admission controllers, RBAC' },
              { id: 'sre-p2', name: 'Service Mesh (Istio)', description: 'Traffic management, mTLS, circuit breaking, retries' },
              { id: 'sre-p3', name: 'Chaos Engineering', description: 'Chaos Monkey, LitmusChaos, controlled fault injection' },
              { id: 'sre-p4', name: 'Infrastructure as Code', description: 'Terraform, Pulumi, GitOps with ArgoCD/Flux' },
            ],
            projects: ['Production-Grade K8s Cluster', 'Chaos Engineering Experiment'], resources: ['Kubernetes docs', 'Istio docs', 'Chaos Monkey'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Advanced Reliability', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'sre-adv', title: 'Reliability Engineering Patterns', estimatedTime: '4 weeks',
            topics: [
              { id: 'sre-a1', name: 'Capacity Planning', description: 'Load testing, resource forecasting, traffic modeling' },
              { id: 'sre-a2', name: 'Disaster Recovery', description: 'RTO/RPO, backup strategies, failover automation' },
              { id: 'sre-a3', name: 'Performance Engineering', description: 'Profiling, flame graphs, query optimization' },
              { id: 'sre-a4', name: 'Security for SRE', description: 'Secrets management, compliance, vulnerability scanning' },
            ],
            projects: ['SLO Dashboard with Error Budget Burn Alerts'], resources: ['Implementing Service Level Objectives book'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: SRE Career', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'sre-career', title: 'SRE Interviews & Career', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'sre-c1', name: 'SRE Interview Questions', description: 'System design for reliability, debugging scenarios' },
              { id: 'sre-c2', name: 'CKA / CKS Certification', description: 'Certified Kubernetes Administrator certification' },
              { id: 'sre-c3', name: 'Open Source SRE Tools', description: 'Contributing to Prometheus, Kubernetes, Grafana' },
            ],
            projects: ['Open Source SRE Tool Contribution'], resources: ['KodeKloud CKA', 'InterviewAI'],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 20. PRODUCT MANAGER (TECHNICAL)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'product-manager',
    title: 'Product Manager (Technical)',
    category: 'management',
    icon: 'Target',
    iconColor: 'text-fuchsia-400',
    gradient: 'from-fuchsia-500 to-pink-600',
    cardGradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-fuchsia-500/30',
    difficulty: 'Intermediate',
    difficultyColor: 'bg-yellow-500/20 text-yellow-400',
    duration: '6-10 months',
    salary: '₹12L - ₹40L',
    demand: 'High',
    demandColor: 'text-green-400',
    tags: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
    description: 'Lead product development by bridging business, technology, and user experience.',
    phases: [
      {
        id: 'phase-1', title: 'Phase 1: PM Fundamentals', color: 'bg-fuchsia-500', ringColor: 'ring-fuchsia-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'pm-found', title: 'Product Thinking & Strategy', estimatedTime: '4 weeks',
            topics: [
              { id: 'pm-1', name: 'Product Management Basics', description: 'PM role, product lifecycle, roadmap, vision' },
              { id: 'pm-2', name: 'User Research', description: 'User interviews, surveys, personas, jobs-to-be-done' },
              { id: 'pm-3', name: 'Product Strategy', description: 'Market analysis, competitive landscape, positioning' },
              { id: 'pm-4', name: 'Agile & Scrum', description: 'Sprints, backlog, user stories, acceptance criteria' },
            ],
            projects: ['Product Requirements Document', 'User Persona Creation'], resources: ['Inspired by Marty Cagan', 'Reforge PM', 'Product School'],
          },
        ],
      },
      {
        id: 'phase-2', title: 'Phase 2: Technical Depth', color: 'bg-blue-500', ringColor: 'ring-blue-500/30', estimatedTime: '4-6 weeks',
        stages: [
          { id: 'pm-tech', title: 'Technical Skills for PM', estimatedTime: '4 weeks',
            topics: [
              { id: 'pm-t1', name: 'Basic Programming', description: 'Python/JavaScript fundamentals, APIs, databases' },
              { id: 'pm-t2', name: 'System Architecture', description: 'Frontend/backend, microservices, cloud basics' },
              { id: 'pm-t3', name: 'SQL & Data Analysis', description: 'Querying databases, understanding metrics' },
              { id: 'pm-t4', name: 'API Understanding', description: 'REST APIs, webhooks, third-party integrations' },
            ],
            projects: ['Technical Spec for Feature', 'SQL Analysis Report'], resources: ['SQL for PMs', 'System Design for PMs'],
          },
        ],
      },
      {
        id: 'phase-3', title: 'Phase 3: Analytics & Growth', color: 'bg-green-500', ringColor: 'ring-green-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'pm-analytics', title: 'Product Analytics & Growth', estimatedTime: '3 weeks',
            topics: [
              { id: 'pm-a1', name: 'Product Metrics', description: 'DAU, MAU, retention, churn, NPS, LTV, CAC' },
              { id: 'pm-a2', name: 'A/B Testing', description: 'Hypothesis-driven experiments, statistical significance' },
              { id: 'pm-a3', name: 'Funnel Analysis', description: 'Conversion optimization, drop-off identification' },
              { id: 'pm-a4', name: 'Growth Frameworks', description: 'AARRR funnel, product-led growth, viral loops' },
            ],
            projects: ['Growth Experiment Plan', 'Metrics Dashboard'], resources: ['Amplitude analytics', 'Mixpanel docs', 'Growth Hacking book'],
          },
        ],
      },
      {
        id: 'phase-4', title: 'Phase 4: Leadership & Communication', color: 'bg-purple-500', ringColor: 'ring-purple-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'pm-leadership', title: 'Stakeholder Management', estimatedTime: '3 weeks',
            topics: [
              { id: 'pm-l1', name: 'Stakeholder Communication', description: 'Executive presentations, cross-functional alignment' },
              { id: 'pm-l2', name: 'Prioritization Frameworks', description: 'RICE, MoSCoW, Kano model, opportunity scoring' },
              { id: 'pm-l3', name: 'Go-to-Market Strategy', description: 'Launch planning, GTM execution, feedback loops' },
              { id: 'pm-l4', name: 'OKRs & Goal Setting', description: 'Objectives and key results, team alignment' },
            ],
            projects: ['Product Launch Plan', 'OKR Document'], resources: ['Measure What Matters book', 'Product Board'],
          },
        ],
      },
      {
        id: 'phase-5', title: 'Phase 5: PM Career', color: 'bg-orange-500', ringColor: 'ring-orange-500/30', estimatedTime: '3-4 weeks',
        stages: [
          { id: 'pm-career', title: 'PM Interviews & Portfolio', estimatedTime: '3-4 weeks',
            topics: [
              { id: 'pm-c1', name: 'PM Interview Types', description: 'Product design, estimation, strategy, behavioral, case studies' },
              { id: 'pm-c2', name: 'Product Teardowns', description: 'Analyzing successful products for portfolio' },
              { id: 'pm-c3', name: 'Networking & Community', description: 'Product conferences, online communities, mentorship' },
            ],
            projects: ['PM Portfolio Website', 'Product Case Study'], resources: ['Cracking the PM Interview', 'InterviewAI', 'Product Buds'],
          },
        ],
      },
    ],
  },
];

// Helper to get roadmap by ID
export const getRoadmapById = (id) => ROADMAPS.find(r => r.id === id);

// Helper to get roadmaps by category
export const getRoadmapsByCategory = (category) => {
  if (category === 'all') return ROADMAPS;
  return ROADMAPS.filter(r => r.category === category);
};

// Progress helpers
export const getProgressKey = (userId, roadmapId) => `roadmap_progress_${userId}_${roadmapId}`;

export const getProgress = (userId, roadmapId) => {
  try {
    const key = getProgressKey(userId, roadmapId);
    const data = localStorage.getItem(key);
    if (!data) return { completedTopics: [], lastUpdated: null };
    return JSON.parse(data);
  } catch {
    return { completedTopics: [], lastUpdated: null };
  }
};

export const saveProgress = (userId, roadmapId, completedTopics) => {
  try {
    const key = getProgressKey(userId, roadmapId);
    localStorage.setItem(key, JSON.stringify({ completedTopics, lastUpdated: new Date().toISOString() }));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
};

export const countTotalTopics = (roadmap) => {
  return roadmap.phases.reduce((total, phase) => {
    return total + phase.stages.reduce((stageTotal, stage) => {
      return stageTotal + stage.topics.length;
    }, 0);
  }, 0);
};

export const computeProgressPercent = (userId, roadmap) => {
  const { completedTopics } = getProgress(userId, roadmap.id);
  const total = countTotalTopics(roadmap);
  if (total === 0) return 0;
  return Math.round((completedTopics.length / total) * 100);
};

// XP system
export const computeXP = (completedTopics) => completedTopics.length * 10;

// Badges
export const BADGES = [
  { id: 'starter', name: 'Getting Started', emoji: '🌱', description: 'Started your first roadmap', xpRequired: 0 },
  { id: 'learner', name: 'Active Learner', emoji: '📚', description: 'Completed 25% of a roadmap', percentRequired: 25 },
  { id: 'halfway', name: 'Halfway Hero', emoji: '⚡', description: 'Completed 50% of a roadmap', percentRequired: 50 },
  { id: 'almost', name: 'Almost There', emoji: '🔥', description: 'Completed 75% of a roadmap', percentRequired: 75 },
  { id: 'master', name: 'Road Master', emoji: '🏆', description: 'Completed a full roadmap', percentRequired: 100 },
];

export const getEarnedBadges = (percent) => {
  return BADGES.filter(b => {
    if (b.percentRequired !== undefined) return percent >= b.percentRequired;
    return true;
  });
};
