import React, { useEffect, useRef, useState } from 'react';
import { IncidentRecord } from '../data/seedIncidents';

interface ForensicVisualizerCanvasProps {
  incident: IncidentRecord;
}

type ActiveLayer = 'VISUAL_MESH' | 'OPTICAL_FLOW' | 'MEL_SPECTROGRAM';

export const ForensicVisualizerCanvas: React.FC<ForensicVisualizerCanvasProps> = ({
  incident,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('VISUAL_MESH');
  const [frameIndex, setFrameIndex] = useState<number>(84);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Subtle dark slate forensic inspection backdrop
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Subtle 24px coordinate grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.10)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const phase = (frameIndex % 100) / 100;
    const isHighRisk = incident.visualArtifacts >= 0.5 || incident.audioArtifacts >= 0.5;

    if (activeLayer === 'VISUAL_MESH') {
      // Draw MediaPipe Face Mesh wireframe + mandibular blending anomaly contour
      const cx = width * 0.34;
      const cy = height * 0.52;
      const rx = 74;
      const ry = 94;

      // Bounding box
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - rx - 18, cy - ry - 18, (rx + 18) * 2, (ry + 18) * 2);

      // Cranial & facial mesh contour
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Internal triangulated mesh lines
      const landmarks: [number, number][] = [
        [cx - 32, cy - 24],
        [cx + 32, cy - 24],
        [cx, cy + 4],
        [cx - 28, cy + 38],
        [cx + 28, cy + 38],
        [cx, cy + 44 + Math.sin(phase * Math.PI * 4) * 5],
        [cx - 52, cy + 16],
        [cx + 52, cy + 16],
        [cx - 42, cy + 62],
        [cx + 42, cy + 62],
        [cx, cy + 78],
      ];

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      for (let i = 0; i < landmarks.length; i++) {
        for (let j = i + 1; j < landmarks.length; j++) {
          const dist = Math.hypot(
            landmarks[i][0] - landmarks[j][0],
            landmarks[i][1] - landmarks[j][1]
          );
          if (dist < 78) {
            ctx.beginPath();
            ctx.moveTo(landmarks[i][0], landmarks[i][1]);
            ctx.lineTo(landmarks[j][0], landmarks[j][1]);
            ctx.stroke();
          }
        }
      }

      // Highlight synthetic jawline & perioral anomaly zone if high artifact score
      if (isHighRisk) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy + 18, 56, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        // Perioral GAN artifact box
        ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(cx - 36, cy + 24, 72, 34);
        ctx.strokeStyle = '#F87171';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 36, cy + 24, 72, 34);
      }

      // Draw landmark vertices
      for (const [lx, ly] of landmarks) {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Right-side Spatial Activation Heatmap (EfficientNet-B4 Grad-CAM)
      const rightX = width * 0.58;
      const panelW = width * 0.37;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(rightX, 24, panelW, height - 48);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(rightX, 24, panelW, height - 48);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '600 12px "IBM Plex Mono", monospace';
      ctx.fillText('EFFICIENTNET-B4 GRAD-CAM RESIDUALS', rightX + 14, 46);

      const bars = [
        { label: 'Mandibular Seam', val: incident.visualArtifacts },
        { label: 'Perioral Viseme Warp', val: Math.min(0.99, incident.visualArtifacts * 0.96) },
        { label: 'Inter-Frame Flicker', val: incident.visualForensicsDetail.opticalFlowWarpIndex },
        {
          label: 'Blink Cadence Anomaly',
          val: incident.visualForensicsDetail.blinkRatePerMin < 6 ? 0.88 : 0.12,
        },
      ];

      bars.forEach((b, idx) => {
        const by = 68 + idx * 42;
        ctx.fillStyle = '#94A3B8';
        ctx.font = '400 11px "IBM Plex Mono", monospace';
        ctx.fillText(`${b.label}: ${(b.val * 100).toFixed(1)}%`, rightX + 14, by);

        ctx.fillStyle = '#0F172A';
        ctx.fillRect(rightX + 14, by + 6, panelW - 28, 10);

        ctx.fillStyle = b.val >= 0.5 ? '#EF4444' : '#10B981';
        ctx.fillRect(rightX + 14, by + 6, (panelW - 28) * b.val, 10);
      });
    } else if (activeLayer === 'OPTICAL_FLOW') {
      // Frame-to-Frame Optical Flow Vector Field
      const cols = 16;
      const rows = 8;
      const cellW = width / cols;
      const cellH = height / rows;

      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          const distCenter = Math.hypot(x - width * 0.45, y - height * 0.5);
          const isSyntheticZone = distCenter < 95 && isHighRisk;

          const angle = isSyntheticZone
            ? Math.sin(phase * 6 + r * 0.7) * 2.2
            : 0.15 + Math.cos(c * 0.2) * 0.1;
          const mag = isSyntheticZone ? 18 : 7;

          ctx.strokeStyle = isSyntheticZone ? '#F87171' : '#38BDF8';
          ctx.lineWidth = isSyntheticZone ? 1.8 : 1.1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * mag, y + Math.sin(angle) * mag);
          ctx.stroke();

          ctx.fillStyle = isSyntheticZone ? '#EF4444' : '#0284C7';
          ctx.beginPath();
          ctx.arc(x + Math.cos(angle) * mag, y + Math.sin(angle) * mag, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Module 2B: Mel-Spectrogram + Whisper Phoneme Lip-Sync Alignment
      const specTop = 28;
      const specHeight = height - 88;
      const cols = 64;
      const rows = 20;
      const cellW = (width - 48) / cols;
      const cellH = specHeight / rows;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          // Top rows represent high frequencies (>16 kHz)
          const isAboveCutoff = r < 5 && isHighRisk;
          const energy = isAboveCutoff
            ? 0.05
            : Math.abs(Math.sin((c + frameIndex) * 0.25 + r * 0.4)) *
              (1 - r / (rows * 1.4));

          const red = Math.round(energy * 235);
          const green = Math.round(energy * 140);
          const blue = isAboveCutoff ? 35 : Math.round(80 + energy * 160);

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillRect(24 + c * cellW, specTop + r * cellH, cellW - 1, cellH - 1);
        }
      }

      if (isHighRisk) {
        // Draw 15.8 kHz Neural Vocoder Brickwall Cutoff Line
        const cutoffY = specTop + 5 * cellH;
        ctx.strokeStyle = '#F87171';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(24, cutoffY);
        ctx.lineTo(width - 24, cutoffY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#FCA5A5';
        ctx.font = '600 11px "IBM Plex Mono", monospace';
        ctx.fillText(
          `VOCODER HIGH-FREQ BRICKWALL CUTOFF (${incident.audioForensicsDetail.spectralCutoffKhz} kHz) · LIP-SYNC LAG +${incident.audioForensicsDetail.lipSyncLagMs}ms`,
          32,
          cutoffY - 6
        );
      }
    }

    // Bottom HUD telemetry bar inside canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, height - 32, width, 32);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.fillText(
      `FRAME #${String(frameIndex).padStart(4, '0')} (${incident.fpsExtracted} FPS)  ·  SHA-256: ${incident.sha256FrameHash.slice(0, 24)}...  ·  OPTICAL WARP: ${incident.visualForensicsDetail.opticalFlowWarpIndex.toFixed(2)}`,
      14,
      height - 11
    );
  }, [incident, activeLayer, frameIndex]);

  return (
    <div className="border border-slate-200 bg-white rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 mb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            01. Multimodal Forensic Frame & Acoustic Inspector
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            {incident.visualForensicsDetail.backboneModel} · {incident.audioForensicsDetail.classifierModel}
          </p>
        </div>

        {/* Interactive Layer Switcher (Functional segmented buttons) */}
        <div
          className="flex items-center gap-1 p-1 bg-slate-100 rounded-md"
          role="group"
          aria-label="Forensic Canvas Layer Selector"
        >
          <button
            type="button"
            onClick={() => setActiveLayer('VISUAL_MESH')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeLayer === 'VISUAL_MESH'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            2A. Face Mesh & Grad-CAM
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('OPTICAL_FLOW')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeLayer === 'OPTICAL_FLOW'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            2A. Optical Flow Vectors
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('MEL_SPECTROGRAM')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              activeLayer === 'MEL_SPECTROGRAM'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            2B. Mel-Spectrogram & Lip-Sync
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={760}
        height={260}
        data-testid="forensic-inspector-canvas"
        className="w-full h-64 rounded bg-slate-950 block border border-slate-800"
      />

      <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
        <div className="md:col-span-6 flex items-center gap-3">
          <label
            htmlFor="frame-scrubber"
            className="text-xs font-medium text-slate-700 whitespace-nowrap shrink-0"
          >
            Frame Buffer Scrubber
          </label>
          <input
            id="frame-scrubber"
            type="range"
            min={1}
            max={240}
            value={frameIndex}
            onChange={(e) => setFrameIndex(Number(e.target.value))}
            className="w-full min-w-[140px] flex-1 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs font-mono tabular-nums text-slate-600 whitespace-nowrap shrink-0">
            Frame {frameIndex} / 240
          </span>
        </div>

        <div className="md:col-span-6 md:text-right text-xs text-slate-600 font-mono tabular-nums">
          <span>Blink Rate: {incident.visualForensicsDetail.blinkRatePerMin}/min</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Phoneme Lag: {incident.audioForensicsDetail.lipSyncLagMs}ms</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Spectral Cutoff: {incident.audioForensicsDetail.spectralCutoffKhz} kHz</span>
        </div>
      </div>
    </div>
  );
};
