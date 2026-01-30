import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AIBackground = () => {
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
                const particleColor = '129, 140, 248'; // Indigo-400 equivalent

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
        const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 100);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Draw connections with gradient
        const drawConnections = () => {
            const connectionColor = '129, 140, 248';

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        const opacity = (1 - distance / 150) * 0.3;

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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.6 }}
            />
            {/* Ambient Gradients - Deep AI/Space Theme */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>
    );
};

export default AIBackground;
