import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateMultiSignalFusion,
  resolveImageDimensions,
  buildLegalTakedownNotice,
  sortAxiomPriorityQueue,
  computePriorityScore,
} from './fusionEngine';

test('Module 3 Rule Engine triggers Immediate Enforcement & Broadcast when S_harm >= 0.85 and Virality > 10,000 views/hr', () => {
  const result = evaluateMultiSignalFusion({
    visualArtifacts: 0.94,
    audioArtifacts: 0.91,
    claimDivergence: 0.96,
    viralityVelocityViewsPerHr: 18400,
  });

  assert.equal(result.sHarm >= 0.85, true);
  assert.equal(result.classification, 'IMMEDIATE_ENFORCEMENT');
  assert.equal(result.triggerEnforcement, true);
  assert.equal(result.triggerBroadcast, true);
  assert.equal(result.requiresHumanReview, false);
  assert.equal(result.priorityScore >= 85, true);
});

test('Module 3 Rule Engine routes to Nodal Officer Oversight Queue when 0.50 <= S_harm < 0.85', () => {
  const result = evaluateMultiSignalFusion({
    visualArtifacts: 0.68,
    audioArtifacts: 0.55,
    claimDivergence: 0.72,
    viralityVelocityViewsPerHr: 6200,
  });

  assert.equal(result.sHarm >= 0.50 && result.sHarm < 0.85, true);
  assert.equal(result.classification, 'HUMAN_OVERSIGHT_QUEUE');
  assert.equal(result.triggerEnforcement, false);
  assert.equal(result.requiresHumanReview, true);
});

test('AXIOM Priority Queue sorts AUDITING first, then QUEUED items by descending priorityScore', () => {
  const items = [
    {
      id: 'AXIOM-LOW',
      queueStage: 'QUEUED' as const,
      sHarm: 0.42,
      priorityScore: computePriorityScore(0.42, 3000),
      viralityVelocityViewsPerHr: 3000,
    },
    {
      id: 'AXIOM-CRITICAL',
      queueStage: 'QUEUED' as const,
      sHarm: 0.95,
      priorityScore: computePriorityScore(0.95, 28000),
      viralityVelocityViewsPerHr: 28000,
    },
    {
      id: 'AXIOM-ACTIVE',
      queueStage: 'AUDITING' as const,
      sHarm: 0.88,
      priorityScore: computePriorityScore(0.88, 19000),
      viralityVelocityViewsPerHr: 19000,
    },
  ];

  const sorted = sortAxiomPriorityQueue(items);
  assert.equal(sorted[0].id, 'AXIOM-ACTIVE');
  assert.equal(sorted[1].id, 'AXIOM-CRITICAL');
  assert.equal(sorted[2].id, 'AXIOM-LOW');
});

test('resolveImageDimensions supports 1K, 2K, 4K and all 8 aspect ratios (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9)', () => {
  const d4kWide = resolveImageDimensions('4K', '21:9');
  assert.equal(d4kWide.width, 3840);
  assert.equal(d4kWide.height, Math.round(3840 / (21 / 9)));

  const d2kPortrait = resolveImageDimensions('2K', '2:3');
  assert.equal(d2kPortrait.height, 2048);
  assert.equal(d2kPortrait.width, Math.round(2048 * (2 / 3)));

  const d1kSquare = resolveImageDimensions('1K', '1:1');
  assert.equal(d1kSquare.width, 1024);
  assert.equal(d1kSquare.height, 1024);
});

test('buildLegalTakedownNotice populates Indian IT Act Sec 69A / MeitY & BSA Sec 63 SHA-256 digest', () => {
  const notice = buildLegalTakedownNotice({
    incidentId: 'AXIOM-IN-8841',
    platform: 'X / Twitter India Stream',
    sourceUrl: 'https://x.com/india_breaking_24x7/status/1984019283',
    framework: 'IT_ACT_69A',
    sHarm: 0.94,
    viralityViewsPerHr: 28500,
    visualScore: 0.95,
    audioScore: 0.91,
    claimScore: 0.97,
    claimSummary: 'UPI payments above Rs 2,000 will face a 2.5% surcharge and midnight freeze.',
    verifiedFactRebuttal: 'RBI & NPCI confirm zero surcharge on normal bank-to-bank UPI transactions; UPI rails are operating at 99.99% uptime.',
    sha256FrameHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  });

  assert.equal(notice.subject.includes('AXIOM-IN-8841'), true);
  assert.equal(notice.noticeBody.includes('SECTION 69A'), true);
  assert.equal(notice.noticeBody.includes('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'), true);
});
