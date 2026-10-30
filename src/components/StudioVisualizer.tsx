/**
 * MEYZI BRO STOCK PROJECT — Studio Light & Audio Visualizer
 * Reacts in real time via Web Audio API AnalyserNode.
 * 8 distinct visualizer modes + 5 luxury color themes.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Radio,
  Sparkles,
  Disc,
  Zap,
  BarChart2,
  Maximize,
  Minimize,
  Sliders,
  Palette,
  Power,
  RotateCcw
} from 'lucide-react';
import { studioAudio } from '../services/audioEngine';
import { VisualizerMode, VisualizerTheme } from '../types';

interface StudioVisualizerProps {
  currentTrackTitle?: string;
  currentTrackArtist?: string;
  bpm?: number;
  isCompact?: boolean;
}

export default function StudioVisualizer({
  currentTrackTitle = 'MEYZI BRO OFFICIEL',
  currentTrackArtist = 'STOCK PROJECT',
  bpm = 140,
  isCompact = false
}: StudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visualizer settings
  const [mode, setMode] = useState<VisualizerMode>('spectrum');
  const [theme, setTheme] = useState<VisualizerTheme>('gold');
  const [glowIntensity, setGlowIntensity] = useState<number>(1.2); // 0.2 to 2.0
  const [speed, setSpeed] = useState<number>(1.0); // 0.5 to 2.0
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Band meters for Frequency mode
  const [bands, setBands] = useState({ bass: 0, mid: 0, treble: 0, peak: 0 });

  // Toggle fullscreen on container
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Theme color resolver
  const getThemePalette = (t: VisualizerTheme, alpha = 1) => {
    switch (t) {
      case 'gold':
        return {
          primary: `rgba(212, 175, 55, ${alpha})`,
          secondary: `rgba(247, 224, 140, ${alpha})`,
          dark: `rgba(170, 130, 16, ${alpha})`,
          glow: `rgba(212, 175, 55, ${0.4 * glowIntensity})`,
          core: '#fef08a'
        };
      case 'rgb':
        return {
          primary: `rgba(236, 72, 153, ${alpha})`,
          secondary: `rgba(59, 130, 246, ${alpha})`,
          dark: `rgba(16, 185, 129, ${alpha})`,
          glow: `rgba(168, 85, 247, ${0.4 * glowIntensity})`,
          core: '#ffffff'
        };
      case 'blue_neon':
        return {
          primary: `rgba(6, 182, 212, ${alpha})`,
          secondary: `rgba(56, 189, 248, ${alpha})`,
          dark: `rgba(2, 132, 199, ${alpha})`,
          glow: `rgba(6, 182, 212, ${0.5 * glowIntensity})`,
          core: '#e0f2fe'
        };
      case 'purple_neon':
        return {
          primary: `rgba(192, 38, 211, ${alpha})`,
          secondary: `rgba(232, 121, 249, ${alpha})`,
          dark: `rgba(126, 34, 206, ${alpha})`,
          glow: `rgba(192, 38, 211, ${0.5 * glowIntensity})`,
          core: '#fae8ff'
        };
      case 'red':
        return {
          primary: `rgba(239, 68, 68, ${alpha})`,
          secondary: `rgba(248, 113, 113, ${alpha})`,
          dark: `rgba(185, 28, 28, ${alpha})`,
          glow: `rgba(239, 68, 68, ${0.5 * glowIntensity})`,
          core: '#fee2e2'
        };
    }
  };

  useEffect(() => {
    let animId: number;
    let time = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqBuffer = new Uint8Array(128);
    const waveBuffer = new Uint8Array(128);
    const peakCaps = new Float32Array(128).fill(0);

    // Particle system for 'particles' mode
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      hue: number;
      life: number;
      maxLife: number;
    }
    const particles: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1.5,
        hue: Math.random() * 60,
        life: Math.random() * 100,
        maxLife: 100
      });
    }

    const render = () => {
      // Resize canvas to displayed size
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;

      // Background clearing with motion trail
      ctx.fillStyle = 'rgba(11, 11, 11, 0.35)';
      ctx.fillRect(0, 0, width, height);

      if (!isEnabled) {
        // Disabled mode: simple quiet horizontal line
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      studioAudio.getVisualizerData(freqBuffer);
      studioAudio.getWaveformData(waveBuffer);
      const bandMetrics = studioAudio.getBandsEnergy();
      setBands(bandMetrics);

      const pal = getThemePalette(theme);
      time += 0.02 * speed;

      // -------------------------------------------------------------
      // 1. SPECTRUM MODE
      // -------------------------------------------------------------
      if (mode === 'spectrum') {
        const barCount = Math.min(64, Math.floor(width / 10));
        const barWidth = (width / barCount) * 0.72;
        const gap = (width / barCount) * 0.28;
        const centerY = height * 0.75;

        for (let i = 0; i < barCount; i++) {
          const val = freqBuffer[i] || (Math.sin(time * 3 + i * 0.2) * 20 + 25);
          const barHeight = Math.max(4, (val / 255) * (height * 0.65) * glowIntensity);

          // Update peak cap
          if (barHeight > peakCaps[i]) {
            peakCaps[i] = barHeight;
          } else {
            peakCaps[i] = Math.max(0, peakCaps[i] - 1.2 * speed);
          }

          const x = i * (barWidth + gap) + gap / 2;
          const y = centerY - barHeight;

          // Main vertical bar
          const grad = ctx.createLinearGradient(0, y, 0, centerY);
          if (theme === 'rgb') {
            grad.addColorStop(0, `hsl(${(i * 5 + time * 50) % 360}, 90%, 65%)`);
            grad.addColorStop(1, `hsl(${(i * 5 + time * 50) % 360}, 80%, 25%)`);
          } else {
            grad.addColorStop(0, pal.secondary);
            grad.addColorStop(0.5, pal.primary);
            grad.addColorStop(1, pal.dark);
          }

          ctx.fillStyle = grad;
          ctx.shadowColor = pal.glow;
          ctx.shadowBlur = 10 * glowIntensity;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Peak cap line
          ctx.fillStyle = pal.core;
          ctx.fillRect(x, centerY - peakCaps[i] - 3, barWidth, 2);

          // Reflection below
          ctx.fillStyle = `rgba(212, 175, 55, ${0.08 * (val / 255)})`;
          ctx.fillRect(x, centerY + 2, barWidth, barHeight * 0.25);
        }
      }

      // -------------------------------------------------------------
      // 2. WAVEFORM MODE
      // -------------------------------------------------------------
      else if (mode === 'waveform') {
        ctx.lineWidth = 2.5 * glowIntensity;
        ctx.strokeStyle = pal.primary;
        ctx.shadowColor = pal.glow;
        ctx.shadowBlur = 18 * glowIntensity;

        ctx.beginPath();
        const sliceWidth = width / (waveBuffer.length - 1);
        for (let i = 0; i < waveBuffer.length; i++) {
          const v = waveBuffer[i] / 128.0; // 0 to 2, 1 is center
          const y = (v * height) / 2;
          const x = i * sliceWidth;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Second harmonic line
        ctx.lineWidth = 1;
        ctx.strokeStyle = pal.secondary;
        ctx.beginPath();
        for (let i = 0; i < waveBuffer.length; i++) {
          const v = (waveBuffer[i] / 128.0 - 1) * 0.5 + 1;
          const y = (v * height) / 2 + Math.sin(time + i * 0.1) * 6;
          const x = i * sliceWidth;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 3. NEON MODE (Pulsing concentric neon geometric rings)
      // -------------------------------------------------------------
      else if (mode === 'neon') {
        const cx = width / 2;
        const cy = height / 2;
        const bassImpact = bandMetrics.bass * 40 * glowIntensity;

        ctx.shadowBlur = 22 * glowIntensity;
        ctx.shadowColor = pal.glow;

        for (let r = 0; r < 5; r++) {
          const radius = 35 + r * 30 + bassImpact * (1 + r * 0.2);
          ctx.strokeStyle = r % 2 === 0 ? pal.primary : pal.secondary;
          ctx.lineWidth = 2 + (freqBuffer[r * 10] / 255) * 3;

          ctx.beginPath();
          const points = 32;
          for (let p = 0; p <= points; p++) {
            const angle = (p / points) * Math.PI * 2;
            const wobble = Math.sin(angle * 6 + time * 4) * (freqBuffer[p * 2] / 255) * 12;
            const dist = radius + wobble;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // -------------------------------------------------------------
      // 4. PARTICLES MODE (Exploding / reactive nebula)
      // -------------------------------------------------------------
      else if (mode === 'particles') {
        const cx = width / 2;
        const cy = height / 2;
        const bassTrigger = bandMetrics.bass > 0.5;

        particles.forEach((p, idx) => {
          p.x += p.vx * speed * (1 + bandMetrics.bass * 2);
          p.y += p.vy * speed * (1 + bandMetrics.bass * 2);
          p.life += speed;

          if (bassTrigger && Math.random() < 0.2) {
            p.vx += (Math.random() - 0.5) * 4;
            p.vy += (Math.random() - 0.5) * 4;
          }

          if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life > p.maxLife) {
            p.x = cx + (Math.random() - 0.5) * 40;
            p.y = cy + (Math.random() - 0.5) * 40;
            p.vx = (Math.random() - 0.5) * 3;
            p.vy = (Math.random() - 0.5) * 3;
            p.life = 0;
          }

          const alpha = 1 - p.life / p.maxLife;
          const currentSize = p.size * (1 + (freqBuffer[idx % 32] / 255) * 1.8);

          ctx.fillStyle = theme === 'rgb'
            ? `hsla(${(p.hue + time * 60) % 360}, 90%, 60%, ${alpha})`
            : pal.primary;
          ctx.shadowColor = pal.glow;
          ctx.shadowBlur = 10 * glowIntensity;

          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, currentSize), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // -------------------------------------------------------------
      // 5. CIRCLE BASS MODE (Subwoofer speaker cone reacting to 808)
      // -------------------------------------------------------------
      else if (mode === 'circle_bass') {
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.22;
        const pulse = bandMetrics.bass * 50 * glowIntensity;
        const radius = baseRadius + pulse;

        // Outer glow aura
        const radialGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.6);
        radialGrad.addColorStop(0, pal.glow);
        radialGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Main pulsating ring
        ctx.shadowColor = pal.glow;
        ctx.shadowBlur = 25 * glowIntensity;
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Radial frequency spikes
        const spikes = 48;
        for (let i = 0; i < spikes; i++) {
          const angle = (i / spikes) * Math.PI * 2 + time * 0.4;
          const freqVal = freqBuffer[i % freqBuffer.length] || 20;
          const spikeLen = (freqVal / 255) * 55 * glowIntensity;

          const x1 = cx + Math.cos(angle) * (radius + 2);
          const y1 = cy + Math.sin(angle) * (radius + 2);
          const x2 = cx + Math.cos(angle) * (radius + 2 + spikeLen);
          const y2 = cy + Math.sin(angle) * (radius + 2 + spikeLen);

          ctx.strokeStyle = i % 2 === 0 ? pal.secondary : pal.primary;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Inner Scorpion Bass Center
        ctx.fillStyle = '#0e0e0e';
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pal.core;
        ctx.font = 'bold 12px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('808 BASS', cx, cy);
      }

      // -------------------------------------------------------------
      // 6. LASER MODE (High-energy sweeps)
      // -------------------------------------------------------------
      else if (mode === 'laser') {
        const laserCount = 8;
        const originX = width / 2;
        const originY = height;

        ctx.shadowBlur = 20 * glowIntensity;
        ctx.shadowColor = pal.glow;

        for (let i = 0; i < laserCount; i++) {
          const angle = -Math.PI / 2 + Math.sin(time * 1.5 + i * 0.7) * (Math.PI / 3);
          const beamPower = (freqBuffer[i * 8] / 255) || 0.4;
          const targetDist = Math.max(width, height) * 1.2;

          const targetX = originX + Math.cos(angle) * targetDist;
          const targetY = originY + Math.sin(angle) * targetDist;

          ctx.strokeStyle = i % 2 === 0 ? pal.primary : pal.secondary;
          ctx.lineWidth = (1 + beamPower * 5) * glowIntensity;

          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();

          // Laser impact dots on boundary
          ctx.fillStyle = pal.core;
          ctx.beginPath();
          ctx.arc(targetX, Math.max(0, targetY), 4 * glowIntensity, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // -------------------------------------------------------------
      // 7. FREQUENCY MODE (3-Band Split & VU Gauges)
      // -------------------------------------------------------------
      else if (mode === 'frequency') {
        const pad = 40;
        const meterWidth = (width - pad * 4) / 3;
        const meterHeight = height * 0.55;
        const meterY = (height - meterHeight) / 2;

        const bandsData = [
          { name: 'GRAVES (BASS)', val: bandMetrics.bass, freq: '20 - 250 Hz', color: pal.primary },
          { name: 'MÉDIUMS (MID)', val: bandMetrics.mid, freq: '250 - 4000 Hz', color: pal.secondary },
          { name: 'AIGUËS (TREBLE)', val: bandMetrics.treble, freq: '4 - 20 kHz', color: pal.dark }
        ];

        bandsData.forEach((b, idx) => {
          const x = pad + idx * (meterWidth + pad);

          // Container border
          ctx.strokeStyle = '#222222';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, meterY, meterWidth, meterHeight);

          // Meter fill
          const fillH = meterHeight * Math.min(1, b.val * 1.2 * glowIntensity);
          const fillY = meterY + meterHeight - fillH;

          const grad = ctx.createLinearGradient(0, fillY, 0, meterY + meterHeight);
          grad.addColorStop(0, b.color);
          grad.addColorStop(1, '#0e0e0e');

          ctx.fillStyle = grad;
          ctx.shadowColor = pal.glow;
          ctx.shadowBlur = 12 * glowIntensity;
          ctx.fillRect(x + 2, fillY, meterWidth - 4, fillH);

          // Text labels
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(b.name, x + meterWidth / 2, meterY - 14);

          ctx.fillStyle = pal.primary;
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(b.freq, x + meterWidth / 2, meterY + meterHeight + 16);

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 13px JetBrains Mono, monospace';
          ctx.fillText(`${Math.round(b.val * 100)}%`, x + meterWidth / 2, meterY + meterHeight / 2);
        });
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, theme, glowIntensity, speed, isEnabled]);

  const modes: { id: VisualizerMode; label: string; icon: typeof Activity }[] = [
    { id: 'spectrum', label: 'Spectrum', icon: BarChart2 },
    { id: 'waveform', label: 'Waveform', icon: Activity },
    { id: 'neon', label: 'Neon', icon: Radio },
    { id: 'particles', label: 'Particules', icon: Sparkles },
    { id: 'circle_bass', label: 'Circle Bass', icon: Disc },
    { id: 'laser', label: 'Laser', icon: Zap },
    { id: 'frequency', label: 'Fréquences 3-Band', icon: Sliders }
  ];

  const themes: { id: VisualizerTheme; label: string; color: string }[] = [
    { id: 'gold', label: 'Gold & Black', color: '#d4af37' },
    { id: 'rgb', label: 'RGB Rainbow', color: '#ec4899' },
    { id: 'blue_neon', label: 'Blue Cyber', color: '#00d2ff' },
    { id: 'purple_neon', label: 'Purple UV', color: '#c026d3' },
    { id: 'red', label: 'Red Fire', color: '#ef4444' }
  ];

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
      style={{ minHeight: isCompact ? '260px' : '480px' }}
    >
      {/* Visualizer Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0e0e0e]/95 border-b border-[#1f1f1f] z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              MEYZI BRO VISUALIZER STUDIO
            </h3>
            <p className="text-[11px] text-[#d4af37] font-mono-numbers truncate">
              {currentTrackTitle} · {bpm} BPM
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#141414] p-1 rounded-lg border border-[#222222]">
          {modes.map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  active
                    ? 'bg-[#d4af37] text-black font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Fullscreen & Power Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`p-2 rounded-lg border transition-all ${
              isEnabled
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                : 'bg-neutral-900 text-neutral-500 border-[#222222]'
            }`}
            title={isEnabled ? 'Effets Actifs' : 'Effets Désactivés'}
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#141414] border border-[#222222] text-neutral-300 hover:text-white hover:border-[#d4af37]"
            title={isFullscreen ? 'Quitter Plein Écran' : 'Plein Écran'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full min-h-[300px] bg-[#070707] flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live Audio Reaction HUD Overlay (Non-intrusive) */}
        <div className="absolute top-4 left-5 flex items-center gap-3 pointer-events-none text-[11px] font-mono-numbers text-neutral-400 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#222222]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <strong className="text-white">Bass:</strong> {Math.round(bands.bass * 100)}%
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">Mid:</strong> {Math.round(bands.mid * 100)}%
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">Treble:</strong> {Math.round(bands.treble * 100)}%
          </span>
        </div>
      </div>

      {/* Visualizer Bottom Controls (Theme, Glow Intensity, Animation Speed) */}
      <div className="px-5 py-3 bg-[#0d0d0d] border-t border-[#1f1f1f] flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Color Themes */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#d4af37]" />
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-semibold">
            Thème Couleur :
          </span>
          <div className="flex items-center gap-1.5">
            {themes.map(th => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-all border ${
                  theme === th.id
                    ? 'border-[#d4af37] bg-[#1a170d] text-white font-bold'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-[#161616]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.color }} />
                <span>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders: Glow Intensity & Speed */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px]">Intensité Néon :</span>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={glowIntensity}
              onChange={e => setGlowIntensity(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#222] rounded appearance-none accent-[#d4af37] cursor-pointer"
            />
            <span className="font-mono-numbers text-[10px] text-neutral-300 w-7">
              {glowIntensity.toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px]">Vitesse :</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#222] rounded appearance-none accent-[#d4af37] cursor-pointer"
            />
            <span className="font-mono-numbers text-[10px] text-neutral-300 w-7">
              {speed.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
