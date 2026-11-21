import React from 'react';
import { FusionWeights } from '../utils/fusionEngine';

interface ArchitectureReferenceViewProps {
  weights: FusionWeights;
  onChangeWeights: (next: FusionWeights) => void;
  onResetWeights: () => void;
}

const DATA_FLOW_STAGES = [
  {
    stage: '01. Ingestion',
    inputData: 'Live URL / Media Stream',
    processingAction:
      'Connectors on X API v2, Meta Graph API, Telethon (Telegram), and RSS spiders feed Apache Kafka; ffmpeg splits video into 5–10 FPS frame buffers and PCM .wav waveforms.',
    outputGenerated: 'Raw Frame Buffers + .wav Audio + Raw Text',
  },
  {
    stage: '02. Analysis',
    inputData: 'Media & Text Streams',
    processingAction:
      'Parallel execution across 2A Visual (MediaPipe Face Mesh + EfficientNet-B4 + Optical Flow), 2B Audio (ResNet Mel-Spectrogram + Whisper Phoneme Alignment), and 2C Live Search Cross-Check.',
    outputGenerated: 'Sub-scores: Deepfake Probability, Speech Alignment, Fact Match',
  },
  {
    stage: '03. Fusion',
    inputData: 'Sub-scores & Velocity Data',
    processingAction:
      'Multi-Signal Fusion Engine computes S_harm = w1·Visual + w2·Audio + w3·Claim + w4·Virality and evaluates threshold rules (>= 0.85 & >10k views/hr vs 0.50–0.85 Oversight).',
    outputGenerated: 'Scored Incident Payload & Classification Matrix',
  },
  {
    stage: '04. Enforcement',
    inputData: 'Incident Payload (S_harm >= 0.85)',
    processingAction:
      'Auto-drafts statutory legal complaints (IT Act / DMCA / TOS) with SHA-256 proofs; dispatches headless Playwright webform workers and municipal cyber webhooks.',
    outputGenerated: 'Filed Legal Takedowns & Municipal Tickets',
  },
  {
    stage: '05. Broadcast',
    inputData: 'Incident Payload & Fact Rebuttal',
    processingAction:
      'Synthesizes 1K/2K/4K counter-infographics; triggers WhatsApp Business Cloud API, automated X/Telegram rebuttal threads, and WebSocket transparency dashboard sync.',
    outputGenerated: 'WhatsApp Broadcasts, Bot Posts, Dashboard Update',
  },
];

const TECH_STACK_LAYERS = [
  {
    layer: 'Streaming & Message Bus',
    tech: 'Apache Kafka, Redis Pub/Sub',
    role: 'High-velocity social stream buffering without dropped payloads',
  },
  {
    layer: 'Processing & Media',
    tech: 'ffmpeg, OpenCV, Librosa, MediaPipe Face Mesh',
    role: '5–10 FPS frame extraction, 468-landmark face crop, Mel-spectrogram synthesis',
  },
  {
    layer: 'ML & AI Forensic Models',
    tech: 'Llama-3.3-70B (Free Open-Weights), EfficientNet-B4, Vision Transformers, ResNet-34, Whisper, Gemini 3.8 Flash / 4 Argon',
    role: 'Boundary artifact detection, neural vocoder detection, atomic claim extraction',
  },
  {
    layer: 'Fact-Checking & Search',
    tech: 'Live Web Search Grounding, Fast-LLM Claim Parsers, Civic SCADA Feeds',
    role: 'Zero-latency verification against live press releases and official telemetry',
  },
  {
    layer: 'Automation & Enforcement',
    tech: 'Playwright Headless Workers, Node.js Workers, Statutory Notice Templates',
    role: 'Automated regulatory grievance submission and municipal webhook dispatch',
  },
  {
    layer: 'Messaging & Broadcast',
    tech: 'Meta WhatsApp Business Cloud API, Telethon, X API v2, Studio Vector Renderer',
    role: 'Proactive public counter-messaging and 1K/2K/4K multi-aspect rebuttal graphics',
  },
];

