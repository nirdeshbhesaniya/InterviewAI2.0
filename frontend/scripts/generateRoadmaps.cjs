const fs = require('fs');
const path = require('path');

const branches = [
  {
    id: 'electronics',
    name: 'Electronics Engineering',
    prefix: 'ece',
    categories: ['hardware', 'telecom', 'embedded', 'automation'],
    careers: [
      { title: 'Embedded Systems Engineer', category: 'embedded', salary: '$85K - $140K', icon: 'Cpu' },
      { title: 'VLSI Design Engineer', category: 'hardware', salary: '$95K - $160K', icon: 'Microchip' },
      { title: 'Telecommunications Engineer', category: 'telecom', salary: '$80K - $130K', icon: 'Radio' },
      { title: 'IoT Engineer', category: 'embedded', salary: '$90K - $150K', icon: 'Wifi' },
      { title: 'Robotics Engineer', category: 'automation', salary: '$95K - $155K', icon: 'Bot' },
      { title: 'Control Systems Engineer', category: 'automation', salary: '$85K - $140K', icon: 'Settings' },
      { title: 'Signal Processing Engineer', category: 'telecom', salary: '$90K - $145K', icon: 'Activity' },
      { title: 'Network Hardware Engineer', category: 'telecom', salary: '$85K - $135K', icon: 'Server' },
      { title: 'Automation Engineer', category: 'automation', salary: '$80K - $130K', icon: 'Zap' },
      { title: 'RF Engineer', category: 'telecom', salary: '$90K - $145K', icon: 'Waves' },
      { title: 'Automotive Electronics Engineer', category: 'hardware', salary: '$85K - $135K', icon: 'Car' },
      { title: 'Consumer Electronics Designer', category: 'hardware', salary: '$80K - $130K', icon: 'Smartphone' },
      { title: 'Medical Electronics Engineer', category: 'hardware', salary: '$95K - $150K', icon: 'HeartPulse' },
      { title: 'Optoelectronics Engineer', category: 'hardware', salary: '$90K - $145K', icon: 'Lightbulb' },
      { title: 'Microelectronics Engineer', category: 'hardware', salary: '$95K - $155K', icon: 'Cpu' },
      { title: 'Avionics Engineer', category: 'hardware', salary: '$95K - $160K', icon: 'Plane' },
      { title: 'Power Electronics Engineer', category: 'hardware', salary: '$85K - $140K', icon: 'Battery' },
      { title: 'Antenna Design Engineer', category: 'telecom', salary: '$85K - $135K', icon: 'Wifi' },
      { title: 'Hardware Test Engineer', category: 'hardware', salary: '$75K - $120K', icon: 'CheckSquare' }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    prefix: 'ee',
    categories: ['power', 'renewable', 'control', 'design'],
    careers: [
      { title: 'Power Systems Engineer', category: 'power', salary: '$80K - $135K', icon: 'Zap' },
      { title: 'Renewable Energy Engineer', category: 'renewable', salary: '$85K - $140K', icon: 'Sun' },
      { title: 'Smart Grid Engineer', category: 'power', salary: '$85K - $145K', icon: 'Grid' },
      { title: 'Electric Vehicle (EV) Engineer', category: 'design', salary: '$90K - $150K', icon: 'Car' },
      { title: 'High Voltage Engineer', category: 'power', salary: '$85K - $140K', icon: 'Zap' },
      { title: 'Drives & Motors Engineer', category: 'power', salary: '$80K - $130K', icon: 'Settings' },
      { title: 'Instrumentation Engineer', category: 'control', salary: '$80K - $135K', icon: 'Activity' },
      { title: 'Power Electronics Engineer', category: 'design', salary: '$85K - $140K', icon: 'Battery' },
      { title: 'Energy Management Engineer', category: 'renewable', salary: '$80K - $130K', icon: 'Leaf' },
      { title: 'Substation Design Engineer', category: 'design', salary: '$85K - $135K', icon: 'Home' },
      { title: 'Battery Systems Engineer', category: 'design', salary: '$90K - $145K', icon: 'Battery' },
      { title: 'Control Engineering Specialist', category: 'control', salary: '$85K - $140K', icon: 'Settings' },
      { title: 'HVAC Electrical Engineer', category: 'design', salary: '$75K - $125K', icon: 'Wind' },
      { title: 'Illumination Engineer', category: 'design', salary: '$75K - $120K', icon: 'Lightbulb' },
      { title: 'Protective Relaying Engineer', category: 'power', salary: '$85K - $140K', icon: 'Shield' },
      { title: 'Power Market Analyst', category: 'power', salary: '$75K - $125K', icon: 'BarChart' },
      { title: 'Electric Traction Engineer', category: 'power', salary: '$80K - $135K', icon: 'Train' },
      { title: 'Building Electrification Engineer', category: 'design', salary: '$80K - $130K', icon: 'Building' },
      { title: 'Electrical Machine Designer', category: 'design', salary: '$85K - $140K', icon: 'Tool' }
    ]
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    prefix: 'mech',
    categories: ['design', 'thermal', 'manufacturing', 'robotics'],
    careers: [
      { title: 'Automotive Design Engineer', category: 'design', salary: '$80K - $135K', icon: 'Car' },
      { title: 'Aerospace Engineer', category: 'design', salary: '$95K - $160K', icon: 'Plane' },
      { title: 'Thermal Engineer', category: 'thermal', salary: '$80K - $135K', icon: 'Thermometer' },
      { title: 'HVAC Systems Engineer', category: 'thermal', salary: '$75K - $125K', icon: 'Wind' },
      { title: 'Robotics Mechanical Engineer', category: 'robotics', salary: '$90K - $150K', icon: 'Bot' },
      { title: 'Manufacturing Engineer', category: 'manufacturing', salary: '$75K - $125K', icon: 'Factory' },
      { title: 'CAD/CAM Engineer', category: 'design', salary: '$75K - $120K', icon: 'PenTool' },
      { title: 'Mechatronics Engineer', category: 'robotics', salary: '$85K - $140K', icon: 'Settings' },
      { title: 'Fluid Mechanics Engineer', category: 'thermal', salary: '$80K - $135K', icon: 'Droplet' },
      { title: 'Quality Control Engineer', category: 'manufacturing', salary: '$70K - $115K', icon: 'CheckCircle' },
      { title: 'Maintenance Engineer', category: 'manufacturing', salary: '$70K - $115K', icon: 'Wrench' },
      { title: 'Materials Science Engineer', category: 'design', salary: '$85K - $140K', icon: 'Layers' },
      { title: 'Acoustics Engineer', category: 'design', salary: '$80K - $130K', icon: 'Volume2' },
      { title: 'Automation Systems Engineer', category: 'robotics', salary: '$85K - $140K', icon: 'Zap' },
      { title: 'Supply Chain Engineer', category: 'manufacturing', salary: '$75K - $125K', icon: 'Truck' },
      { title: 'Piping Design Engineer', category: 'design', salary: '$75K - $125K', icon: 'Link' },
      { title: 'Ergonomics Engineer', category: 'design', salary: '$75K - $120K', icon: 'User' },
      { title: 'Tooling Engineer', category: 'manufacturing', salary: '$75K - $125K', icon: 'Tool' },
      { title: 'Biomechanics Engineer', category: 'design', salary: '$90K - $145K', icon: 'Activity' }
    ]
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    prefix: 'civil',
    categories: ['structural', 'construction', 'environmental', 'transportation'],
    careers: [
      { title: 'Structural Engineer', category: 'structural', salary: '$80K - $135K', icon: 'Building' },
      { title: 'Construction Manager', category: 'construction', salary: '$85K - $145K', icon: 'HardHat' },
      { title: 'Transportation Engineer', category: 'transportation', salary: '$80K - $130K', icon: 'Map' },
      { title: 'Geotechnical Engineer', category: 'structural', salary: '$85K - $140K', icon: 'Mountain' },
      { title: 'Environmental Engineer', category: 'environmental', salary: '$80K - $135K', icon: 'Leaf' },
      { title: 'Water Resources Engineer', category: 'environmental', salary: '$80K - $130K', icon: 'Droplet' },
      { title: 'Urban Planner', category: 'transportation', salary: '$75K - $120K', icon: 'MapPin' },
      { title: 'Surveying Engineer', category: 'construction', salary: '$70K - $115K', icon: 'Compass' },
      { title: 'Coastal Engineer', category: 'environmental', salary: '$85K - $140K', icon: 'Waves' },
      { title: 'Earthquake Engineer', category: 'structural', salary: '$90K - $150K', icon: 'Activity' },
      { title: 'Architectural Engineer', category: 'structural', salary: '$80K - $135K', icon: 'Home' },
      { title: 'Materials Testing Engineer', category: 'construction', salary: '$75K - $120K', icon: 'Search' },
      { title: 'Highway Engineer', category: 'transportation', salary: '$80K - $135K', icon: 'Road' },
      { title: 'Bridge Design Engineer', category: 'structural', salary: '$85K - $145K', icon: 'Link' },
      { title: 'Tunneling Engineer', category: 'structural', salary: '$90K - $150K', icon: 'Circle' },
      { title: 'Estimating Engineer', category: 'construction', salary: '$75K - $125K', icon: 'DollarSign' },
      { title: 'BIM Modeler/Manager', category: 'construction', salary: '$80K - $135K', icon: 'Box' },
      { title: 'Site Engineer', category: 'construction', salary: '$70K - $115K', icon: 'Map' },
      { title: 'Sustainability Engineer', category: 'environmental', salary: '$80K - $130K', icon: 'Sun' }
    ]
  },
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    prefix: 'chem',
    categories: ['process', 'biotech', 'materials', 'environmental'],
    careers: [
      { title: 'Process Engineer', category: 'process', salary: '$85K - $140K', icon: 'Settings' },
      { title: 'Petrochemical Engineer', category: 'process', salary: '$90K - $150K', icon: 'Droplet' },
      { title: 'Pharmaceutical Engineer', category: 'biotech', salary: '$90K - $145K', icon: 'Pill' },
      { title: 'Food Technologist', category: 'process', salary: '$75K - $120K', icon: 'Coffee' },
      { title: 'Polymer Engineer', category: 'materials', salary: '$85K - $140K', icon: 'Layers' },
      { title: 'Biotechnology Engineer', category: 'biotech', salary: '$90K - $150K', icon: 'Microscope' },
      { title: 'Environmental Chem Engineer', category: 'environmental', salary: '$80K - $135K', icon: 'Leaf' },
      { title: 'Materials Scientist', category: 'materials', salary: '$85K - $140K', icon: 'Atom' },
      { title: 'Safety Engineer', category: 'process', salary: '$80K - $135K', icon: 'ShieldAlert' },
      { title: 'Quality Assurance Engineer', category: 'process', salary: '$75K - $125K', icon: 'CheckCircle' },
      { title: 'Water Treatment Engineer', category: 'environmental', salary: '$80K - $130K', icon: 'Droplets' },
      { title: 'Paper & Pulp Engineer', category: 'process', salary: '$75K - $120K', icon: 'FileText' },
      { title: 'Thermodynamics Engineer', category: 'process', salary: '$85K - $140K', icon: 'Thermometer' },
      { title: 'Cosmetics Formulation Engineer', category: 'materials', salary: '$80K - $130K', icon: 'Smile' },
      { title: 'Fertilizer Production Engineer', category: 'process', salary: '$80K - $130K', icon: 'Plant' },
      { title: 'Battery Manufacturing Engineer', category: 'materials', salary: '$90K - $145K', icon: 'Battery' },
      { title: 'Nano-technology Engineer', category: 'materials', salary: '$95K - $155K', icon: 'Maximize' },
      { title: 'Corrosion Engineer', category: 'materials', salary: '$85K - $135K', icon: 'Shield' },
      { title: 'Reaction Engineer', category: 'process', salary: '$90K - $145K', icon: 'Activity' }
    ]
  }
];

