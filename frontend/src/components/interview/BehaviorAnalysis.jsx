import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { Loader2, Eye, Smile, AlertCircle, Zap } from 'lucide-react';

const BehaviorAnalysis = forwardRef(({ onStatusChange }, ref) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);

    // Metrics State (Real-time)
    const [metrics, setMetrics] = useState({
        eyeContact: 50, // %
        confidence: 50, // 0-100
        engagement: 50, // 0-100
        status: 'Analyzing...'
    });

    // Accumulators for Final Report
    const historyRef = useRef({
        eyeContact: [],
        confidence: [],
        engagement: [],
        blinks: 0,
        expressions: { smile: 0, neutral: 0, nervous: 0 },
        frameCount: 0
    });

    // Expose final report generation to parent
    useImperativeHandle(ref, () => ({
        getReport: () => {
            const h = historyRef.current;
            const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

            return {
                overallScore: Math.round((avg(h.confidence) + avg(h.eyeContact) + avg(h.engagement)) / 3),
                eyeContact: Math.round(avg(h.eyeContact)),
                engagementScore: Math.round(avg(h.engagement)),
                blinkRate: Math.round((h.blinks / (h.frameCount / 30)) * 60) || 0, // Blinks per min (assuming ~30fps)
                expression: {
                    smile: Math.round((h.expressions.smile / h.frameCount) * 100),
                    neutral: Math.round((h.expressions.neutral / h.frameCount) * 100),
                    nervous: Math.round((h.expressions.nervous / h.frameCount) * 100)
                },
                feedback: generateFeedback(avg(h.eyeContact), avg(h.confidence))
            };
        }
    }));

    const generateFeedback = (eyeContact, confidence) => {
        const feedback = [];
        if (eyeContact > 70) feedback.push("Excellent eye contact, showing strong engagement.");
        else if (eyeContact < 40) feedback.push("Try to look at the camera more often to build connection.");

        if (confidence > 70) feedback.push("Maintained a confident and calm demeanor throughout.");
        else if (confidence < 50) feedback.push("Detected signs of nervousness (frequent looking down/away).");

        return feedback;
    };

    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(onResults);

        if (webcamRef.current && webcamRef.current.video) {
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (webcamRef.current?.video) {
                        await faceMesh.send({ image: webcamRef.current.video });
                    }
                },
                width: 640,
                height: 480,
            });
            camera.start();
            setIsModelLoaded(true);
        }

        return () => {
            faceMesh.close();
        };
    }, []);

    const onResults = (results) => {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

        const landmarks = results.multiFaceLandmarks[0];
        historyRef.current.frameCount++;

        // --- 1. Eye Contact Analysis ---
        // Simple heuristic: Iris position (468, 473) relative to Eye corners
        // For accurate gaze, we'd need calibration, but relative to center is a good proxy.
        // We check if face is roughly frontal and eyes are open.

        // Head Pose (Nose 1, Left Ear 234, Right Ear 454)
        const nose = landmarks[1];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];

        // Calculate Yaw (Left/Right turn)
        const faceCenterX = (leftEar.x + rightEar.x) / 2;
        const yaw = nose.x - faceCenterX; // Positive = Right, Negative = Left

        // Calculate Pitch (Up/Down)
        const eyeLineY = (landmarks[33].y + landmarks[263].y) / 2; // Midpoint of eyes
        const pitch = nose.y - eyeLineY; // Rough pitch

        // Is looking at camera? (Yaw and Pitch close to 0)
        const isLookingAtCamera = Math.abs(yaw) < 0.05 && Math.abs(pitch) < 0.05;
        const eyeContactScore = isLookingAtCamera ? 100 : 40;

        // --- 2. Blink Detection (EAR) ---
        // Left Eye: 33, 160, 158, 133, 153, 144
        const leftEAR = calculateEAR(landmarks, [33, 160, 158, 133, 153, 144]);
        const rightEAR = calculateEAR(landmarks, [362, 385, 387, 263, 373, 380]);
        const avgEAR = (leftEAR + rightEAR) / 2;

        if (avgEAR < 0.2) {
            historyRef.current.blinks++; // Blink detected (rough threshold)
        }

        // --- 3. Expression / Engagement ---
        // Smile detection: Mouth width vs Face width
        const mouthLeft = landmarks[61];
        const mouthRight = landmarks[291];
        const mouthWidth = Math.hypot(mouthRight.x - mouthLeft.x, mouthRight.y - mouthLeft.y);
        const faceWidth = Math.hypot(rightEar.x - leftEar.x, rightEar.y - leftEar.y);

        const smileRatio = mouthWidth / faceWidth;
        let expressionScore = 50;

        if (smileRatio > 0.45) {
            historyRef.current.expressions.smile++;
            expressionScore = 90; // Smiling
        } else {
            historyRef.current.expressions.neutral++;
            expressionScore = 60; // Neutral
        }

        // --- Update State & History ---
        // Rolling average for stability
        const newEyeContact = (metrics.eyeContact * 0.9) + (eyeContactScore * 0.1);
        const newConfidence = (metrics.confidence * 0.9) + ((isLookingAtCamera ? 80 : 50) * 0.1);
        const newEngagement = (metrics.engagement * 0.9) + (expressionScore * 0.1);

        setMetrics({
            eyeContact: Math.round(newEyeContact),
            confidence: Math.round(newConfidence),
            engagement: Math.round(newEngagement),
            status: isLookingAtCamera ? 'Good Eye Contact' : 'Look at Camera'
        });

        // Save to history
        historyRef.current.eyeContact.push(eyeContactScore);
        historyRef.current.confidence.push(isLookingAtCamera ? 85 : 50); // Simplified confidence
        historyRef.current.engagement.push(expressionScore);
    };

    const calculateEAR = (landmarks, indices) => {
        // EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
        const p1 = landmarks[indices[0]];
        const p2 = landmarks[indices[1]];
        const p3 = landmarks[indices[2]];
        const p4 = landmarks[indices[3]];
        const p5 = landmarks[indices[4]];
        const p6 = landmarks[indices[5]];

        const dist = (pA, pB) => Math.hypot(pA.x - pB.x, pA.y - pB.y);

        return (dist(p2, p6) + dist(p3, p5)) / (2 * dist(p1, p4));
    };

    return (
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <Webcam
                ref={webcamRef}
                mirrored
                className="w-full h-full object-cover"
            />

            {/* Overlay UI - Stats Stacked on Left Side */}

            {/* Eye Contact Tracker - Below Rec Badge */}
            <div className="absolute top-16 left-4 z-20">
                <div className="bg-black/50 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-white space-y-2 w-48">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Eye className={`w-4 h-4 ${metrics.eyeContact > 60 ? 'text-green-400' : 'text-yellow-400'}`} />
                            <div className="text-xs font-medium">Eye Contact</div>
                        </div>
                        <div className="text-xs font-bold text-green-400">{metrics.eyeContact}%</div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${metrics.eyeContact > 60 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${metrics.eyeContact}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Confidence Score - Below Eye Contact */}
            <div className="absolute top-36 left-4 z-20">
                <div className="bg-black/50 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-white w-48">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-bold">Confidence</span>
                        </div>
                        <div className="text-sm font-bold text-blue-400">{metrics.confidence}/100</div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${metrics.confidence}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Status Feedback Pill */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className={`px-4 py-1.5 rounded-full backdrop-blur-md border shadow-lg text-sm font-semibold flex items-center gap-2 transition-all
                     ${metrics.status === 'Good Eye Contact'
                        ? 'bg-green-500/20 border-green-500/30 text-green-300'
                        : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'}`}>
                    {metrics.status === 'Good Eye Contact' ? <Smile className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {metrics.status}
                </div>
            </div>

            {!isModelLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <Loader2 className="w-8 h-8 text-[rgb(var(--accent))] animate-spin" />
                    <span className="ml-2 text-white text-sm">Initializing AI...</span>
                </div>
            )}
        </div>
    );
});

export default BehaviorAnalysis;
