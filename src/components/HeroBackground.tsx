"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dots: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 18000);
      dots = Array.from({ length: Math.min(count, 60) }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.25 + 0.05,
      }));
    };

    const drawGrid = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const step = 64;
      ctx.strokeStyle = "rgba(0, 245, 255, 0.03)";
      ctx.lineWidth = 1;

      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const tick = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      drawGrid();

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 255, ${d.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full opacity-70" />
      <motion.div
        className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-[100px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
    </div>
  );
}
