// data.js - Comprehensive App Features
export const APP_FEATURES = [
  {
    id: '01',
    title: 'AI Interview Q&A Sessions',
    description: 'Create personalized interview preparation sessions with AI-generated questions and detailed answers tailored to your role and experience level.',
    icon: 'MessageSquare',
    color: 'from-emerald-500 to-green-600',
    link: '/dashboard'
  },
  {
    id: '02',
    title: 'MCQ Test Platform',
    description: 'Take comprehensive multiple choice tests with 30 AI-generated questions, instant evaluation, and detailed email reports.',
    icon: 'ClipboardCheck',
    color: 'from-blue-500 to-indigo-600',
    link: '/mcq-test'
  },
  {
    id: '03',
    title: 'Code Execution Platform',
    description: 'Practice coding problems with our integrated code editor supporting multiple languages with real-time execution and testing.',
    icon: 'Code',
    color: 'from-purple-500 to-pink-600',
    link: '/codebase'
  },
  {
    id: '04',
    title: 'Notes & Resources',
    description: 'Organize your learning materials, save important notes, and access curated resources for interview preparation.',
    icon: 'BookOpen',
    color: 'from-cyan-500 to-blue-600',
    link: '/notes'
  },
  {
    id: '05',
    title: 'Resource Library',
    description: 'Access a comprehensive collection of PDFs, videos, and links organized by topics to enhance your preparation.',
    icon: 'Library',
    color: 'from-orange-500 to-red-600',
    link: '/resources'
  },
  {
    id: '06',
    title: 'Session Management',
    description: 'Save, export, and revisit your interview sessions. Export as PDF or Markdown for offline access and sharing.',
    icon: 'FolderOpen',
    color: 'from-teal-500 to-cyan-600',
    link: '/dashboard'
  },
  {
    id: '07',
    title: 'AI Chatbot Assistant',
    description: 'Get instant help and answers to your questions with our intelligent AI chatbot available 24/7 across the platform.',
    icon: 'Bot',
    color: 'from-violet-500 to-purple-600',
    link: '#'
  },
  {
    id: '08',
    title: 'Profile & Progress Tracking',
    description: 'Track your preparation progress, manage your profile, and monitor your performance across different topics.',
    icon: 'User',
    color: 'from-pink-500 to-rose-600',
    link: '/profile'
  },
  {
    id: '09',
    title: 'Data Structures & Algorithms',
    description: 'Practice problems on arrays, linked lists, trees, graphs, dynamic programming, and system design basics.',
    icon: 'Network',
    color: 'from-indigo-500 to-blue-600',
    link: '/dashboard'
  }
];

const cards = [
  {
    title: 'Frontend Developer',
    tag: 'React.js, DOM manipulation, CSS Flexbox',
    initials: 'FD',
    experience: '2 Years',
    updated: '30th Apr 2025',
    qna: 10,
    desc: 'Preparing for product-based company interviews',
    color: 'from-green-100 to-green-50',
  },
  {
    title: 'Backend Developer',
    tag: 'Node.js, Express, REST APIs, MongoDB',
    initials: 'BD',
    experience: '3 Years',
    updated: '1st May 2025',
    qna: 20,
    desc: 'Want to master backend system design and performance',
    color: 'from-yellow-100 to-yellow-50',
  },
  {
    title: 'Full Stack Developer',
    tag: 'MERN stack, deployment strategies, authentication',
    initials: 'FS',
    experience: '4 Years',
    updated: '30th Apr 2025',
    qna: 10,
    desc: 'Getting ready for startup tech rounds',
    color: 'from-blue-100 to-blue-50',
  },
];

export default cards;
