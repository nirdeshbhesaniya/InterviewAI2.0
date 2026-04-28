const express = require('express');
const router = express.Router();
const MockInterview = require('../models/MockInterview');
const { generateMockInterviewData, generateInterviewFeedback, extractResumeProfile } = require('../utils/gemini');
const { authenticateToken } = require('../middlewares/auth');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// Configure Multer for in-memory storage (temporary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create New Mock Interview
router.post('/', authenticateToken, upload.single('resume'), async (req, res) => {
    try {
        const {
            skills,
            degree,
            interviewType,
            difficulty,
            focusArea,
            questionCount = 5,
            jobRole,
            jobExperience,
            resumeContext
        } = req.body;

        if (!skills || !degree || !interviewType || !difficulty || !focusArea) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const normalizeList = (items = []) => {
            if (!Array.isArray(items)) return [];
            return [...new Set(items.map((item) => String(item || '').trim()).filter(Boolean))];
        };

        const isMeaningfulText = (value, minLen = 20) => typeof value === 'string' && value.trim().length >= minLen;

        const pickFirstLines = (text, maxLines = 3) => {
            if (!text) return [];
            return text
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line && line.length > 3)
                .slice(0, maxLines);
        };

        const extractSectionLines = (text, headingPattern) => {
            if (!text) return [];
            const lines = text
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean);

            const startIndex = lines.findIndex((line) => headingPattern.test(line));
            if (startIndex === -1) return [];

            const result = [];
            for (let i = startIndex + 1; i < lines.length; i += 1) {
                const line = lines[i];

                // Stop when another section heading likely starts.
                if (/^(education|skills|experience|work experience|projects?|certifications?|summary|profile|objective)\b/i.test(line)) {
                    break;
                }

                result.push(line.replace(/^[-*•]\s*/, '').trim());
                if (result.length >= 8) break;
            }

            return result.filter(Boolean);
        };

        const mergeCandidateProfiles = (baseProfile = {}, fallbackProfile = {}) => {
            const merged = {
                summary: '',
                education: [],
                skills: [],
                projects: [],
                workExperience: [],
                certifications: []
            };

            merged.summary = isMeaningfulText(baseProfile.summary)
                ? baseProfile.summary.trim()
                : (fallbackProfile.summary || '').trim();

            merged.education = normalizeList([...(baseProfile.education || []), ...(fallbackProfile.education || [])]);
            merged.skills = normalizeList([...(baseProfile.skills || []), ...(fallbackProfile.skills || [])]);
            merged.certifications = normalizeList([...(baseProfile.certifications || []), ...(fallbackProfile.certifications || [])]);

            const normalizeProjects = (projects = []) => {
                if (!Array.isArray(projects)) return [];
                return projects
                    .map((project) => {
                        if (!project || typeof project !== 'object') return null;
                        return {
                            title: String(project.title || '').trim(),
                            description: String(project.description || '').trim(),
                            technologies: normalizeList(project.technologies || [])
                        };
                    })
                    .filter((project) => project && (project.title || project.description || project.technologies.length > 0));
            };

            const normalizeWorkExperience = (items = []) => {
                if (!Array.isArray(items)) return [];
                return items
                    .map((item) => {
                        if (!item || typeof item !== 'object') return null;
                        return {
                            company: String(item.company || '').trim(),
                            role: String(item.role || '').trim(),
                            duration: String(item.duration || '').trim(),
                            highlights: normalizeList(item.highlights || [])
                        };
                    })
                    .filter((item) => item && (item.company || item.role || item.duration || item.highlights.length > 0));
            };

            const mergedProjects = [...normalizeProjects(baseProfile.projects), ...normalizeProjects(fallbackProfile.projects)];
            const mergedExperience = [...normalizeWorkExperience(baseProfile.workExperience), ...normalizeWorkExperience(fallbackProfile.workExperience)];

            merged.projects = mergedProjects.slice(0, 6);
            merged.workExperience = mergedExperience.slice(0, 6);

            return merged;
        };

        const buildFallbackProfileFromText = (resumeText, explicitSkills) => {
            const fallback = {
                summary: '',
                education: [],
                skills: [],
                projects: [],
                workExperience: [],
                certifications: []
            };

            if (!resumeText) {
                fallback.skills = normalizeList(String(explicitSkills || '').split(','));
                return fallback;
            }

            const lines = resumeText
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean);

            fallback.summary = lines.slice(0, 3).join(' ').slice(0, 500);

            const educationMatches = lines.filter((line) => /(b\.tech|btech|m\.tech|mtech|b\.e|bachelor|master|phd|university|college|cgpa|gpa)/i.test(line));
            fallback.education = normalizeList([
                ...extractSectionLines(resumeText, /^(education|academic background|academics)\b/i),
                ...educationMatches
            ]).slice(0, 6);

            const explicitSkillTokens = String(explicitSkills || '')
                .split(',')
                .map((token) => token.trim())
                .filter(Boolean);

            const knownSkillPattern = /(javascript|typescript|react|node\.?js|express|mongo(db)?|sql|mysql|postgres|redis|aws|docker|kubernetes|python|java|c\+\+|html|css|tailwind|next\.?js|graphql|rest api)/ig;
            const textMatches = resumeText.match(knownSkillPattern) || [];

            fallback.skills = normalizeList([...explicitSkillTokens, ...textMatches]);

            const projectLines = [
                ...extractSectionLines(resumeText, /^projects?\b/i),
                ...lines.filter((line) => /project/i.test(line))
            ].slice(0, 4);

            fallback.projects = projectLines.map((line) => ({
                title: line.slice(0, 80),
                description: line,
                technologies: normalizeList((line.match(knownSkillPattern) || []).map((v) => v))
            }));

            const experienceLines = [
                ...extractSectionLines(resumeText, /^(experience|work experience|employment|internship)\b/i),
                ...lines.filter((line) => /(intern|engineer|developer|analyst|company|organization|worked at)/i.test(line))
            ].slice(0, 4);

            fallback.workExperience = experienceLines.map((line) => ({
                company: '',
                role: line.slice(0, 90),
                duration: '',
                highlights: []
            }));

            fallback.certifications = normalizeList([
                ...extractSectionLines(resumeText, /^certifications?\b/i),
                ...lines.filter((line) => /(certified|certification|certificate|coursera|udemy|aws|azure|gcp)/i.test(line))
            ]).slice(0, 6);

            return fallback;
        };

        // Handle PDF Resume Text Extraction (in-memory only — PDF is discarded after this block)
        let extractedResumeText = '';
        let candidateProfile = {};
        let resumeParsingMeta = {
            uploaded: Boolean(req.file),
            parsed: false,
            parseError: null
        };

        if (req.file) {
            try {
                const mimetype = String(req.file.mimetype || '').toLowerCase();
                const originalName = String(req.file.originalname || '').toLowerCase();
                const isLikelyPdf = mimetype.includes('pdf') || originalName.endsWith('.pdf');

                if (!isLikelyPdf) {
                    return res.status(400).json({ error: 'Only PDF resume files are supported.' });
                }

                console.log('[MockInterview] Parsing uploaded PDF resume...');
                const pdfData = await pdfParse(req.file.buffer);
                extractedResumeText = String(pdfData?.text || '').trim();
                // req.file.buffer is now released — PDF not stored anywhere

                if (extractedResumeText.length >= 50) {
                    // Extract structured candidate profile using Gemini AI
                    console.log('[MockInterview] Extracting structured candidate profile from resume...');
                    candidateProfile = await extractResumeProfile(extractedResumeText);
                    resumeParsingMeta.parsed = true;
                } else {
                    resumeParsingMeta.parseError = 'PDF appears scanned/image-only or contains very little selectable text.';
                }

            } catch (pdfError) {
                console.error('[MockInterview] Error parsing PDF:', pdfError.message);
                resumeParsingMeta.parseError = pdfError.message;
                // Non-fatal — continue without resume data
            }
        }

        const profileFallbackText = [String(resumeContext || '').trim(), extractedResumeText].filter(Boolean).join('\n');
        const fallbackProfile = buildFallbackProfileFromText(profileFallbackText, skills);

        // Always enrich AI profile with fallback extraction to avoid partially-empty profile objects.
        candidateProfile = mergeCandidateProfiles(candidateProfile, fallbackProfile);

        // Ensure minimal useful summary exists.
        if (!isMeaningfulText(candidateProfile.summary)) {
            candidateProfile.summary = pickFirstLines(profileFallbackText, 3).join(' ').slice(0, 500);
        }

        if (!isMeaningfulText(candidateProfile.summary)) {
            candidateProfile.summary = `${degree} candidate targeting ${jobRole || 'Software Engineer'} roles with skills in ${String(skills || '').slice(0, 180)}.`;
        }

        // Combine provided context with extracted text for raw resumeContext field
        const finalResumeContext = [
            String(resumeContext || '').trim(),
            extractedResumeText ? `\n--- RESUME CONTENT ---\n${extractedResumeText.slice(0, 5000)}` : '',
            resumeParsingMeta.parseError ? `\n--- RESUME PARSE NOTE ---\n${resumeParsingMeta.parseError}` : ''
        ].join('').trim();

        // Generate Questions using AI (STRICT immutable generation)
        const questions = await generateMockInterviewData(
            skills,
            degree,
            interviewType,
            difficulty,
            focusArea,
            questionCount,
            {
                jobRole,
                jobExperience,
                resumeContext: finalResumeContext,
                candidateProfile
            }
        );

        // Save to DB
        const mockInterview = new MockInterview({
            userId: req.user._id,
            jsonMockResp: JSON.stringify(questions),

            // New Fields
            skills,
            degree,
            interviewType,
            difficulty,
            focusArea,
            questionCount,

            // Config Fields
            jobPosition: jobRole || 'General',
            jobDesc: skills,
            jobExperience: jobExperience || 0,
            resumeContext: finalResumeContext,

            // Structured AI-extracted profile from resume
            candidateProfile,

            createdBy: req.user.email,
            status: 'pending',

            // Map the STRICT JSON format to our Schema
            mockInterviewResult: questions.map(q => ({
                question: q.question,
                correctAnswer: q.ideal_answer
            }))
        });

        const savedInterview = await mockInterview.save();

        console.log(`[MockInterview] Created interview ${savedInterview._id} with ${Object.keys(candidateProfile).length > 0 ? 'structured' : 'no'} candidate profile.`);

        res.status(201).json({
            mockId: savedInterview._id,
            interview: savedInterview,
            resumeParsing: resumeParsingMeta
        });

    } catch (error) {
        console.error("Error creating mock interview:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get User's Mock Interviews
router.get('/user/all', authenticateToken, async (req, res) => {
    try {
        const interviews = await MockInterview.find({ createdBy: req.user.email }).sort({ createdAt: -1 });
        res.json(interviews);
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Single Interview Details
router.get('/:mockId', authenticateToken, async (req, res) => {
    try {
        const { mockId } = req.params;
        const interview = await MockInterview.findById(mockId);

        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        const cp = interview.candidateProfile || {};
        const isSparseProfile = !cp.summary &&
            (!Array.isArray(cp.education) || cp.education.length === 0) &&
            (!Array.isArray(cp.projects) || cp.projects.length === 0) &&
            (!Array.isArray(cp.workExperience) || cp.workExperience.length === 0);

        if (isSparseProfile) {
            const contextText = String(interview.resumeContext || '');
            const contextLines = contextText
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith('---'));

            const inferredSummary = contextLines.slice(0, 3).join(' ').slice(0, 500);
            const inferredEducation = contextLines.filter((line) => /(b\.tech|btech|m\.tech|mtech|bachelor|master|university|college|cgpa|gpa)/i.test(line)).slice(0, 4);
            const inferredProjects = contextLines
                .filter((line) => /project/i.test(line))
                .slice(0, 3)
                .map((line) => ({ title: line.slice(0, 80), description: line, technologies: [] }));
            const inferredExperience = contextLines
                .filter((line) => /(experience|intern|developer|engineer|worked)/i.test(line))
                .slice(0, 3)
                .map((line) => ({ company: '', role: line.slice(0, 100), duration: '', highlights: [] }));

            const inferredSkills = String(interview.skills || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            interview.candidateProfile = {
                summary: cp.summary || inferredSummary || `${interview.degree} candidate with skills in ${interview.skills}.`,
                education: Array.isArray(cp.education) && cp.education.length > 0 ? cp.education : inferredEducation,
                skills: Array.isArray(cp.skills) && cp.skills.length > 0 ? cp.skills : inferredSkills,
                projects: Array.isArray(cp.projects) && cp.projects.length > 0 ? cp.projects : inferredProjects,
                workExperience: Array.isArray(cp.workExperience) && cp.workExperience.length > 0 ? cp.workExperience : inferredExperience,
                certifications: Array.isArray(cp.certifications) ? cp.certifications : []
            };
        }

        res.json(interview);
    } catch (error) {
        console.error("Error fetching interview:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update Interview (Generic Update)
router.put('/:mockId', authenticateToken, async (req, res) => {
    try {
        const { mockId } = req.params;
        const { mockInterviewResult, status, overallFeedback } = req.body;

        const updateData = {};
        if (mockInterviewResult) updateData.mockInterviewResult = mockInterviewResult;
        if (status) updateData.status = status;
        if (overallFeedback) updateData.overallFeedback = overallFeedback;
        if (status === 'completed') updateData.endAt = new Date();

        const updatedInterview = await MockInterview.findByIdAndUpdate(
            mockId,
            updateData,
            { new: true }
        );

        if (!updatedInterview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        res.json(updatedInterview);
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// End Interview & Generate Feedback
router.post('/:mockId/end', authenticateToken, async (req, res) => {
    try {
        const { mockId } = req.params;
        const { transcript, behaviorAnalysis } = req.body;

        const interview = await MockInterview.findById(mockId);
        if (!interview) return res.status(404).json({ error: "Interview not found" });

        // Save Behavior Analysis if provided
        if (behaviorAnalysis) {
            interview.behaviorAnalysis = behaviorAnalysis;
        }

        // Generate Feedback
        const aiFeedback = await generateInterviewFeedback(interview, transcript);

        // Update DB
        interview.status = 'completed';
        interview.endAt = new Date();
        interview.overallFeedback = {
            score: aiFeedback.score,
            summary: aiFeedback.overallSummary,
            improvements: aiFeedback.improvements || [],
            strengths: aiFeedback.strengths || [],
            weaknesses: aiFeedback.weaknesses || [],
            communicationScore: aiFeedback.communicationScore || 0,
            technicalScore: aiFeedback.technicalScore || 0,
            problemSolvingScore: aiFeedback.problemSolvingScore || 0,
            confidenceScore: aiFeedback.confidenceScore || 0,
            starMethodAdherence: aiFeedback.starMethodAdherence || 0,
            skillGaps: aiFeedback.skillGaps || [],
            overallRecommendations: aiFeedback.overallRecommendations || [],
            interviewReadiness: aiFeedback.interviewReadiness || 'Needs More Practice',
            nextSteps: aiFeedback.nextSteps || []
        };

        // Merge Question Feedback (enriched with per-question strengths, improvements, idealApproach)
        if (aiFeedback.feedback && Array.isArray(aiFeedback.feedback)) {
            interview.mockInterviewResult = interview.mockInterviewResult.map(originalQ => {
                const matchingFeedback = aiFeedback.feedback.find(f => f.question.includes(originalQ.question.substring(0, 20))); // fuzzy match
                if (matchingFeedback) {
                    return {
                        ...originalQ.toObject(),
                        userAns: matchingFeedback.userAnswer,
                        feedback: matchingFeedback.feedback,
                        rating: matchingFeedback.rating,
                        questionStrengths: matchingFeedback.strengths || [],
                        questionImprovements: matchingFeedback.improvements || [],
                        idealApproach: matchingFeedback.idealApproach || '',
                        rewrittenAnswer: matchingFeedback.rewrittenAnswer || ''
                    };
                }
                return originalQ;
            });
        }

        await interview.save();
        res.json(interview);

    } catch (error) {
        console.error("Error ending interview:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Mock Interview
router.delete('/:mockId', authenticateToken, async (req, res) => {
    try {
        const { mockId } = req.params;

        // Find and delete the interview, ensuring it belongs to the user
        const deletedInterview = await MockInterview.findOneAndDelete({
            _id: mockId,
            createdBy: req.user.email
        });

        if (!deletedInterview) {
            return res.status(404).json({ error: "Interview not found or unauthorized" });
        }

        res.json({ message: "Interview deleted successfully" });
    } catch (error) {
        console.error("Error deleting interview:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
