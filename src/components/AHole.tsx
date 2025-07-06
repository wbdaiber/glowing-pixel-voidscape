
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { RainbowButton } from "@/components/ui/rainbow-button";
import SEODashboard from "@/components/SEODashboard";
import { Search, X } from 'lucide-react';

// Easing functions (simplified version of easing-utils)
const easingUtils = {
  linear: (t: number) => t,
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
};

interface Disc {
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
}

interface Particle {
  x: number;
  sx: number;
  dx: number;
  y: number;
  vy: number;
  p: number;
  r: number;
  c: string;
}

const AHoleComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [showSEODashboard, setShowSEODashboard] = useState(false);
  
  // Animation state
  const stateRef = useRef<{
    ctx: CanvasRenderingContext2D | null;
    rect: DOMRect;
    render: { width: number; height: number; dpi: number };
    discs: Disc[];
    lines: number[][][];
    particles: Particle[];
    startDisc: { x: number; y: number; w: number; h: number };
    endDisc: { x: number; y: number; w: number; h: number };
    clip: { disc: Disc; i: number; path: Path2D };
    linesCanvas: OffscreenCanvas;
    linesCtx: OffscreenCanvasRenderingContext2D;
    particleArea: { sw: number; ew: number; h: number; sx: number; ex: number };
  }>({
    ctx: null,
    rect: new DOMRect(),
    render: { width: 0, height: 0, dpi: 1 },
    discs: [],
    lines: [],
    particles: [],
    startDisc: { x: 0, y: 0, w: 0, h: 0 },
    endDisc: { x: 0, y: 0, w: 0, h: 0 },
    clip: { disc: { x: 0, y: 0, w: 0, h: 0, p: 0 }, i: 0, path: new Path2D() },
    linesCanvas: new OffscreenCanvas(1, 1),
    linesCtx: null as any,
    particleArea: { sw: 0, ew: 0, h: 0, sx: 0, ex: 0 }
  });

  const tweenValue = useCallback((start: number, end: number, p: number, ease: string = 'linear') => {
    const delta = end - start;
    const easeFn = ease === 'inExpo' ? easingUtils.easeInExpo : easingUtils.linear;
    return start + delta * easeFn(p);
  }, []);

  const tweenDisc = useCallback((disc: Disc) => {
    const state = stateRef.current;
    disc.x = tweenValue(state.startDisc.x, state.endDisc.x, disc.p);
    disc.y = tweenValue(state.startDisc.y, state.endDisc.y, disc.p, 'inExpo');
    disc.w = tweenValue(state.startDisc.w, state.endDisc.w, disc.p);
    disc.h = tweenValue(state.startDisc.h, state.endDisc.h, disc.p);
    return disc;
  }, [tweenValue]);

  const setSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const state = stateRef.current;
    state.rect = container.getBoundingClientRect();
    
    state.render = {
      width: state.rect.width,
      height: state.rect.height,
      dpi: window.devicePixelRatio
    };

    canvas.width = state.render.width * state.render.dpi;
    canvas.height = state.render.height * state.render.dpi;
  }, []);

  const setDiscs = useCallback(() => {
    const state = stateRef.current;
    const { width, height } = state.rect;

    state.discs = [];

    state.startDisc = {
      x: width * 0.5,
      y: height * 0.45,
      w: width * 0.75,
      h: height * 0.7
    };

    state.endDisc = {
      x: width * 0.5,
      y: height * 0.95,
      w: 0,
      h: 0
    };

    const totalDiscs = 100;
    let prevBottom = height;

    for (let i = 0; i < totalDiscs; i++) {
      const p = i / totalDiscs;
      const disc = { x: 0, y: 0, w: 0, h: 0, p };
      tweenDisc(disc);

      const bottom = disc.y + disc.h;

      if (bottom <= prevBottom) {
        state.clip = {
          disc: { ...disc },
          i,
          path: new Path2D()
        };
      }

      prevBottom = bottom;
      state.discs.push(disc);
    }

    state.clip.path = new Path2D();
    state.clip.path.ellipse(
      state.clip.disc.x,
      state.clip.disc.y,
      state.clip.disc.w,
      state.clip.disc.h,
      0,
      0,
      Math.PI * 2
    );
    state.clip.path.rect(
      state.clip.disc.x - state.clip.disc.w,
      0,
      state.clip.disc.w * 2,
      state.clip.disc.y
    );
  }, [tweenDisc]);

  const setLines = useCallback(() => {
    const state = stateRef.current;
    const { width, height } = state.rect;

    if (width <= 0 || height <= 0) return;

    state.lines = [];

    const totalLines = 100;
    const linesAngle = (Math.PI * 2) / totalLines;

    for (let i = 0; i < totalLines; i++) {
      state.lines.push([]);
    }

    state.discs.forEach((disc) => {
      for (let i = 0; i < totalLines; i++) {
        const angle = i * linesAngle;

        const p = [
          disc.x + Math.cos(angle) * disc.w,
          disc.y + Math.sin(angle) * disc.h
        ];

        state.lines[i].push(p);
      }
    });

    state.linesCanvas = new OffscreenCanvas(Math.max(1, width), Math.max(1, height));
    const ctx = state.linesCanvas.getContext('2d')!;
    state.linesCtx = ctx;

    state.lines.forEach((line) => {
      ctx.save();

      let lineIsIn = false;
      line.forEach((p1, j) => {
        if (j === 0) return;

        const p0 = line[j - 1];

        if (
          !lineIsIn &&
          (ctx.isPointInPath(state.clip.path, p1[0], p1[1]) ||
            ctx.isPointInStroke(state.clip.path, p1[0], p1[1]))
        ) {
          lineIsIn = true;
        } else if (lineIsIn) {
          ctx.clip(state.clip.path);
        }

        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      });

      ctx.restore();
    });
  }, []);

  const initParticle = useCallback((start = false): Particle => {
    const state = stateRef.current;
    const sx = state.particleArea.sx + state.particleArea.sw * Math.random();
    const ex = state.particleArea.ex + state.particleArea.ew * Math.random();
    const dx = ex - sx;
    const y = start ? state.particleArea.h * Math.random() : state.particleArea.h;
    const r = 0.5 + Math.random() * 4;
    const vy = 0.5 + Math.random();

    return {
      x: sx,
      sx,
      dx,
      y,
      vy,
      p: 0,
      r,
      c: `rgba(255, 255, 255, ${Math.random()})`
    };
  }, []);

  const setParticles = useCallback(() => {
    const state = stateRef.current;
    const { width, height } = state.rect;

    state.particles = [];

    state.particleArea = {
      sw: state.clip.disc.w * 0.5,
      ew: state.clip.disc.w * 2,
      h: height * 0.85,
      sx: 0,
      ex: 0
    };
    state.particleArea.sx = (width - state.particleArea.sw) / 2;
    state.particleArea.ex = (width - state.particleArea.ew) / 2;

    const totalParticles = 100;

    for (let i = 0; i < totalParticles; i++) {
      const particle = initParticle(true);
      state.particles.push(particle);
    }
  }, [initParticle]);

  const drawDiscs = useCallback(() => {
    const state = stateRef.current;
    const { ctx } = state;
    if (!ctx) return;

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;

    const outerDisc = state.startDisc;
    ctx.beginPath();
    ctx.ellipse(outerDisc.x, outerDisc.y, outerDisc.w, outerDisc.h, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    state.discs.forEach((disc, i) => {
      if (i % 5 !== 0) return;

      if (disc.w < state.clip.disc.w - 5) {
        ctx.save();
        ctx.clip(state.clip.path);
      }

      ctx.beginPath();
      ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();

      if (disc.w < state.clip.disc.w - 5) {
        ctx.restore();
      }
    });
  }, []);

  const drawLines = useCallback(() => {
    const state = stateRef.current;
    const { ctx, linesCanvas } = state;
    if (!ctx || !linesCanvas || linesCanvas.width === 0 || linesCanvas.height === 0) return;

    ctx.drawImage(linesCanvas, 0, 0);
  }, []);

  const drawParticles = useCallback(() => {
    const state = stateRef.current;
    const { ctx } = state;
    if (!ctx) return;

    ctx.save();
    ctx.clip(state.clip.path);

    state.particles.forEach((particle) => {
      ctx.fillStyle = particle.c;
      ctx.beginPath();
      ctx.rect(particle.x, particle.y, particle.r, particle.r);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }, []);

  const moveDiscs = useCallback(() => {
    const state = stateRef.current;
    state.discs.forEach((disc) => {
      disc.p = (disc.p + 0.001) % 1;
      tweenDisc(disc);
    });
  }, [tweenDisc]);

  const moveParticles = useCallback(() => {
    const state = stateRef.current;
    state.particles.forEach((particle) => {
      particle.p = 1 - particle.y / state.particleArea.h;
      particle.x = particle.sx + particle.dx * particle.p;
      particle.y -= particle.vy;

      if (particle.y < 0) {
        const newParticle = initParticle();
        particle.y = newParticle.y;
      }
    });
  }, [initParticle]);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state.ctx) return;

    const { ctx } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(state.render.dpi, state.render.dpi);

    moveDiscs();
    moveParticles();

    drawDiscs();
    drawLines();
    drawParticles();

    ctx.restore();

    animationRef.current = requestAnimationFrame(tick);
  }, [moveDiscs, moveParticles, drawDiscs, drawLines, drawParticles]);

  const handleResize = useCallback(() => {
    setSize();
    setDiscs();
    setLines();
    setParticles();
  }, [setSize, setDiscs, setLines, setParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    stateRef.current.ctx = canvas.getContext('2d');
    
    setSize();
    setDiscs();
    setLines();
    setParticles();

    window.addEventListener('resize', handleResize);
    
    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [setSize, setDiscs, setLines, setParticles, handleResize, tick]);

  return (
    <div className="w-screen h-screen bg-zinc-900 relative overflow-hidden" ref={containerRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Martian+Mono:wght@100..800&display=swap');
        
        .ahole-container {
          position: absolute;
          top: 0;
          left: 0;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .ahole-container::before {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          display: block;
          width: 150%;
          height: 140%;
          background: radial-gradient(ellipse at 50% 55%, transparent 10%, black 50%);
          transform: translate3d(-50%, -50%, 0);
          content: "";
        }
        
        .ahole-container::after {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 5;
          display: block;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at 50% 75%, #a900ff 20%, transparent 75%);
          mix-blend-mode: overlay;
          transform: translate3d(-50%, -50%, 0);
          content: "";
        }
        
        .aura {
          position: absolute;
          top: -71.5%;
          left: 50%;
          z-index: 3;
          width: 30%;
          height: 140%;
          background: linear-gradient(
              20deg,
              #00f8f1,
              #ffbd1e20 16.5%,
              #fe848f 33%,
              #fe848f20 49.5%,
              #00f8f1 66%,
              #00f8f160 85.5%,
              #ffbd1e 100%
            )
            0 100% / 100% 200%;
          border-radius: 0 0 100% 100%;
          filter: blur(50px);
          mix-blend-mode: plus-lighter;
          opacity: 0.75;
          transform: translate3d(-50%, 0, 0);
          animation: aura-glow 5s infinite linear;
        }
        
        @keyframes aura-glow {
          0% {
            background-position: 0 100%;
          }
          100% {
            background-position: 0 300%;
          }
        }
        
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 10;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            transparent,
            transparent 1px,
            white 1px,
            white 2px
          );
          mix-blend-mode: overlay;
          opacity: 0.5;
        }
        
        .announcement-badge {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .glow-dot {
          width: 8px;
          height: 8px;
          background: #00f8f1;
          border-radius: 50%;
          box-shadow: 0 0 10px #00f8f1, 0 0 20px #00f8f1, 0 0 30px #00f8f1;
          animation: glow-pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow-pulse {
          0% {
            box-shadow: 0 0 10px #00f8f1, 0 0 20px #00f8f1, 0 0 30px #00f8f1;
            opacity: 0.8;
          }
          100% {
            box-shadow: 0 0 15px #00f8f1, 0 0 30px #00f8f1, 0 0 45px #00f8f1;
            opacity: 1;
          }
        }
        
        canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
      `}</style>
      
      <div className="ahole-container">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="aura" />
        <div className="overlay" />
      </div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="announcement-badge text-white text-sm font-medium px-4 py-2 rounded-full mb-6 flex items-center space-x-3" style={{ fontFamily: 'Martian Mono, monospace' }}>
          <div className="glow-dot"></div>
          <span>SEO Audit Tool</span>
        </div>
        
        <h1 className="text-white text-4xl md:text-6xl font-bold mb-8 text-center tracking-wider" style={{ fontFamily: 'Martian Mono, monospace' }}>
          SEO ANALYSIS
        </h1>
        
        <p className="text-white text-lg md:text-xl mb-8 text-center max-w-2xl px-4 opacity-90" style={{ fontFamily: 'Martian Mono, monospace' }}>
          Comprehensive SEO auditing tool powered by advanced web crawling and analysis algorithms.
        </p>
        
        <div className="pointer-events-auto flex gap-4">
          <RainbowButton 
            onClick={() => setShowSEODashboard(true)}
            style={{ fontFamily: 'Martian Mono, monospace' }}
          >
            <Search className="w-4 h-4 mr-2" />
            Launch SEO Audit
          </RainbowButton>
        </div>
      </div>

      {showSEODashboard && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-lg">
            <button
              onClick={() => setShowSEODashboard(false)}
              className="absolute top-4 right-4 z-40 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors pointer-events-auto"
              style={{ fontFamily: 'Martian Mono, monospace' }}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="h-full overflow-y-auto">
              <SEODashboard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AHoleComponent;
