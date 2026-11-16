import React, { useEffect, useRef, useState } from 'react';
import { GameMode } from '../types';

interface DynamicBackdropProps {
  variant: 'title' | 'playing';
  mode: GameMode;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  life: number;
  maxLife: number;
  spriteIdx: number;
}

export function triggerBackdropBurst(clientX: number, clientY: number, color = '#FBBF24', count = 12) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('worddot:burst', {
      detail: { x: clientX, y: clientY, color, count },
    })
  );
}

const BACKDROP_SRC = '/src/assets/images/storybook_playground_bg_1794679788738.jpg';

// Module-level cache of one-time pre-blurred & color-graded backdrop variants (0 continuous GPU load)
const prebakedBackdropCache: Record<string, string> = {};

function bakeSoftBackdropOnce(
  img: HTMLImageElement,
  variant: 'title' | 'playing',
  mode: GameMode
): string {
  const aspect = img.naturalHeight / Math.max(1, img.naturalWidth);
  const w = variant === 'title' ? 680 : 540;
  const h = Math.max(180, Math.round(w * aspect));
  const blurPx = variant === 'title' ? 2.4 : 4.0;

  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d');
  if (!ctx) return BACKDROP_SRC;

  const pad = Math.ceil(blurPx * 2.5);
  if ('filter' in ctx) {
    ctx.filter = `blur(${blurPx}px)`;
  }
  ctx.drawImage(img, -pad, -pad, w + pad * 2, h + pad * 2);
  if ('filter' in ctx) {
    ctx.filter = 'none';
  }

  // Bake atmospheric depth-of-field color grading once into the static image
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  if (variant === 'playing') {
    if (mode === 'sentence') {
      grad.addColorStop(0, 'rgba(224, 242, 254, 0.52)');
      grad.addColorStop(0.5, 'rgba(255, 251, 235, 0.36)');
      grad.addColorStop(1, 'rgba(209, 250, 229, 0.50)');
    } else {
      grad.addColorStop(0, 'rgba(224, 231, 255, 0.50)');
      grad.addColorStop(0.5, 'rgba(240, 249, 255, 0.36)');
      grad.addColorStop(1, 'rgba(252, 231, 243, 0.46)');
    }
  } else {
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.14)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.02)');
    grad.addColorStop(1, 'rgba(6, 78, 59, 0.14)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  return off.toDataURL('image/jpeg', 0.88);
}

function createBokehSprite(color: string, size: number, softness: number): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (!octx) return off;

  const half = size / 2;
  const grad = octx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, color);
  grad.addColorStop(softness, color);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  octx.fillStyle = grad;
  octx.fillRect(0, 0, size, size);
  return off;
}

function createSparkleSprite(color: string): HTMLCanvasElement {
  const size = 28;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (!octx) return off;

  const c = size / 2;
  const grad = octx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  octx.fillStyle = grad;
  octx.fillRect(0, 0, size, size);

  octx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  octx.beginPath();
  octx.ellipse(c, c, 1.6, 8, 0, 0, Math.PI * 2);
  octx.ellipse(c, c, 8, 1.6, 0, 0, Math.PI * 2);
  octx.fill();
  return off;
}

