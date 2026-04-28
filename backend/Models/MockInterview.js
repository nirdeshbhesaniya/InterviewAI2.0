const mongoose = require('mongoose');

const MockInterviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Basic Details & Configuration
    jsonMockResp: { type: String, required: false }, // Keeping optional for debug

    // User Profile
    degree: { type: String, required: true },
    skills: { type: String, required: true },

    // Interview Config
    interviewType: { type: String, enum: ['Technical', 'Behavioral', 'DSA'], required: true },
    difficulty: { type: String, enum: ['Basic', 'Intermediate', 'Advanced'], required: true },
    focusArea: { type: String, required: true }, // Topics
    questionCount: { type: Number, default: 5 },

    // Keeping job fields for backward compatibility or mapping if needed, 
    // but logically replaced by above. 
    // Making them optional or using default to avoid breaking changes if any old code runs.
    jobPosition: { type: String, default: 'General' },
    jobDesc: { type: String, default: 'General' },
    jobExperience: { type: Number, default: 0 },
    resumeContext: { type: String, required: false }, // User's project or resume summary (raw text)

    // AI-extracted structured profile from uploaded resume PDF
    candidateProfile: {
        summary: { type: String },
        education: [{ type: String }],
        skills: [{ type: String }],
        projects: [
            {
                title: { type: String },
                description: { type: String },
                technologies: [{ type: String }]
            }
        ],
        workExperience: [
            {
                company: { type: String },
                role: { type: String },
                duration: { type: String },
                highlights: [{ type: String }]
            }
        ],
        certifications: [{ type: String }]
    },

    createdBy: { type: String, required: true }, // Email or identifier
    createdAt: { type: Date, default: Date.now },

    startAt: { type: Date },
    endAt: { type: Date },

    status: {
        type: String,
        enum: ['pending', 'completed', 'aborted'],
        default: 'pending'
    },

    // The actual questions generated for this interview
    mockInterviewResult: [
        {
            question: { type: String, required: true },
            description: { type: String }, // Detailed problem statement for DSA
            examples: [ // Test cases/Examples
                {
                    input: String,
                    output: String,
                    explanation: String
                }
            ],
            constraints: [String], // e.g. "1 <= n <= 1000"
            codeTemplates: { // Starter code for each language
                javascript: String,
                python: String,
                java: String,
                cpp: String
            },
            correctAnswer: { type: String }, // Ideal answer for reference
            userAns: { type: String }, // User's transcribed answer
            feedback: { type: String }, // AI feedback on individual answer
            rating: { type: Number }, // Score 1-10
            questionStrengths: [String], // What user did well on this question
            questionImprovements: [String], // What user should improve on this question
            idealApproach: { type: String }, // Ideal approach/strategy for this question
            rewrittenAnswer: { type: String }, // A polished version of candidate's answer
            createdAt: { type: Date, default: Date.now }
        }
    ],

    // Overall feedback after completion
    overallFeedback: {
        summary: String,
        score: Number,
        improvements: [String],
        strengths: [String],
        weaknesses: [String],
        communicationScore: { type: Number, default: 0 },
        technicalScore: { type: Number, default: 0 },
        problemSolvingScore: { type: Number, default: 0 },
        confidenceScore: { type: Number, default: 0 },
        starMethodAdherence: { type: Number, default: 0 },
        skillGaps: [
            {
                skill: String,
                level: String,
                recommendation: String
            }
        ],
        overallRecommendations: [
            {
                category: String,
                tip: String,
                priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
            }
        ],
        interviewReadiness: { type: String, default: 'Needs More Practice' },
        nextSteps: [String]
    },

    // Vapi Call ID for reference
    vapiCallId: { type: String },

    // Real-time Behavior Analysis
    behaviorAnalysis: {
        overallScore: { type: Number },
        eyeContact: { type: Number }, // Percentage
        engagementScore: { type: Number },
        blinkRate: { type: Number },
        expression: {
            smile: { type: Number },
            neutral: { type: Number },
            nervous: { type: Number }
        },
        feedback: [String]
    }

}, { timestamps: true });

module.exports = mongoose.model('MockInterview', MockInterviewSchema);
