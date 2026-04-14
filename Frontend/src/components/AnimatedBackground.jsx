import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationId;
        let width, height;
        let mouse = { x: -9999, y: -9999 };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', onMouseMove);

        // ── Node class with cursor repulsion ──────────────────────
        const NODE_COUNT = 80;
        const CONNECT_DIST = 150;
        const MOUSE_REPEL_DIST = 120;
        const MOUSE_REPEL_FORCE = 3.5;

        class Node {
            constructor() {
                this.ox = Math.random() * width;   // origin x
                this.oy = Math.random() * height;  // origin y
                this.x = this.ox;
                this.y = this.oy;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 2 + 1.2;
                this.hue = [18, 22, 14, 26, 10][Math.floor(Math.random() * 5)];
            }

            update() {
                // Gentle autonomous drift
                this.vx += (Math.random() - 0.5) * 0.02;
                this.vy += (Math.random() - 0.5) * 0.02;

                // Cursor repulsion
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_REPEL_DIST && dist > 0) {
                    const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST;
                    this.vx += (dx / dist) * force * MOUSE_REPEL_FORCE * 0.08;
                    this.vy += (dy / dist) * force * MOUSE_REPEL_FORCE * 0.08;
                }

                // Dampen & move
                this.vx *= 0.955;
                this.vy *= 0.955;
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) { this.vx *= -1; this.x = Math.max(0, Math.min(width, this.x)); }
                if (this.y < 0 || this.y > height) { this.vy *= -1; this.y = Math.max(0, Math.min(height, this.y)); }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = 0.9;
                ctx.shadowColor = `hsl(${this.hue}, 100%, 62%)`;
                ctx.shadowBlur = 10;
                ctx.fillStyle = `hsl(${this.hue}, 95%, 62%)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const nodes = Array.from({ length: NODE_COUNT }, () => new Node());

        // ── Draw mesh lines between nodes ─────────────────────────
        const drawMesh = () => {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECT_DIST) {
                        const alpha = (1 - dist / CONNECT_DIST) * 0.4;
                        ctx.save();
                        ctx.globalAlpha = alpha;
                        const g = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                        g.addColorStop(0, `hsl(${nodes[i].hue}, 90%, 55%)`);
                        g.addColorStop(1, `hsl(${nodes[j].hue}, 90%, 55%)`);
                        ctx.strokeStyle = g;
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        };

        // ── Cursor spotlight: connect nearby nodes to mouse ───────
        const MOUSE_CONNECT_DIST = 180;
        const drawMouseConnections = () => {
            if (mouse.x === -9999) return;
            nodes.forEach(n => {
                const dx = n.x - mouse.x;
                const dy = n.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_CONNECT_DIST) {
                    const alpha = (1 - dist / MOUSE_CONNECT_DIST) * 0.7;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = `hsl(22, 100%, 58%)`;
                    ctx.lineWidth = 1;
                    ctx.shadowColor = 'rgba(249,115,22,0.6)';
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(n.x, n.y);
                    ctx.stroke();
                    ctx.restore();
                }
            });

            // Draw cursor glow dot
            ctx.save();
            const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 40);
            glow.addColorStop(0, 'rgba(249,115,22,0.18)');
            glow.addColorStop(1, 'rgba(249,115,22,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        // ── Subtle background orbs ────────────────────────────────
        let time = 0;
        const orbs = [
            { xR: 0.1, yR: 0.15, r: 340, alpha: 0.28, phase: 0, sp: 0.3 },
            { xR: 0.9, yR: 0.85, r: 400, alpha: 0.22, phase: 2.0, sp: 0.25 },
            { xR: 0.5, yR: 0.5, r: 260, alpha: 0.12, phase: 3.5, sp: 0.4 },
        ];
        const drawOrbs = () => {
            orbs.forEach(o => {
                const x = o.xR * width + Math.sin(time * o.sp + o.phase) * 50;
                const y = o.yR * height + Math.cos(time * o.sp * 0.8 + o.phase) * 38;
                const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
                g.addColorStop(0, `rgba(249,115,22,${o.alpha})`);
                g.addColorStop(1, 'rgba(220,38,38,0)');
                ctx.save();
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, o.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        };

        // ── Glowing top accent line ───────────────────────────────
        const drawTopBar = () => {
            const g = ctx.createLinearGradient(0, 0, width, 0);
            g.addColorStop(0, 'rgba(249,115,22,0)');
            g.addColorStop(0.35, `rgba(249,115,22,${0.6 + 0.2 * Math.sin(time)})`);
            g.addColorStop(0.65, `rgba(220,38,38,${0.5 + 0.2 * Math.sin(time + 1)})`);
            g.addColorStop(1, 'rgba(249,115,22,0)');
            ctx.save();
            ctx.strokeStyle = g;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(249,115,22,0.8)';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.moveTo(0, 1.5);
            ctx.lineTo(width, 1.5);
            ctx.stroke();
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            time += 0.009;

            drawOrbs();
            drawMesh();
            drawMouseConnections();
            nodes.forEach(n => { n.update(); n.draw(); });
            drawTopBar();

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #FFF7F2 0%, #FDF4EE 50%, #F9F4FF 100%)' }}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
};

export default AnimatedBackground;
