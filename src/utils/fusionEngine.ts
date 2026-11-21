/**
 * AXIOM — Module 3: Multi-Signal Fusion, Priority Queue Engine & Indian Statutory Notice Utilities
 * Pure deterministic domain logic for unit testing and UI/Server consumption.
 */

export type RiskClassification =
  | 'IMMEDIATE_ENFORCEMENT'
  | 'HUMAN_OVERSIGHT_QUEUE'
  | 'NOMINAL_ARCHIVE';

export type QueueProcessingStage =
  | 'QUEUED'
  | 'AUDITING'
  | 'ACTIONED_AUTO'
  | 'AWAITING_OFFICER'
  | 'CLEARED_AUTHENTIC';

export type ImageResolutionSize = '1K' | '2K' | '4K';

export type SupportedAspectRatio =
  | '1:1'
  | '2:3'
  | '3:2'
  | '3:4'
  | '4:3'
  | '9:16'
  | '16:9'
  | '21:9';

export type AIModelOption =
  | 'llama-3.3-70b-free'
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-4-argon';

export type ImageModelOption =
  | 'llama-free-studio-canvas'
  | 'gemini-nano-banana-2.1'
  | 'gemini-3-pro-image';

export type LegalFramework = 'IT_ACT_69A' | 'DMCA_512' | 'PLATFORM_TOS';

export interface FusionWeights {
  w1Visual: number;
  w2Audio: number;
  w3Claim: number;
  w4Virality: number;
}

export interface SignalMetrics {
  visualArtifacts: number; // 0.0 to 1.0 (EfficientNet-B4 + Frame Optical Flow)
  audioArtifacts: number; // 0.0 to 1.0 (ResNet Spectrogram + Phoneme Lip-Sync)
  claimDivergence: number; // 0.0 to 1.0 (Fast-LLM Claim Parser + PIB / Live Search Cross-Check)
  viralityVelocityViewsPerHr: number; // Raw views/hr (e.g., 28500)
}

export interface FusionEvaluationResult {
  sHarm: number; // 0.00 to 1.00
  priorityScore: number; // 0 to 100 priority index for Priority Queue ordering
  normalizedViralityScore: number; // 0.00 to 1.00
  classification: RiskClassification;
  classificationLabel: string;
  triggerEnforcement: boolean;
  triggerBroadcast: boolean;
  requiresHumanReview: boolean;
  weightedContributions: {
    visual: number;
    audio: number;
    claim: number;
    virality: number;
  };
}

export const DEFAULT_FUSION_WEIGHTS: FusionWeights = {
  w1Visual: 0.30,
  w2Audio: 0.25,
  w3Claim: 0.30,
  w4Virality: 0.15,
};

