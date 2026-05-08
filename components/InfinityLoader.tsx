import { useEffect, useRef } from "react";

interface InfinityLoaderProps {
  size?: number;
  speed?: number;
  tailLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function InfinityLoader({
  size = 320,
  speed = 2.5,
  tailLength = 90,
  className,
  style,
}: InfinityLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const height = Math.round(size * 0.47);
  const STEPS = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = height / 2;
    const a = size * 0.32;

    // Lemniscate of Bernoulli
    // x = a·cos(t) / (1 + sin²(t))
    // y = a·sin(t)·cos(t) / (1 + sin²(t))
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = (i / STEPS) * Math.PI * 2;
      const s = Math.sin(t);
      const c = Math.cos(t);
      const d = 1 + s * s;
      pts.push({ x: cx + (a * c) / d, y: cy + (a * s * c) / d });
    }

    const strokeW = size * 0.022;

    function drawPath(
      context: CanvasRenderingContext2D,
      start: number,
      len: number,
      lineWidth: number,
      alpha: number,
      blur: number,
      full = false
    ) {
      context.save();
      context.shadowBlur = blur;
      context.shadowColor = `rgba(255,255,255,${alpha})`;
      context.strokeStyle = `rgba(255,255,255,${alpha})`;
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      const count = full ? STEPS : len;
      for (let i = 0; i < count; i++) {
        const idx = (start + i) % STEPS;
        const p = pts[idx];
        if (i === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      }
      if (full) context.closePath();
      context.stroke();
      context.restore();
    }

    let frame = 0;

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, height);

      // Static dim base
      drawPath(ctx, 0, 0, strokeW, 0.08, 0, true);
      drawPath(ctx, 0, 0, strokeW, 0.10, 28, true);

      // Traveling glow spot
      const head = Math.floor((frame * speed) % STEPS);

      drawPath(ctx, head, tailLength, strokeW * 3.8, 0.10, 38);
      drawPath(ctx, head, tailLength, strokeW * 2.0, 0.28, 18);
      drawPath(ctx, head, tailLength, strokeW * 1.3, 0.60, 10);
      drawPath(ctx, head, tailLength, strokeW * 0.8, 1.00, 4);

      // Bright head dot
      const hp = pts[head];
      ctx.save();
      ctx.shadowBlur = strokeW * 3;
      ctx.shadowColor = "#fff";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, strokeW * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      frame++;
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, speed, tailLength, height]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", ...style }}
      aria-label="Chargement"
      role="img"
    />
  );
}
