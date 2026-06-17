import {
    Cpu, Radio, Zap, Wrench, Building, FlaskConical
} from 'lucide-react';

export const BRANCHES = [
    {
        id: 'computer',
        name: 'Computer Engineering (includes IT)',
        icon: Cpu,
        color: 'from-blue-500 to-cyan-500',
        description: 'Software, Web Dev, AI/ML, and System Design'
    },
    {
        id: 'electronics',
        name: 'Electronics & Communication Engineering',
        icon: Radio,
        color: 'from-orange-500 to-red-500',
        description: 'Communication Systems, Signal Processing, VLSI'
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
        id: 'chemical',
        name: 'Chemical Engineering',
        icon: FlaskConical,
        color: 'from-lime-500 to-green-500',
        description: 'Process Engineering, Thermodynamics, Reactors'
    }
];
