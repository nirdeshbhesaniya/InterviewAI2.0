import {
    Cpu, Cloud, Database, Radio, Zap, Wrench, Building,
    Gauge, Battery, FlaskConical, Briefcase
} from 'lucide-react';

export const BRANCHES = [
    {
        id: 'computer',
        name: 'Computer Engineering',
        icon: Cpu,
        color: 'from-blue-500 to-cyan-500',
        description: 'Software, Hardware, and System Design'
    },
    {
        id: 'it',
        name: 'Information Technology',
        icon: Cloud,
        color: 'from-purple-500 to-pink-500',
        description: 'Web Development, Cloud Computing, and Networks'
    },
    {
        id: 'cs-ds',
        name: 'Computer Science (Data Science)',
        icon: Database,
        color: 'from-green-500 to-emerald-500',
        description: 'AI, ML, Data Analytics, and Big Data'
    },
    {
        id: 'electronics',
        name: 'Electronics & Communication',
        icon: Radio,
        color: 'from-orange-500 to-red-500',
        description: 'Communication Systems, Signal Processing'
    },
    {
        id: 'electrical',
        name: 'Electrical Engineering',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        description: 'Power Systems, Control Systems, Machines'
    },
    {
        id: 'mechanical',
        name: 'Mechanical Engineering',
        icon: Wrench,
        color: 'from-gray-500 to-slate-600',
        description: 'Thermodynamics, Mechanics, Manufacturing'
    },
    {
        id: 'civil',
        name: 'Civil Engineering',
        icon: Building,
        color: 'from-stone-500 to-amber-600',
        description: 'Structures, Construction, Transportation'
    },
    {
        id: 'instrumentation',
        name: 'Instrumentation & Control',
        icon: Gauge,
        color: 'from-teal-500 to-cyan-500',
        description: 'Process Control, Automation, Sensors'
    },
    {
        id: 'power-electronics',
        name: 'Power Electronics',
        icon: Battery,
        color: 'from-indigo-500 to-purple-500',
        description: 'Converters, Inverters, Motor Drives'
    },
    {
        id: 'chemical',
        name: 'Chemical Engineering',
        icon: FlaskConical,
        color: 'from-lime-500 to-green-500',
        description: 'Process Engineering, Thermodynamics, Reactors'
    },
    {
        id: 'interview',
        name: 'Interview Preparation',
        icon: Briefcase,
        color: 'from-rose-500 to-pink-500',
        description: 'Technical Interviews, HR, Aptitude, and Resume'
    }
];