export function clamp(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export function normalizeViralityVelocity(viewsPerHr: number): number {
  const safeViews = Math.max(0, viewsPerHr);
  if (safeViews === 0) return 0;
  if (safeViews <= 10000) {
    return Number(((safeViews / 10000) * 0.85).toFixed(4));
  }
  const extra = Math.min(15000, safeViews - 10000);
  return Number((0.85 + (extra / 15000) * 0.15).toFixed(4));
}

/**
 * Compute Priority Queue Index (0–100) combining S_harm and viral velocity
 * so the highest-harm, fastest-spreading items are always audited first.
 */
export function computePriorityScore(sHarm: number, viewsPerHr: number): number {
  const velocityBoost = Math.min(1, Math.max(0, viewsPerHr / 30000));
  const raw = sHarm * 85 + velocityBoost * 15;
  return Math.round(clamp(raw, 1, 100));
}

export function evaluateMultiSignalFusion(
  metrics: SignalMetrics,
  weights: FusionWeights = DEFAULT_FUSION_WEIGHTS
): FusionEvaluationResult {
  const vVis = clamp(metrics.visualArtifacts, 0, 1);
  const vAud = clamp(metrics.audioArtifacts, 0, 1);
  const vClm = clamp(metrics.claimDivergence, 0, 1);
  const vVir = normalizeViralityVelocity(metrics.viralityVelocityViewsPerHr);

  const totalWeight =
    weights.w1Visual + weights.w2Audio + weights.w3Claim + weights.w4Virality || 1;

  const w1 = weights.w1Visual / totalWeight;
  const w2 = weights.w2Audio / totalWeight;
  const w3 = weights.w3Claim / totalWeight;
  const w4 = weights.w4Virality / totalWeight;

  const cVis = Number((w1 * vVis).toFixed(4));
  const cAud = Number((w2 * vAud).toFixed(4));
  const cClm = Number((w3 * vClm).toFixed(4));
  const cVir = Number((w4 * vVir).toFixed(4));

  const rawSum = clamp(cVis + cAud + cClm + cVir, 0, 1);
  const sHarm = Number(rawSum.toFixed(2));
  const priorityScore = computePriorityScore(
    sHarm,
    metrics.viralityVelocityViewsPerHr
  );

  let classification: RiskClassification = 'NOMINAL_ARCHIVE';
  let classificationLabel = 'Nominal · Verified Authentic (PIB Cleared)';
  let triggerEnforcement = false;
  let triggerBroadcast = false;
  let requiresHumanReview = false;

  if (sHarm >= 0.85 && metrics.viralityVelocityViewsPerHr > 10000) {
    classification = 'IMMEDIATE_ENFORCEMENT';
    classificationLabel = 'Critical · Auto-Sec 69A Takedown & PIB Alert';
    triggerEnforcement = true;
    triggerBroadcast = true;
  } else if (sHarm >= 0.50) {
    classification = 'HUMAN_OVERSIGHT_QUEUE';
    classificationLabel = 'Nodal Officer Review Queue';
    requiresHumanReview = true;
  }

  return {
    sHarm,
    priorityScore,
    normalizedViralityScore: vVir,
    classification,
    classificationLabel,
    triggerEnforcement,
    triggerBroadcast,
    requiresHumanReview,
    weightedContributions: {
      visual: cVis,
      audio: cAud,
      claim: cClm,
      virality: cVir,
    },
  };
}

/**
 * Sort items in the AXIOM Priority Queue:
 * 1. Currently AUDITING item first
 * 2. QUEUED items ordered by descending priorityScore (then sHarm)
 * 3. AWAITING_OFFICER items next
 * 4. ACTIONED_AUTO / CLEARED_AUTHENTIC items sorted by priorityScore
 */
export function sortAxiomPriorityQueue<
  T extends {
    id: string;
    queueStage?: QueueProcessingStage;
    priorityScore?: number;
    sHarm: number;
    viralityVelocityViewsPerHr: number;
  }
>(items: T[]): T[] {
  const stageRank: Record<QueueProcessingStage, number> = {
    AUDITING: 0,
    QUEUED: 1,
    AWAITING_OFFICER: 2,
    ACTIONED_AUTO: 3,
    CLEARED_AUTHENTIC: 4,
  };

  return [...items].sort((a, b) => {
    const rankA = stageRank[a.queueStage ?? 'QUEUED'];
    const rankB = stageRank[b.queueStage ?? 'QUEUED'];
    if (rankA !== rankB) return rankA - rankB;

    const pA =
      a.priorityScore ??
      computePriorityScore(a.sHarm, a.viralityVelocityViewsPerHr);
    const pB =
      b.priorityScore ??
      computePriorityScore(b.sHarm, b.viralityVelocityViewsPerHr);
    if (pB !== pA) return pB - pA;
    return b.sHarm - a.sHarm;
  });
}

export function resolveImageDimensions(
  size: ImageResolutionSize,
  aspectRatio: SupportedAspectRatio
): { width: number; height: number; baseEdge: number; geminiCompatibleRatio: string } {
  const baseMap: Record<ImageResolutionSize, number> = {
    '1K': 1024,
    '2K': 2048,
    '4K': 3840,
  };
  const baseEdge = baseMap[size] ?? 1024;

  const [rw, rh] = aspectRatio.split(':').map(Number);
  const ratio = rw / rh;

  let width = baseEdge;
  let height = baseEdge;

  if (ratio >= 1) {
    width = baseEdge;
    height = Math.round(baseEdge / ratio);
  } else {
    height = baseEdge;
    width = Math.round(baseEdge * ratio);
  }

  const geminiRatioMap: Record<SupportedAspectRatio, string> = {
    '1:1': '1:1',
    '2:3': '3:4',
    '3:2': '4:3',
    '3:4': '3:4',
    '4:3': '4:3',
    '9:16': '9:16',
    '16:9': '16:9',
    '21:9': '16:9',
  };

  return {
    width,
    height,
    baseEdge,
    geminiCompatibleRatio: geminiRatioMap[aspectRatio] || '16:9',
  };
}

/**
 * Generate a deterministic Indian statutory legal takedown notice for Module 4 (Authority Enforcement Engine)
 */
export function buildLegalTakedownNotice(params: {
  incidentId: string;
  platform: string;
  sourceUrl: string;
  framework: LegalFramework;
  sHarm: number;
  viralityViewsPerHr: number;
  visualScore: number;
  audioScore: number;
  claimScore: number;
  claimSummary: string;
  verifiedFactRebuttal: string;
  sha256FrameHash: string;
}): {
  subject: string;
  statuteCitation: string;
  recipientPortal: string;
  noticeBody: string;
} {
  const frameworkMeta: Record<
    LegalFramework,
    { statuteCitation: string; recipientPortal: string; headerTitle: string }
  > = {
    IT_ACT_69A: {
      statuteCitation:
        'Information Technology Act, 2000 Sec 69A & IT Rules, 2021 Rule 3(1)(b)(v) (MeitY Emergency Blocking Direction)',
      recipientPortal:
        'MeitY Designated Nodal Officer & Significant Social Media Intermediary (SSMI) India Grievance Desk',
      headerTitle:
        'GOVERNMENT OF INDIA — EMERGENCY DIRECTION UNDER SECTION 69A OF THE IT ACT, 2000',
    },
    DMCA_512: {
      statuteCitation:
        'Bharatiya Nyaya Sanhita (BNS), 2023 Sec 353 (Public Mischief) & Sec 336 (Synthetic Forgery / Impersonation)',
      recipientPortal:
        'Indian Cyber Crime Coordination Centre (I4C · cybercrime.gov.in) & State Police Cyber Cell',
      headerTitle:
        'I4C & BNS SECTION 353 STATUTORY SYNTHETIC IMPERSONATION & PUBLIC MISCHIEF FIR / TAKEDOWN NOTICE',
    },
    PLATFORM_TOS: {
      statuteCitation:
        'PIB Fact Check Unit Advisory & ECI / Platform Deepfake Removal SOP (36-Hour Statutory Window)',
      recipientPortal:
        'Resident Grievance Officer (India) — Automated Playwright Portal Submission',
      headerTitle:
        'PIB FACT CHECK UNIT & NODAL AUTHORITY EXPEDITED DEEPFAKE TAKEDOWN DIRECTIVE',
    },
  };

  const meta = frameworkMeta[params.framework];
  const subject = `[AXIOM-INDIA-${params.incidentId}] ${meta.headerTitle} — S_harm ${params.sHarm.toFixed(2)} (${params.platform})`;

  const noticeBody = `${meta.headerTitle}
Nodal Case Reference: ${params.incidentId}
Intermediary Platform: ${params.platform}
Impugned Content URL: ${params.sourceUrl}
Statutory Authority: ${meta.statuteCitation}
Designated Endpoint: ${meta.recipientPortal}

1. NODAL RISK & PUBLIC ORDER ASSESSMENT
The AXIOM National Counter-Disinformation & Deepfake Command has audited the viral media stream at the URL above and computed an Aggregate Harm & Authenticity Index (S_harm) of ${params.sHarm.toFixed(2)} with a viral velocity of ${params.viralityViewsPerHr.toLocaleString()} views/hr across Indian user cohorts, exceeding the 0.85 statutory emergency threshold.

2. MULTIMODAL FORENSIC AUDIT PROOF (CERT-In / AXIOM Lab)
• Module 2A Visual Forensics (EfficientNet-B4 + Frame Optical Flow): ${(params.visualScore * 100).toFixed(1)}% synthetic deepfake probability
• Module 2B Audio Forensics (ResNet Mel-Spectrogram + Whisper Phoneme Alignment): ${(params.audioScore * 100).toFixed(1)}% voice-cloning probability
• Module 2C PIB & Official Telemetry Divergence: ${(params.claimScore * 100).toFixed(1)}% factual contradiction
• Cryptographic Evidence Digest (SHA-256 under BSA Sec 63 Certificate): ${params.sha256FrameHash}

3. IMPUGNED VIRAL CLAIM VS. VERIFIED GOVERNMENT RECORD
• Circulating Claim: "${params.claimSummary}"
• Verified PIB / Nodal Record: "${params.verifiedFactRebuttal}"

4. MANDATORY COMPLIANCE DIRECTIVE
Pursuant to ${meta.statuteCitation}, the Chief Compliance Officer / Resident Grievance Officer in India is directed to disable public access to the impugned synthetic media within the statutory window, preserve originator metadata for I4C / State Cyber Police investigation, and attach a verified PIB Fact Check context label.`;

  return {
    subject,
    statuteCitation: meta.statuteCitation,
    recipientPortal: meta.recipientPortal,
    noticeBody,
  };
}