const gradients = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-cyan-500 to-blue-500',
  'from-indigo-500 to-purple-500'
];

branches.forEach(branch => {
  const roadmaps = branch.careers.map((career, index) => {
    const id = `${branch.prefix}-${index + 1}`;
    const gradient = gradients[index % gradients.length];
    
    return `{
    id: '${id}',
    title: '${career.title}',
    category: '${career.category}',
    branch: '${branch.id}',
    icon: '${career.icon}',
    gradient: '${gradient}',
    difficulty: 'Intermediate',
    duration: '4-6 months',
    salary: '${career.salary}',
    demand: 'High',
    tags: ['${branch.prefix.toUpperCase()}', '${career.category}'],
    description: 'A complete career path to becoming a ${career.title} in the ${branch.name} industry.',
    overview: 'This roadmap provides a structured path from fundamentals to advanced concepts required to excel as a ${career.title}. You will learn industry-standard tools, design principles, and best practices to become a highly sought-after professional.',
    phases: [
      {
        id: '${id}-p1',
        title: 'Core Fundamentals',
        estimatedTime: '2 months',
        description: 'Build a solid foundation in core concepts and principles.',
        stages: [
          {
            id: '${id}-s1',
            title: 'Basic Principles',
            estimatedTime: '4 weeks',
            topics: [
              { id: '${id}-t1', name: 'Introductory Concepts', description: 'Fundamental theories and mathematics.' },
              { id: '${id}-t2', name: 'Material & Systems', description: 'Understanding basic components and materials.' }
            ],
            projects: ['Basic Concept Application'],
            resources: ['Standard Textbooks', 'Online Lectures']
          },
          {
            id: '${id}-s2',
            title: 'Foundational Tools',
            estimatedTime: '4 weeks',
            topics: [
              { id: '${id}-t3', name: 'Industry Software', description: 'CAD, simulation, or analysis tools.' },
              { id: '${id}-t4', name: 'Measurement & Testing', description: 'Standard testing and measurement protocols.' }
            ],
            projects: ['Software Simulation Project'],
            resources: ['Software Documentation', 'Tutorials']
          }
        ]
      },
      {
        id: '${id}-p2',
        title: 'Advanced Specialization',
        estimatedTime: '3 months',
        description: 'Master advanced techniques and industry-specific applications.',
        stages: [
          {
            id: '${id}-s3',
            title: 'Advanced Design & Analysis',
            estimatedTime: '6 weeks',
            topics: [
              { id: '${id}-t5', name: 'Complex Systems Design', description: 'Designing multi-component systems.' },
              { id: '${id}-t6', name: 'Optimization Techniques', description: 'Improving efficiency and performance.' }
            ],
            projects: ['Advanced System Design'],
            resources: ['Research Papers', 'Advanced Guides']
          },
          {
            id: '${id}-s4',
            title: 'Industry Standards & Deployment',
            estimatedTime: '6 weeks',
            topics: [
              { id: '${id}-t7', name: 'Safety & Compliance', description: 'Understanding industry regulations.' },
              { id: '${id}-t8', name: 'Real-world Deployment', description: 'Taking a design to production or site.' }
            ],
            projects: ['Capstone Project'],
            resources: ['Industry Codes', 'Case Studies']
          }
        ]
      }
    ]
  }`;
  });

  const fileContent = `export const ${branch.prefix}Roadmaps = [\n${roadmaps.join(',\n')}\n];\n`;
  const filePath = path.join(__dirname, '..', 'src', 'pages', 'Roadmaps', 'data', `${branch.prefix}Roadmaps.js`);
  
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`Generated ${filePath}`);
});