function renderStaticAtmosphere(
  target: HTMLCanvasElement,
  width: number,
  height: number,
  variant: 'title' | 'playing',
  mode: GameMode,
  palette: string[]
) {
  target.width = width;
  target.height = height;
  const ctx = target.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  // 1. Soft radial bokeh halos (painted once, zero runtime shader cost)
  const halos: Array<[number, number, number, string]> = [
    [width * 0.12, height * 0.12, width * 0.25, 'rgba(253, 224, 71, 0.28)'],
    [width * 0.88, height * 0.34, width * 0.23, 'rgba(56, 189, 248, 0.24)'],
    [width * 0.48, height * 0.84, width * 0.24, 'rgba(52, 211, 153, 0.22)'],
  ];
  for (const [cx, cy, r, color] of halos) {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Diagonal warm sunbeam shaft (painted once)
  const beamGrad = ctx.createLinearGradient(0, 0, width * 0.65, height * 0.75);
  const beamAlpha = variant === 'title' ? 0.24 : 0.15;
  beamGrad.addColorStop(0, `rgba(254, 243, 199, ${beamAlpha})`);
  beamGrad.addColorStop(0.55, `rgba(255, 255, 255, ${beamAlpha * 0.45})`);
  beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width * 0.36, 0);
  ctx.lineTo(width * 0.72, height * 0.78);
  ctx.lineTo(width * 0.38, height * 0.92);
  ctx.lineTo(0, height * 0.34);
  ctx.closePath();
  ctx.fill();

  // 3. Soft deterministic bokeh & sparkle accents (painted once)
  const softSprites = palette.map(c => createBokehSprite(c, 42, 0.32));
  const sparkleSprites = palette.map(c => createSparkleSprite(c));
  const count = variant === 'title' ? 16 : 12;
  for (let i = 0; i < count; i++) {
    // Golden-ratio deterministic distribution so layout stays balanced on resize
    const fx = ((i * 0.6180339) % 1) * width;
    const fy = (((i * 0.381966) + 0.13) % 1) * height;
    const isBokeh = i % 2 === 0;
    const r = isBokeh ? 14 + (i % 4) * 5 : 8 + (i % 3) * 3;
    ctx.globalAlpha = isBokeh ? 0.28 : 0.62;
    const sprite = isBokeh
      ? softSprites[i % palette.length]
      : sparkleSprites[i % palette.length];
    ctx.drawImage(sprite, fx - r, fy - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;

  // Subtle mode tint accent in upper corner
  if (mode === 'spelling') {
    const spGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 0, width * 0.85, height * 0.15, width * 0.3);
    spGrad.addColorStop(0, 'rgba(196, 181, 253, 0.22)');
    spGrad.addColorStop(1, 'rgba(196, 181, 253, 0)');
    ctx.fillStyle = spGrad;
    ctx.fillRect(0, 0, width, height);
  }
}

export const DynamicBackdrop: React.FC<DynamicBackdropProps> = ({ variant, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const cacheKey = `${variant}-${mode}`;
  const [softBackdropUrl, setSoftBackdropUrl] = useState<string>(
    () => prebakedBackdropCache[cacheKey] || BACKDROP_SRC
  );

  // One-time offscreen optical-blur + atmospheric tint bake per variant+mode
  useEffect(() => {
    const cached = prebakedBackdropCache[cacheKey];
    if (cached) {
      setSoftBackdropUrl(cached);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const baked = bakeSoftBackdropOnce(img, variant, mode);
        prebakedBackdropCache[cacheKey] = baked;
        setSoftBackdropUrl(baked);
      } catch {
        setSoftBackdropUrl(BACKDROP_SRC);
      }
    };
    img.onerror = () => {
      if (!cancelled) setImgFailed(true);
    };
    img.src = BACKDROP_SRC;

    return () => {
      cancelled = true;
    };
  }, [cacheKey, variant, mode]);

  // Zero-idle-loop atmospheric canvas:
  // Draws static DoF bokeh/sunbeam scene ONCE, and ONLY runs rAF during ~0.6s interactive bursts!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const palette =
      mode === 'sentence'
        ? ['#FBBF24', '#38BDF8', '#34D399', '#F472B6', '#FFFFFF']
        : ['#A78BFA', '#38BDF8', '#FBBF24', '#FB7185', '#FFFFFF'];

    const burstSprites = palette.map(c => createSparkleSprite(c));
    const staticBuffer = document.createElement('canvas');

    let width = 1280;
    let height = 720;
    let animId = 0;
    let lastDraw = 0;
    const bursts: BurstParticle[] = [];

    const drawRestFrame = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(staticBuffer, 0, 0);
    };

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(0.8, 1280 / Math.max(1, vw));
      width = Math.max(320, Math.round(vw * scale));
      height = Math.max(240, Math.round(vh * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      renderStaticAtmosphere(staticBuffer, width, height, variant, mode, palette);
      drawRestFrame();
    };

    resize();
    window.addEventListener('resize', resize);

    const stopLoop = () => {
      if (animId !== 0) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const tick = (now: number) => {
      if (document.hidden || bursts.length === 0) {
        bursts.length = 0;
        drawRestFrame();
        animId = 0;
        return;
      }

      const dt = Math.min((now - lastDraw) / 1000, 0.05);
      lastDraw = now;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(staticBuffer, 0, 0);

      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        p.vx *= 0.95;
        p.life += dt;
        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        const size = p.r * 2 * (1 - progress * 0.3);
        ctx.globalAlpha = (1 - progress) * p.alpha;
        ctx.drawImage(burstSprites[p.spriteIdx], p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      if (bursts.length > 0) {
        animId = requestAnimationFrame(tick);
      } else {
        drawRestFrame();
        animId = 0;
      }
    };

    const onBurst = (e: Event) => {
      if (prefersReducedMotion || document.hidden) return;
      const ce = e as CustomEvent<{ x: number; y: number; color: string; count: number }>;
      const scaleX = width / Math.max(1, window.innerWidth);
      const scaleY = height / Math.max(1, window.innerHeight);
      const bx = ce.detail.x * scaleX;
      const by = ce.detail.y * scaleY;
      const spriteIdx = Math.max(0, palette.indexOf(ce.detail.color));
      const clampedCount = Math.min(ce.detail.count, 10);

      // Cap total active burst particles
      if (bursts.length > 24) bursts.splice(0, bursts.length - 24);

      for (let i = 0; i < clampedCount; i++) {
        const angle = (Math.PI * 2 * i) / clampedCount + (Math.random() - 0.5) * 0.35;
        const speed = (65 + Math.random() * 120) * scaleX;
        bursts.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 22 * scaleY,
          r: (9 + Math.random() * 6) * scaleX,
          alpha: 0.95,
          life: 0,
          maxLife: 0.48 + Math.random() * 0.2,
          spriteIdx: i % 3 === 0 ? palette.length - 1 : spriteIdx,
        });
      }

      if (animId === 0) {
        lastDraw = performance.now();
        animId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('worddot:burst', onBurst);

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('worddot:burst', onBurst);
    };
  }, [mode, variant]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Layer 1: Static Pre-Blurred & Color-Graded Depth-of-Field Meadow Backdrop (0% continuous CPU/GPU) */}
      {!imgFailed ? (
        <img
          src={softBackdropUrl}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200" />
      )}

      {/* Layer 2: Two Tiny Lightweight SVG Clouds Drifting Slowly in Upper Sky */}
      <div className="absolute inset-x-0 top-0 h-32 overflow-hidden">
        <svg
          viewBox="0 0 120 56"
          aria-hidden="true"
          className="absolute top-4 left-0 w-24 h-11 opacity-60 animate-cloud-slow motion-reduce:animate-none"
        >
          <path
            d="M24 44h70a14 14 0 0 0 2-28 20 20 0 0 0-38-6 16 16 0 0 0-28 10A12 12 0 0 0 24 44Z"
            fill="#FFFFFF"
          />
        </svg>
        <svg
          viewBox="0 0 120 56"
          aria-hidden="true"
          className="absolute top-14 left-0 w-20 h-9 opacity-45 animate-cloud-slower motion-reduce:animate-none"
          style={{ animationDelay: '-26s' }}
        >
          <path
            d="M24 44h70a14 14 0 0 0 2-28 20 20 0 0 0-38-6 16 16 0 0 0-28 10A12 12 0 0 0 24 44Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Layer 3: On-Demand Atmospheric Canvas (0% idle CPU/GPU; wakes briefly only for interactive bursts) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
