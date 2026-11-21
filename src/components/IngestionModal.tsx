import React, { useState } from 'react';
import { IncidentRecord } from '../data/seedIncidents';
import {
  AIModelOption,
  evaluateMultiSignalFusion,
  FusionWeights,
} from '../utils/fusionEngine';
import { Globe, X } from 'lucide-react';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: FusionWeights;
  selectedModel: AIModelOption;
  onChangeModel: (model: AIModelOption) => void;
  onIngestComplete: (newIncident: IncidentRecord, engineUsed: string) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  weights,
  selectedModel,
  onChangeModel,
  onIngestComplete,
}) => {
  const [title, setTitle] = useState<string>('');
  const [regionState, setRegionState] = useState<string>(
    'Pan-India (Delhi / Mumbai / Bengaluru)'
  );
  const [languageDetected, setLanguageDetected] = useState<string>(
    'Hindi & English'
  );
  const [platform, setPlatform] =
    useState<IncidentRecord['platform']>('X / Twitter API v2');
  const [sourceUrl, setSourceUrl] = useState<string>(
    'https://x.com/search?q=AIIMS%20Delhi%20fake%20PIB%20Fact%20Check&f=live'
  );
  const [mediaType, setMediaType] = useState<IncidentRecord['mediaType']>(
    'Video Stream (MP4 / H.264)'
  );
  const [rawTranscriptOrText, setRawTranscriptOrText] = useState<string>('');
  const [visualArtifacts, setVisualArtifacts] = useState<number>(0.94);
  const [audioArtifacts, setAudioArtifacts] = useState<number>(0.91);
  const [viralityVelocityViewsPerHr, setViralityVelocityViewsPerHr] =
    useState<number>(24500);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isScrapingUrl, setIsScrapingUrl] = useState<boolean>(false);

  if (!isOpen) return null;

  const livePreviewFusion = evaluateMultiSignalFusion(
    {
      visualArtifacts,
      audioArtifacts,
      claimDivergence: 0.92,
      viralityVelocityViewsPerHr,
    },
    weights
  );

  const handleLoadPreset = () => {
    setTitle(
      'Deepfake Video: Fake AIIMS Delhi & ICMR Order Claiming Lockdown Over New Viral Strain'
    );
    setRegionState('Delhi NCR & North India');
    setLanguageDetected('Hindi & English');
    setPlatform('X / Twitter API v2');
    setSourceUrl(
      'https://x.com/search?q=AIIMS%20Delhi%20fake%20PIB%20Fact%20Check&f=live'
    );
    setRawTranscriptOrText(
      'Emergency health bulletin: AIIMS New Delhi and ICMR have ordered an immediate 5-day metro and school lockdown across Delhi NCR starting 6 AM tomorrow due to a Ward 4 pathogen leak.'
    );
    setVisualArtifacts(0.95);
    setAudioArtifacts(0.92);
    setViralityVelocityViewsPerHr(27400);
    setValidationError(null);
  };

  const handleScrapeLiveUrl = async () => {
    if (!sourceUrl.trim() || !sourceUrl.trim().startsWith('http')) {
      setValidationError('Enter a valid http:// or https:// URL to scrape.');
      return;
    }
    setValidationError(null);
    setIsScrapingUrl(true);
    try {
      const resp = await fetch('/api/ingest/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setValidationError(data.error || 'Could not scrape URL.');
      } else {
        if (data.title) setTitle(data.title);
        if (data.transcriptOrText) setRawTranscriptOrText(data.transcriptOrText);
      }
    } catch (_e) {
      setValidationError('Network error while scraping live URL.');
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawTranscriptOrText.trim()) {
      setValidationError(
        'Both Viral Media Title and Transcript / Claim Text are required to inject into the AXIOM Priority Queue.'
      );
      return;
    }
    setValidationError(null);
    setIsAnalyzing(true);

    try {
      const cleanSourceUrl =
        sourceUrl.trim() ||
        `https://news.google.com/search?q=${encodeURIComponent(
          title.trim()
        )}&hl=en-IN&gl=IN&ceid=IN:en`;

      const response = await fetch('/api/audit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          platform,
          sourceUrl: cleanSourceUrl,
          rawTranscriptOrText: rawTranscriptOrText.trim(),
          visualArtifactsInput: visualArtifacts,
          audioArtifactsInput: audioArtifacts,
          viralityVelocityViewsPerHr,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setValidationError(data.error || 'Forensic analysis request failed.');
        setIsAnalyzing(false);
        return;
      }

      const evalResult = evaluateMultiSignalFusion(
        {
          visualArtifacts: data.visualArtifacts,
          audioArtifacts: data.audioArtifacts,
          claimDivergence: data.claimDivergence,
          viralityVelocityViewsPerHr: data.viralityVelocityViewsPerHr,
        },
        weights
      );

      const newId = `AXIOM-IN-${Math.floor(8870 + Math.random() * 120)}`;
      const newIncident: IncidentRecord = {
        id: newId,
        title: title.trim(),
        regionState,
        languageDetected,
        platform,
        sourceUrl: cleanSourceUrl,
        ingestedAtIso: new Date().toISOString(),
        kafkaTopicPartition: `india.ingest.live.p03#offset_${Math.floor(
          900000 + Math.random() * 90000
        )}`,
        mediaType,
        fpsExtracted: 10,
        audioSampleRateHz: 44100,
        rawTranscriptOrText: rawTranscriptOrText.trim(),
        visualArtifacts: data.visualArtifacts,
        audioArtifacts: data.audioArtifacts,
        claimDivergence: data.claimDivergence,
        viralityVelocityViewsPerHr: data.viralityVelocityViewsPerHr,
        sHarm: evalResult.sHarm,
        priorityScore: evalResult.priorityScore,
        queueStage: 'QUEUED',
        autoActionsTaken: [
          `Injected by Nodal Officer (Priority Score ${evalResult.priorityScore}/100)`,
        ],
        classification: evalResult.classification,
        classificationLabel: evalResult.classificationLabel,
        sha256FrameHash:
          '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730',
        visualForensicsDetail: data.visualForensicsDetail,
        audioForensicsDetail: data.audioForensicsDetail,
        atomicClaims: (data.atomicClaims || []).map(
          (c: Record<string, unknown>) => ({
            ...c,
            fakeClaimSourceUrl: cleanSourceUrl,
            fakeClaimPlatformLabel: `${platform} (Impugned Viral Claim Source)`,
          })
        ),
        verifiedRebuttalSummary: data.verifiedRebuttalSummary,
        humanReviewOutcome:
          evalResult.classification === 'IMMEDIATE_ENFORCEMENT'
            ? 'CONFIRMED_ESCALATION'
            : 'PENDING',
      };

      onIngestComplete(newIncident, data.engineUsed || selectedModel);
      onClose();
    } catch (_err) {
      setValidationError('Network error during forensic ingestion.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ingest-modal-title"
    >
      <div className="w-full max-w-2xl rounded-lg bg-white border border-slate-200 p-6 shadow-xl my-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div>
            <h2 id="ingest-modal-title" className="text-base font-semibold text-slate-900">
              Inject Live URL or Viral Media into AXIOM Priority Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scrape any live webpage URL or paste a viral forward to rank and audit in the AXIOM Priority Queue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Ingestion Modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="text-xs text-slate-700">
              Quick-test with an Indian viral deepfake scenario or scrape a real URL below:
            </div>
            <button
              type="button"
              onClick={handleLoadPreset}
              className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Load AIIMS Delhi / ICMR Lockdown Deepfake Preset
            </button>
          </div>

          {/* Live URL Scraper Input */}
          <div>
            <label
              htmlFor="ingest-url-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Impugned Source URL (Clicking the Fact-Checked Claim Redirects Here) *
            </label>
            <div className="flex items-center gap-2">
              <input
                id="ingest-url-input"
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleScrapeLiveUrl}
                disabled={isScrapingUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>
                  {isScrapingUrl ? 'Scraping URL...' : 'Scrape Live URL'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ingest-title-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Viral Post / Forward Title *
              </label>
              <input
                id="ingest-title-input"
                type="text"
                placeholder="e.g., Deepfake Video: Fake AIIMS Delhi Lockdown Order"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="ingest-model-select"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                AI Forensic &amp; PIB Claim Parser Engine
              </label>
              <select
                id="ingest-model-select"
                value={selectedModel}
                onChange={(e) => onChangeModel(e.target.value as AIModelOption)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="llama-3.3-70b-free">
                  Llama-3.3-70B-Instruct (Free Open-Weights · Default)
                </option>
                <option value="gemini-3.8-flash">
                  gemini-3.8-flash (General Multimodal Audit)
                </option>
                <option value="gemini-3.1-flash-lite">
                  gemini-3.1-flash-lite (Low-Latency Fast Claim Parser)
                </option>
                <option value="gemini-4-argon">
                  gemini-4-argon (Deep Reasoning &amp; Complex Forensics)
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ingest-region-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                State / Regional Jurisdiction
              </label>
              <input
                id="ingest-region-input"
                type="text"
                value={regionState}
                onChange={(e) => setRegionState(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="ingest-platform-select"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Social Stream Connector
              </label>
              <select
                id="ingest-platform-select"
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value as IncidentRecord['platform'])
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="X / Twitter API v2">X / Twitter India API v2</option>
                <option value="Meta Graph API">Meta / WhatsApp Forward Feed</option>
                <option value="Telegram Bridge (Telethon)">
                  Telegram Public Channel Bridge
                </option>
                <option value="RSS / Web Scraper">Regional News / Web Scraper</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="ingest-transcript-textarea"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Extracted Speech Transcript / WhatsApp Forward Claim Text *
            </label>
            <textarea
              id="ingest-transcript-textarea"
              rows={3}
              placeholder="Paste the viral video transcript, voice-clone message, or WhatsApp forward claim..."
              value={rawTranscriptOrText}
              onChange={(e) => setRawTranscriptOrText(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-md border border-slate-200">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <label htmlFor="ingest-visual-slider">2A. Visual Deepfake Score</label>
                <span className="font-mono tabular-nums">
                  {(visualArtifacts * 100).toFixed(0)}%
                </span>
              </div>
              <input
                id="ingest-visual-slider"
                type="range"
                min={0}
                max={0.99}
                step={0.01}
                value={visualArtifacts}
                onChange={(e) => setVisualArtifacts(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <label htmlFor="ingest-audio-slider">2B. Audio Vocoder Score</label>
                <span className="font-mono tabular-nums">
                  {(audioArtifacts * 100).toFixed(0)}%
                </span>
              </div>
              <input
                id="ingest-audio-slider"
                type="range"
                min={0}
                max={0.99}
                step={0.01}
                value={audioArtifacts}
                onChange={(e) => setAudioArtifacts(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <label htmlFor="ingest-velocity-input">Virality (views/hr)</label>
                <span className="font-mono tabular-nums">
                  {viralityVelocityViewsPerHr.toLocaleString()}
                </span>
              </div>
              <input
                id="ingest-velocity-input"
                type="range"
                min={500}
                max={35000}
                step={500}
                value={viralityVelocityViewsPerHr}
                onChange={(e) =>
                  setViralityVelocityViewsPerHr(Number(e.target.value))
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {validationError && (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium"
            >
              {validationError}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="text-xs font-mono tabular-nums text-slate-600">
              Priority Score:{' '}
              <strong className="text-slate-900">
                {livePreviewFusion.priorityScore}/100
              </strong>{' '}
              · S_harm{' '}
              <strong className="text-slate-900">
                {livePreviewFusion.sHarm.toFixed(2)}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing
                  ? 'Inserting into Priority Queue...'
                  : 'Add to Priority Queue & Audit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