export const ArchitectureReferenceView: React.FC<ArchitectureReferenceViewProps> = ({
  weights,
  onChangeWeights,
  onResetWeights,
}) => {
  const totalWeight =
    weights.w1Visual + weights.w2Audio + weights.w3Claim + weights.w4Virality;

  return (
    <div className="space-y-6">
      {/* Module 3 Interactive Weight Calibration */}
      <div className="border border-slate-200 bg-white rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              01. Module 3: Multi-Signal Fusion Equation & Live Weight Calibration
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Configure the linear combination coefficients used to compute the Aggregate Harm & Authenticity Index (S_harm) across all ingested incidents.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetWeights}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reset Default Weights
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-md p-4 font-mono text-xs sm:text-sm mb-6 overflow-x-auto">
          S_harm = ({weights.w1Visual.toFixed(2)} · VisualArtifacts) + (
          {weights.w2Audio.toFixed(2)} · AudioArtifacts) + (
          {weights.w3Claim.toFixed(2)} · ClaimDivergence) + (
          {weights.w4Virality.toFixed(2)} · ViralityVelocity)
          <span className="text-slate-400 ml-3">
            [Normalized Sum = {totalWeight.toFixed(2)}]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label htmlFor="w1-slider">w1 · Visual Forensics</label>
              <span className="font-mono tabular-nums">{weights.w1Visual.toFixed(2)}</span>
            </div>
            <input
              id="w1-slider"
              type="range"
              min={0.05}
              max={0.7}
              step={0.05}
              value={weights.w1Visual}
              onChange={(e) =>
                onChangeWeights({ ...weights, w1Visual: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              EfficientNet-B4 + Frame Optical Flow
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label htmlFor="w2-slider">w2 · Audio Forensics</label>
              <span className="font-mono tabular-nums">{weights.w2Audio.toFixed(2)}</span>
            </div>
            <input
              id="w2-slider"
              type="range"
              min={0.05}
              max={0.7}
              step={0.05}
              value={weights.w2Audio}
              onChange={(e) =>
                onChangeWeights({ ...weights, w2Audio: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              ResNet Spectrogram + Phoneme Lip-Sync
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label htmlFor="w3-slider">w3 · Claim Divergence</label>
              <span className="font-mono tabular-nums">{weights.w3Claim.toFixed(2)}</span>
            </div>
            <input
              id="w3-slider"
              type="range"
              min={0.05}
              max={0.7}
              step={0.05}
              value={weights.w3Claim}
              onChange={(e) =>
                onChangeWeights({ ...weights, w3Claim: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Fast-LLM Claim Parser + Live Search
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label htmlFor="w4-slider">w4 · Virality Velocity</label>
              <span className="font-mono tabular-nums">{weights.w4Virality.toFixed(2)}</span>
            </div>
            <input
              id="w4-slider"
              type="range"
              min={0.05}
              max={0.5}
              step={0.05}
              value={weights.w4Virality}
              onChange={(e) =>
                onChangeWeights({ ...weights, w4Virality: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Views/hr Velocity Threshold (&gt;10,000/hr)
            </p>
          </div>
        </div>
      </div>

      {/* End-to-End Data Flow Specification Table */}
      <div className="border border-slate-200 bg-white rounded-lg p-6">
        <div className="pb-4 mb-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">
            02. End-to-End Architecture Data Flow Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Five-stage architectural pipeline from low-latency social stream ingestion to automated statutory takedown and public rebuttal broadcast.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-2.5 pr-4">Stage</th>
                <th className="py-2.5 px-4">Input Data</th>
                <th className="py-2.5 px-4">Processing Action</th>
                <th className="py-2.5 pl-4">Output Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {DATA_FLOW_STAGES.map((row) => (
                <tr key={row.stage} className="hover:bg-slate-50">
                  <td className="py-3 pr-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {row.stage}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {row.inputData}
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xl">
                    {row.processingAction}
                  </td>
                  <td className="py-3 pl-4 font-mono text-slate-800">
                    {row.outputGenerated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technology Stack Matrix */}
      <div className="border border-slate-200 bg-white rounded-lg p-6">
        <div className="pb-4 mb-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">
            03. Production Technology Stack Specification
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-2.5 pr-4">Architectural Layer</th>
                <th className="py-2.5 px-4">Technology & Libraries</th>
                <th className="py-2.5 pl-4">Operational Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {TECH_STACK_LAYERS.map((item) => (
                <tr key={item.layer} className="hover:bg-slate-50">
                  <td className="py-3 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                    {item.layer}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {item.tech}
                  </td>
                  <td className="py-3 pl-4 text-slate-600">{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
