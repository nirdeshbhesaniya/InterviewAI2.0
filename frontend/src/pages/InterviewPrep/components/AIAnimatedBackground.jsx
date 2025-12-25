import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AIAnimatedBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let time = 0;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Enhanced Particle class with pulsing effect
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.radius = Math.random() * 2.5 + 1;
                this.opacity = Math.random() * 0.4 + 0.2;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw(time) {
                const isDark = document.documentElement.classList.contains('dark');
                const particleColor = isDark ? '167, 139, 250' : '129, 140, 248';

                // Pulsing effect
                const pulse = Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.3 + 0.7;
                const currentRadius = this.radius * pulse;
                const currentOpacity = this.opacity * pulse;

                // Outer glow
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius * 3);
                gradient.addColorStop(0, `rgba(${particleColor}, ${currentOpacity * 0.8})`);
                gradient.addColorStop(0.5, `rgba(${particleColor}, ${currentOpacity * 0.3})`);
                gradient.addColorStop(1, `rgba(${particleColor}, 0)`);

                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius * 3, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Core particle
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particleColor}, ${currentOpacity})`;
                ctx.fill();
            }
        }

        // Initialize particles
        const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Draw connections with gradient
        const drawConnections = () => {
            const isDark = document.documentElement.classList.contains('dark');
            const connectionColor = isDark ? '167, 139, 250' : '129, 140, 248';

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 180) {
                        const opacity = (1 - distance / 180) * 0.4;

                        const gradient = ctx.createLinearGradient(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y
                        );
                        gradient.addColorStop(0, `rgba(${connectionColor}, ${opacity})`);
                        gradient.addColorStop(0.5, `rgba(${connectionColor}, ${opacity * 0.5})`);
                        gradient.addColorStop(1, `rgba(${connectionColor}, ${opacity})`);

                        ctx.beginPath();
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation loop
        const animate = () => {
            time += 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw(time);
            });

            drawConnections();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.7 }}
            />

            {/* Large vibrant gradient orbs */}
            <motion.div
                className="absolute -top-20 -left-20 w-96 h-96 lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-purple-400/40 via-pink-400/30 to-transparent rounded-full blur-3xl"
                animate={{
                    x: [0, 80, 0],
                    y: [0, -60, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute -bottom-20 -right-20 w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] bg-gradient-to-br from-cyan-400/40 via-blue-400/30 to-transparent rounded-full blur-3xl"
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1, 0.8, 1],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute top-1/3 right-1/4 w-96 h-96 lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-indigo-400/30 via-purple-400/20 to-transparent rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: [0, 180, 360],
                }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-br from-violet-400/25 via-fuchsia-400/15 to-transparent rounded-full blur-2xl"
                animate={{
                    x: [0, 40, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Floating AI elements */}
            <motion.div
                className="absolute top-1/4 right-1/5 opacity-[0.15] dark:opacity-25"
                animate={{
                    y: [0, -25, 0],
                    rotate: [0, 8, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-500 dark:text-purple-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.4} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </motion.div>

            <motion.div
                className="absolute bottom-1/3 left-1/5 opacity-[0.15] dark:opacity-25"
                animate={{
                    y: [0, 25, 0],
                    rotate: [0, -8, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-cyan-500 dark:text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.4} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </motion.div>

            <motion.div
                className="absolute top-2/3 right-1/3 opacity-[0.12] dark:opacity-20"
                animate={{
                    y: [0, -20, 0],
                    x: [0, 15, 0],
                    rotate: [0, 10, 0],
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
                <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-indigo-500 dark:text-indigo-400">
                    <circle cx="12" cy="12" r="3" strokeWidth={0.4} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.4} d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
            </motion.div>

            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(129,140,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(167,139,250,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/[0.08] via-transparent to-cyan-400/[0.08] dark:from-purple-500/[0.12] dark:to-cyan-500/[0.12]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-white/30 dark:from-gray-900/90 dark:via-gray-900/50 dark:to-gray-900/30" />
        </div>
    );
};

export default AIAnimatedBackground;
