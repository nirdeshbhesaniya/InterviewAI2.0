const FEATURE_LOCKS = [
    {
        key: 'ai_interview_generation',
        label: 'AI Interview Generation',
        description: 'Locks interview creation, regeneration, AI assistance, summaries, and workflow actions.',
        category: 'AI'
    },
    {
        key: 'ai_mcq_generation',
        label: 'AI MCQ Generator',
        description: 'Locks new MCQ generation so users can only view existing content.',
        category: 'Assessments'
    },
    {
        key: 'practice_tests',
        label: 'Practice Tests',
        description: 'Locks the curated practice test library and practice test detail pages.',
        category: 'Assessments'
    },
    {
        key: 'mock_interview',
        label: 'Mock Interview',
        description: 'Locks the mock interview builder, sessions, and feedback flow.',
        category: 'Interview'
    },
    {
        key: 'ai_chatbot',
        label: 'AI Chatbot',
        description: 'Locks the site-wide chatbot assistant endpoint.',
        category: 'AI'
    },
    {
        key: 'code_execution',
        label: 'Code Execution',
        description: 'Locks the code execution workspace and the Judge0-backed compilation endpoint.',
        category: 'Tools'
    }
];

const FEATURE_LOCK_MAP = FEATURE_LOCKS.reduce((accumulator, feature) => {
    accumulator[feature.key] = feature;
    return accumulator;
}, {});

const getManagedFeatureKeys = () => FEATURE_LOCKS.map((feature) => feature.key);

const getFeatureDefinition = (key) => FEATURE_LOCK_MAP[key] || null;

module.exports = {
    FEATURE_LOCKS,
    FEATURE_LOCK_MAP,
    getManagedFeatureKeys,
    getFeatureDefinition
};