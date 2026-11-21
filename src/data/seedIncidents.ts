import {
  evaluateMultiSignalFusion,
  LegalFramework,
  QueueProcessingStage,
  RiskClassification,
} from '../utils/fusionEngine';

export interface AtomicClaimItem {
  id: string;
  proposition: string;
  verdict: 'CONTRADICTED' | 'UNSUBSTANTIATED' | 'VERIFIED';
  confidence: number;
  fakeClaimSourceUrl: string;
  fakeClaimPlatformLabel: string;
  evidenceSourceTitle: string;
  evidenceSourceUrl: string;
  excerpt: string;
}

export interface EnforcementTicket {
  ticketId: string;
  incidentId: string;
  claimTitle?: string;
  fakeClaimSourceUrl?: string;
  rebuttalSourceUrl?: string;
  framework: LegalFramework;
  statuteCitation: string;
  recipientPortal: string;
  playwrightWorkerStatus: 'DISPATCHED' | 'QUEUED' | 'ACKNOWLEDGED';
  municipalWebhookCode: number;
  timestampIso: string;
  noticeBody: string;
  liveDispatchUrl?: string;
}

export interface BroadcastDispatch {
  broadcastId: string;
  incidentId: string;
  claimTitle?: string;
  fakeClaimSourceUrl?: string;
  rebuttalSourceUrl?: string;
  channel:
    | 'WhatsApp Business Cloud API'
    | 'X Automated Reply Thread'
    | 'Telegram Civic Bridge'
    | 'Public Transparency Portal';
  recipientAudience: string;
  reachCount: number;
  messageCopy: string;
  infographicDataUrl?: string;
  infographicMeta?: {
    size: '1K' | '2K' | '4K';
    aspectRatio: string;
    dimensions: string;
    modelUsed: string;
  };
  dispatchedAtIso: string;
  livePushChannelUrl?: string;
  liveDeliveryReceipt?: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  regionState: string;
  languageDetected: string;
  platform:
    | 'X / Twitter API v2'
    | 'Meta Graph API'
    | 'Telegram Bridge (Telethon)'
    | 'RSS / Web Scraper';
  sourceUrl: string;
  ingestedAtIso: string;
  kafkaTopicPartition: string;
  mediaType:
    | 'Video Stream (MP4 / H.264)'
    | 'Audio Clip (PCM .wav)'
    | 'Multimodal Post (Image + Text)';
  fpsExtracted: number;
  audioSampleRateHz: number;
  rawTranscriptOrText: string;
  visualArtifacts: number;
  audioArtifacts: number;
  claimDivergence: number;
  viralityVelocityViewsPerHr: number;
  sHarm: number;
  priorityScore: number;
  queueStage: QueueProcessingStage;
  autoActionsTaken: string[];
  classification: RiskClassification;
  classificationLabel: string;
  sha256FrameHash: string;
  visualForensicsDetail: {
    backboneModel: string;
    faceMeshLandmarksTracked: number;
    blinkRatePerMin: number;
    opticalFlowWarpIndex: number;
    boundaryBlendingAnomaly: string;
    keyframeNote: string;
  };
  audioForensicsDetail: {
    classifierModel: string;
    spectralCutoffKhz: number;
    lipSyncLagMs: number;
    bicoherenceScore: number;
    phonemeMismatchSummary: string;
  };
  atomicClaims: AtomicClaimItem[];
  verifiedRebuttalSummary: string;
  humanReviewOutcome?:
    | 'CONFIRMED_ESCALATION'
    | 'DISMISSED_FALSE_POSITIVE'
    | 'PENDING';
}

const rawSeedIncidents: Omit<
  IncidentRecord,
  'sHarm' | 'priorityScore' | 'classification' | 'classificationLabel'
>[] = [
  {
    id: 'AXIOM-LIVE-9041',
    title:
      'Viral Reels Falsely Claimed as Cyclone Arnab Landfall Destruction in Andhra Pradesh & Odisha (Oct 29, 2026)',
    regionState: 'Andhra Pradesh & Odisha Coast (Live Feed · Factly / IMD)',
    languageDetected: 'English, Telugu & Hindi',
    platform: 'Meta Graph API',
    sourceUrl: 'https://www.instagram.com/reels/DfAU6Ebu3-o/',
    ingestedAtIso: '2026-10-29T08:13:07Z',
    kafkaTopicPartition: 'india.live.rss.p01#offset_20261029',
    mediaType: 'Video Stream (MP4 / H.264)',
    fpsExtracted: 10,
    audioSampleRateHz: 48000,
    rawTranscriptOrText:
      'Cyclone Arnab made landfall along the Andhra Pradesh and Yanam coasts on 28 October 2026, bringing heavy rainfall and strong winds after 1.8 lakh people were evacuated. Amid the landfall, unrelated disaster videos on Instagram Reels and X are being shared claiming to show Cyclone Arnab destroying coastal towns.',
    visualArtifacts: 0.92,
    audioArtifacts: 0.88,
    claimDivergence: 0.98,
    viralityVelocityViewsPerHr: 29400,
    queueStage: 'ACTIONED_AUTO',
    autoActionsTaken: [
      'Live Ingested from Factly India RSS (29 Oct 2026)',
      'Auto-Dispatched MeitY Sec 69A Takedown #MEITY-69A-901',
      'Dispatched Real Push Alert to ntfy.sh/axiom-india-nodal-alerts',
    ],
    sha256FrameHash:
      '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    visualForensicsDetail: {
      backboneModel: 'EfficientNet-B4 + Temporal Reverse-Frame Indexer',
      faceMeshLandmarksTracked: 468,
      blinkRatePerMin: 2.1,
      opticalFlowWarpIndex: 0.91,
      boundaryBlendingAnomaly:
        'Recycled storm footage from March/May 2026 re-captioned as Cyclone Arnab (Oct 28–29, 2026)',
      keyframeNote:
        'Reverse keyframe search confirms videos predate Cyclone Arnab landfall on 28 Oct 2026.',
    },
    audioForensicsDetail: {
      classifierModel: 'ResNet-34 Mel-Spectrogram + Whisper Timestamping',
      spectralCutoffKhz: 15.8,
      lipSyncLagMs: 142,
      bicoherenceScore: 0.91,
      phonemeMismatchSummary:
        'Overdubbed siren and storm audio track spliced onto unrelated footage.',
    },
    atomicClaims: [
      {
        id: 'CLM-9041-1',
        proposition:
          'Viral Instagram Reel (DfAU6Ebu3-o) and X videos show live devastation from Cyclone Arnab making landfall on the Andhra Pradesh and Yanam coast on 28–29 October 2026.',
        verdict: 'CONTRADICTED',
        confidence: 0.99,
        fakeClaimSourceUrl: 'https://www.instagram.com/reels/DfAU6Ebu3-o/',
        fakeClaimPlatformLabel:
          'Instagram Reel Viral Fake Claim (DfAU6Ebu3-o)',
        evidenceSourceTitle:
          'Factly India Investigation & IMD Press Release (28–29 Oct 2026)',
        evidenceSourceUrl:
          'https://factly.in/these-viral-videos-are-unrelated-to-cyclone-arnabs-landfall/',
        excerpt:
          'Cyclone Arnab made landfall on 28 October 2026 along the Andhra Pradesh and Yanam coasts; however, the viral videos circulating on Instagram and X predate October 2026 and are completely unrelated to Cyclone Arnab.',
      },
      {
        id: 'CLM-9041-2',
        proposition:
          'X post (@suchintan_singh/status/2115003723714027811) claims to show Cyclone Arnab uprooting coastal buildings on 28 October 2026.',
        verdict: 'CONTRADICTED',
        confidence: 0.98,
        fakeClaimSourceUrl:
          'https://x.com/suchintan_singh/status/2115003723714027811',
        fakeClaimPlatformLabel:
          'X / Twitter Viral Claim (@suchintan_singh)',
        evidenceSourceTitle:
          'India Meteorological Department (IMD) Official Bulletin (28 Oct 2026)',
        evidenceSourceUrl:
          'https://internal.imd.gov.in/press_release/20261028_pr_5440.pdf',
        excerpt:
          'IMD official press release (20261028_pr_5440.pdf) and Factly verification confirm the viral clip is from an earlier nor’wester in Mayurbhanj, Odisha, not Cyclone Arnab.',
      },
    ],
    verifiedRebuttalSummary:
      'FACT CHECK (29 OCT 2026 — FALSE): While Cyclone Arnab made landfall on the Andhra Pradesh & Yanam coast on 28 October 2026 (with 1.8 lakh residents evacuated), the viral Instagram Reels and X videos claiming to show catastrophic building collapses are unrelated old clips. Refer only to official IMD (@Indiametdept) bulletins.',
    humanReviewOutcome: 'CONFIRMED_ESCALATION',
  },
  {
    id: 'AXIOM-LIVE-9042',
    title:
      'Viral Post Claiming RBI Issued New ₹1,000 Currency Note with Temple Design (Oct 30, 2026)',
    regionState: 'Pan-India (Live Feed · PIB Fact Check / Fact Crescendo)',
    languageDetected: 'English & Hindi',
    platform: 'Meta Graph API',
    sourceUrl:
      'https://www.facebook.com/permalink.php?story_fbid=pfbid0Qjh3cUf778hw6gmyRpLej33cWrkuT3QVod1VVAiGBJzoBWvMc8vZd6nCTUSwVknVl&id=100009253744259',
    ingestedAtIso: '2026-10-30T16:40:00Z',
    kafkaTopicPartition: 'india.live.rss.p02#offset_20261030',
    mediaType: 'Multimodal Post (Image + Text)',
    fpsExtracted: 5,
    audioSampleRateHz: 44100,
    rawTranscriptOrText:
      'A post going viral on social media in late October 2026 claims that the Reserve Bank of India (RBI) has issued a new purple ₹1,000 currency note featuring a temple motif and Mahatma Gandhi portrait. PIB Fact Check and RBI Kochi headquarters have refuted the viral claim.',
    visualArtifacts: 0.94,
    audioArtifacts: 0.85,
    claimDivergence: 0.99,
    viralityVelocityViewsPerHr: 28500,
    queueStage: 'QUEUED',
    autoActionsTaken: [
      'Live Ingested from Fact Crescendo & PIB Fact Check RSS (30 Oct 2026)',
    ],
    sha256FrameHash:
      '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    visualForensicsDetail: {
      backboneModel: 'EfficientNet-B4 + Synthetic Artwork Detector',
      faceMeshLandmarksTracked: 468,
      blinkRatePerMin: 3.2,
      opticalFlowWarpIndex: 0.89,
      boundaryBlendingAnomaly:
        'Digital concept artwork by @oviyan_theartist misattributed as official RBI legal tender',
      keyframeNote:
        'No RBI watermarks, security thread micro-lettering, or RBI press notification present.',
    },
    audioForensicsDetail: {
      classifierModel: 'ResNet-34 Mel-Spectrogram Classifier',
      spectralCutoffKhz: 16.0,
      lipSyncLagMs: 118,
      bicoherenceScore: 0.86,
      phonemeMismatchSummary:
        'Synthetic voiceover added to static currency mockup image.',
    },
    atomicClaims: [
      {
        id: 'CLM-9042-1',
        proposition:
          'Reserve Bank of India (RBI) has issued a new purple ₹1,000 currency note featuring a temple design in October 2026.',
        verdict: 'CONTRADICTED',
        confidence: 0.99,
        fakeClaimSourceUrl:
          'https://www.facebook.com/permalink.php?story_fbid=pfbid0Qjh3cUf778hw6gmyRpLej33cWrkuT3QVod1VVAiGBJzoBWvMc8vZd6nCTUSwVknVl&id=100009253744259',
        fakeClaimPlatformLabel:
          'Facebook Viral Post Claiming New ₹1,000 Note (30 Oct 2026)',
        evidenceSourceTitle:
          'PIB Fact Check & Fact Crescendo Investigation (30 Oct 2026)',
        evidenceSourceUrl:
          'https://english.factcrescendo.com/2026/10/30/the-viral-image-of-a-new-rs-1000-currency-note-in-india-is-fake/',
        excerpt:
          'PIB Fact Check and RBI officials confirmed on 27–30 October 2026 that RBI has made no announcement regarding a new ₹1,000 currency note; the viral image is an artistic painting by @oviyan_theartist.',
      },
    ],
    verifiedRebuttalSummary:
      'PIB FACT CHECK (27–30 OCT 2026 — FAKE): The Reserve Bank of India (RBI) has NOT issued any new ₹1,000 currency note with a temple design. The viral purple note image is digital concept art, not legal tender.',
    humanReviewOutcome: 'PENDING',
  },
  {
    id: 'AXIOM-LIVE-9043',
    title:
      'Old Videos Falsely Shared as October 2026 India–China Border Clash in Arunachal Pradesh (Oct 28–29, 2026)',
    regionState: 'Arunachal Pradesh LAC (Live Feed · Factly / MEA)',
    languageDetected: 'English, Hindi & Telugu',
    platform: 'X / Twitter API v2',
    sourceUrl: 'https://x.com/GlobalWarDesk12/status/2114533259556385028',
    ingestedAtIso: '2026-10-29T10:24:28Z',
    kafkaTopicPartition: 'india.live.rss.p03#offset_20261029',
    mediaType: 'Video Stream (MP4 / H.264)',
    fpsExtracted: 10,
    audioSampleRateHz: 44100,
    rawTranscriptOrText:
      'Following ITBP Director General Shatrujeet Kapur’s 22 October 2026 remarks on border patrolling along the Line of Actual Control (LAC) in Arunachal Pradesh, multiple viral Facebook Reels and X posts (@GlobalWarDesk12) are circulating old footage claiming to show a live October 2026 military clash between Indian and Chinese troops.',
    visualArtifacts: 0.90,
    audioArtifacts: 0.87,
    claimDivergence: 0.97,
    viralityVelocityViewsPerHr: 24200,
    queueStage: 'QUEUED',
    autoActionsTaken: [
      'Live Ingested from Factly India RSS (28–29 Oct 2026)',
    ],
    sha256FrameHash:
      '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730',
    visualForensicsDetail: {
      backboneModel: 'EfficientNet-B4 + ViT-B/16 Temporal Archive Matcher',
      faceMeshLandmarksTracked: 468,
      blinkRatePerMin: 4.1,
      opticalFlowWarpIndex: 0.88,
      boundaryBlendingAnomaly:
        'Breaking-news ticker overlaid onto pre-2026 protest and border footage',
      keyframeNote:
        'Matched to unrelated archive clips; MEA & ITBP clarified border situation on 23–28 Oct 2026.',
    },
    audioForensicsDetail: {
      classifierModel: 'ResNet-34 Mel-Spectrogram Classifier',
      spectralCutoffKhz: 16.2,
      lipSyncLagMs: 112,
      bicoherenceScore: 0.85,
      phonemeMismatchSummary:
        'Re-encoded audio stream with synthetic urgency narration.',
    },
    atomicClaims: [
      {
        id: 'CLM-9043-1',
        proposition:
          'Viral X post (@GlobalWarDesk12/status/2114533259556385028) and Facebook Reel (951003674394661) show a live October 2026 hand-to-hand clash between Indian and Chinese troops in Arunachal Pradesh.',
        verdict: 'CONTRADICTED',
        confidence: 0.99,
        fakeClaimSourceUrl:
          'https://x.com/GlobalWarDesk12/status/2114533259556385028',
        fakeClaimPlatformLabel:
          'X Viral Post (@GlobalWarDesk12 · Oct 2026 Border Hoax)',
        evidenceSourceTitle:
          'Factly India & Ministry of External Affairs (MEA) Clarification (27–29 Oct 2026)',
        evidenceSourceUrl:
          'https://factly.in/none-of-these-viral-videos-shows-the-india-china-border-face-offs-in-october-2026/',
        excerpt:
          'None of the viral videos show an October 2026 India–China clash; MEA clarified that patrolling issues along the LAC are resolved through established mechanisms.',
      },
      {
        id: 'CLM-9043-2',
        proposition:
          'Facebook Reel (29023619360656330) claims local Arunachal residents are fighting Chinese troops in October 2026.',
        verdict: 'CONTRADICTED',
        confidence: 0.99,
        fakeClaimSourceUrl:
          'https://www.facebook.com/reel/29023619360656330',
        fakeClaimPlatformLabel:
          'Facebook Reel Viral Claim (29023619360656330)',
        evidenceSourceTitle:
          'Factly Verification Report (28 Oct 2026)',
        evidenceSourceUrl:
          'https://factly.in/this-video-shows-a-confrontation-between-residents-of-arunachal-pradesh-and-police-during-a-2025-protest/',
        excerpt:
          'The video actually shows a domestic confrontation during a local protest in Arunachal Pradesh and has no connection to Chinese forces.',
      },
    ],
    verifiedRebuttalSummary:
      'FACT CHECK (28–29 OCT 2026 — FALSE): Viral X and Facebook videos claiming to show an October 2026 military clash in Arunachal Pradesh are recycled old clips. Both MEA and Factly confirm the footage is unrelated.',
    humanReviewOutcome: 'PENDING',
  },
  {
    id: 'AXIOM-LIVE-9044',
    title:
      'AI-Generated Video Falsely Shows Israelis Singing Hanuman Chalisa in Tel Aviv (Oct 29, 2026)',
    regionState: 'Pan-India Social Stream (Live Feed · Factly AI Audit)',
    languageDetected: 'Hindi, Telugu & English',
    platform: 'Meta Graph API',
    sourceUrl: 'https://www.facebook.com/reel/2052560315395082',
    ingestedAtIso: '2026-10-29T11:59:22Z',
    kafkaTopicPartition: 'india.live.rss.p04#offset_20261029',
    mediaType: 'Video Stream (MP4 / H.264)',
    fpsExtracted: 10,
    audioSampleRateHz: 48000,
    rawTranscriptOrText:
      'A viral Facebook Reel (2052560315395082) circulating on 29 October 2026 claims to show a crowd of Israelis in Tel Aviv chanting the Hanuman Chalisa together. Multimodal AI forensics confirms the video was synthetically generated using generative AI.',
    visualArtifacts: 0.96,
    audioArtifacts: 0.94,
    claimDivergence: 0.96,
    viralityVelocityViewsPerHr: 21800,
    queueStage: 'QUEUED',
    autoActionsTaken: [
      'Live Ingested from Factly India AI Check Feed (29 Oct 2026)',
    ],
    sha256FrameHash:
      '3a125e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded98812',
    visualForensicsDetail: {
      backboneModel: 'EfficientNet-B4 + Diffusion Artifact Detector',
      faceMeshLandmarksTracked: 468,
      blinkRatePerMin: 1.9,
      opticalFlowWarpIndex: 0.95,
      boundaryBlendingAnomaly:
        'Generative video diffusion warping across crowd hands, facial teeth, and background Hebrew signage',
      keyframeNote:
        'Confirmed AI-generated video (29 Oct 2026 forensic audit).',
    },
    audioForensicsDetail: {
      classifierModel: 'ResNet-34 Mel-Spectrogram + Lip-Sync Aligner',
      spectralCutoffKhz: 15.7,
      lipSyncLagMs: 164,
      bicoherenceScore: 0.94,
      phonemeMismatchSummary:
        '164ms lip-sync desynchronization; devotional audio track overlaid onto AI-generated crowd.',
    },
    atomicClaims: [
      {
        id: 'CLM-9044-1',
        proposition:
          'Facebook Reel (2052560315395082) shows a real crowd in Tel Aviv singing the Hanuman Chalisa in October 2026.',
        verdict: 'CONTRADICTED',
        confidence: 0.99,
        fakeClaimSourceUrl: 'https://www.facebook.com/reel/2052560315395082',
        fakeClaimPlatformLabel:
          'Facebook Reel AI Deepfake Video (2052560315395082)',
        evidenceSourceTitle:
          'Factly AI Forensic Fact Check (29 Oct 2026)',
        evidenceSourceUrl:
          'https://factly.in/telugu-viral-video-showing-israelis-singing-hanuman-chalisa-in-tel-aviv-was-created-with-ai/',
        excerpt:
          'Forensic analysis published on 29 October 2026 confirms the viral video showing Israelis singing Hanuman Chalisa in Tel Aviv was created using generative AI.',
      },
    ],
    verifiedRebuttalSummary:
      'AI DEEPFAKE DETECTED (29 OCT 2026): The viral Facebook Reel claiming Israelis are singing the Hanuman Chalisa in Tel Aviv is 96% AI-generated with synthetic facial and hand distortions.',
    humanReviewOutcome: 'PENDING',
  },
  {
    id: 'AXIOM-LIVE-9045',
    title:
      'Verified Authentic: Varanasi IAF Aerial Display-2026 Over Namo Ghat Crowd Photo (Oct 29, 2026)',
    regionState: 'Uttar Pradesh (Varanasi · Live Feed · AltNews / PIB)',
    languageDetected: 'English & Hindi',
    platform: 'X / Twitter API v2',
    sourceUrl: 'https://x.com/PiyushGoyal/status/2114293659747418329',
    ingestedAtIso: '2026-10-29T10:48:01Z',
    kafkaTopicPartition: 'india.live.rss.p05#offset_20261029',
    mediaType: 'Multimodal Post (Image + Text)',
    fpsExtracted: 5,
    audioSampleRateHz: 44100,
    rawTranscriptOrText:
      'Following the Indian Air Force Aerial Display-2026 over Namo Ghat in Varanasi on 25 October 2026 (attended by PM Narendra Modi), social media users claimed the crowd photograph shared on X was an old photo. Verification on 29 October 2026 confirms the photograph is genuinely from the October 2026 Varanasi IAF air show.',
    visualArtifacts: 0.08,
    audioArtifacts: 0.05,
    claimDivergence: 0.10,
    viralityVelocityViewsPerHr: 12400,
    queueStage: 'CLEARED_AUTHENTIC',
    autoActionsTaken: [
      'Live Ingested from AltNews RSS (29 Oct 2026)',
      'Verified Authentic Event Photograph (S_harm 0.09)',
    ],
    sha256FrameHash:
      '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    visualForensicsDetail: {
      backboneModel: 'EfficientNet-B4 + EXIF Geolocation Match',
      faceMeshLandmarksTracked: 468,
      blinkRatePerMin: 16.2,
      opticalFlowWarpIndex: 0.06,
      boundaryBlendingAnomaly:
        'Zero splicing anomalies; matches Namo Ghat Varanasi architecture from 25 Oct 2026 IAF show',
      keyframeNote:
        'Cross-verified with ANI and Times of India coverage from 25–29 Oct 2026.',
    },
    audioForensicsDetail: {
      classifierModel: 'ResNet-34 Mel-Spectrogram Classifier',
      spectralCutoffKhz: 21.6,
      lipSyncLagMs: 9,
      bicoherenceScore: 0.04,
      phonemeMismatchSummary: 'No synthetic audio manipulation detected.',
    },
    atomicClaims: [
      {
        id: 'CLM-9045-1',
        proposition:
          'Photograph shared on X (@PiyushGoyal/status/2114293659747418329) genuinely shows the crowd gathered at Namo Ghat for the Indian Air Force Aerial Display-2026 in Varanasi in October 2026.',
        verdict: 'VERIFIED',
        confidence: 0.99,
        fakeClaimSourceUrl:
          'https://x.com/PiyushGoyal/status/2114293659747418329',
        fakeClaimPlatformLabel:
          'X Post Under Audit (@PiyushGoyal · 25–29 Oct 2026)',
        evidenceSourceTitle:
          'AltNews Verification & Times of India Defence Report (29 Oct 2026)',
        evidenceSourceUrl:
          'https://www.altnews.in/no-image-posted-by-piyush-goyal-of-crowd-at-air-force-event-in-varanasi-is-not-old/',
        excerpt:
          'Verification published on 29 October 2026 confirms the crowd photo is genuinely from the October 2026 IAF Aerial Display over Namo Ghat in Varanasi, not an old event.',
      },
    ],
    verifiedRebuttalSummary:
      'VERIFIED AUTHENTIC (29 OCT 2026): Visual and geolocation verification confirms the photograph of the crowd at Namo Ghat in Varanasi is genuinely from the October 2026 Indian Air Force Aerial Display.',
    humanReviewOutcome: 'DISMISSED_FALSE_POSITIVE',
  },
];

export const INITIAL_INCIDENTS: IncidentRecord[] = rawSeedIncidents.map((item) => {
  const evalResult = evaluateMultiSignalFusion({
    visualArtifacts: item.visualArtifacts,
    audioArtifacts: item.audioArtifacts,
    claimDivergence: item.claimDivergence,
    viralityVelocityViewsPerHr: item.viralityVelocityViewsPerHr,
  });
  return {
    ...item,
    sHarm: evalResult.sHarm,
    priorityScore: evalResult.priorityScore,
    classification: evalResult.classification,
    classificationLabel: evalResult.classificationLabel,
  };
});

export const INCOMING_INDIAN_STREAM_POOL: Omit<
  IncidentRecord,
  'sHarm' | 'priorityScore' | 'classification' | 'classificationLabel'
>[] = [
  {
    id: 'AXIOM-LIVE-9048',
    title:
      'Viral Video Falsely Links Bhopal Farmers’ Protest to October 2026 Jantar Mantar Protests',
    regionState: 'New Delhi / Madhya Pradesh (Live Feed · Vishvas News)',
    languageDetected: 'Hindi & English',
    platform: 'Meta Graph API',
    sourceUrl: 'https://www.facebook.com/reel/5553673484858142',
    ingestedAtIso: '2026-10-28T07:39:08Z',
    kafkaTopicPartition: 'india.live.rss.p06#offset_20261028',
    mediaType: 'Video Stream (MP4 / H.264)',
    fpsExtracted: 10,
    audioSampleRateHz: 44100,
    rawTranscriptOrText:
      'A viral Facebook Reel (5553673484858142) is being shared in late October 2026 claiming to show a massive protest at Jantar Mantar in New Delhi against the Election Commission’s Special Intensive Revision. Investigation confirms the video is actually from an earlier farmers’ protest in Bhopal.',
    visualArtifacts: 0.89,
    audioArtifacts: 0.86,
    claimDivergence: 0.96,
    viralityVelocityViewsPerHr: 22900,
    queueStage: 'QUEUED',
    autoActionsTaken: ['Live Ingested from Vishvas News RSS (Oct 2026)'],
    sha256FrameHash:
      '5f9c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b9901',
    visualForensicsDetail: {
      backboneModel: 'EfficientNet-B4 + Landmark Geolocation',
      faceMeshLandmarksTracked: 468,
      blinkRatePerMin: 3.1,
      opticalFlowWarpIndex: 0.87,
      boundaryBlendingAnomaly:
        'Misleading Delhi protest text banner overlaid onto Bhopal video',
      keyframeNote: 'Matched to Bhopal protest visuals, not Jantar Mantar.',
    },
    audioForensicsDetail: {
      classifierModel: 'ResNet-34 Mel-Spectrogram + Whisper Alignment',
      spectralCutoffKhz: 16.1,
      lipSyncLagMs: 110,
      bicoherenceScore: 0.84,
      phonemeMismatchSummary:
        'Crowd audio re-compressed with synthetic caption overlay.',
    },
    atomicClaims: [
      {
        id: 'CLM-9048-1',
        proposition:
          'Facebook Reel (5553673484858142) shows an October 2026 protest at Jantar Mantar in New Delhi.',
        verdict: 'CONTRADICTED',
        confidence: 0.99,
        fakeClaimSourceUrl: 'https://www.facebook.com/reel/5553673484858142',
        fakeClaimPlatformLabel:
          'Facebook Reel Viral Claim (5553673484858142)',
        evidenceSourceTitle:
          'Vishvas News IFCN Fact Check (Oct 2026)',
        evidenceSourceUrl:
          'https://www.vishvasnews.com/english/politics/fact-check-video-of-a-farmers-protest-in-bhopal-is-being-shared-with-the-false-claim-that-it-shows-a-protest-at-jantar-mantar/',
        excerpt:
          'Vishvas News confirmed the viral video is from a farmers’ protest in Bhopal and does not show an October 2026 protest at Jantar Mantar in Delhi.',
      },
    ],
    verifiedRebuttalSummary:
      'FACT CHECK (OCT 2026 — FALSE): The viral Facebook Reel claiming to show a protest at Jantar Mantar in New Delhi actually shows a protest in Bhopal.',
    humanReviewOutcome: 'CONFIRMED_ESCALATION',
  },
];

export const INITIAL_ENFORCEMENT_TICKETS: EnforcementTicket[] = [
  {
    ticketId: 'MEITY-69A-901',
    incidentId: 'AXIOM-LIVE-9041',
    claimTitle:
      'Viral Reels Falsely Claimed as Cyclone Arnab Landfall Destruction in Andhra Pradesh & Odisha (29 Oct 2026)',
    fakeClaimSourceUrl: 'https://www.instagram.com/reels/DfAU6Ebu3-o/',
    rebuttalSourceUrl:
      'https://factly.in/these-viral-videos-are-unrelated-to-cyclone-arnabs-landfall/',
    framework: 'IT_ACT_69A',
    statuteCitation:
      'Information Technology Act, 2000 Sec 69A & IT Rules, 2021 Rule 3(1)(b)(v) (MeitY Emergency Blocking Direction)',
    recipientPortal:
      'MeitY Designated Nodal Officer & SSMI India Grievance Desk',
    playwrightWorkerStatus: 'DISPATCHED',
    municipalWebhookCode: 200,
    timestampIso: '2026-10-30T09:11:04Z',
    noticeBody:
      'GOVERNMENT OF INDIA — EMERGENCY DIRECTION UNDER SECTION 69A OF THE IT ACT, 2000: Automated Grievance Worker submitted BSA Sec 63 SHA-256 certificate (9f86d081...) for false Cyclone Arnab disaster panic reels (https://www.instagram.com/reels/DfAU6Ebu3-o/).',
    liveDispatchUrl: 'https://ntfy.sh/axiom-india-nodal-alerts',
  },
  {
    ticketId: 'I4C-BNS-902',
    incidentId: 'AXIOM-LIVE-9042',
    claimTitle:
      'Viral Post Claiming RBI Issued New ₹1,000 Currency Note with Temple Design (30 Oct 2026)',
    fakeClaimSourceUrl:
      'https://www.facebook.com/permalink.php?story_fbid=pfbid0Qjh3cUf778hw6gmyRpLej33cWrkuT3QVod1VVAiGBJzoBWvMc8vZd6nCTUSwVknVl&id=100009253744259',
    rebuttalSourceUrl:
      'https://english.factcrescendo.com/2026/10/30/the-viral-image-of-a-new-rs-1000-currency-note-in-india-is-fake/',
    framework: 'DMCA_512',
    statuteCitation:
      'Bharatiya Nyaya Sanhita (BNS), 2023 Sec 353 (Public Mischief) & RBI Currency Counterfeit Advisory',
    recipientPortal:
      'Indian Cyber Crime Coordination Centre (I4C · cybercrime.gov.in) & Meta India Grievance Officer',
    playwrightWorkerStatus: 'ACKNOWLEDGED',
    municipalWebhookCode: 200,
    timestampIso: '2026-10-30T09:14:22Z',
    noticeBody:
      'I4C & RBI NODAL NOTICE: Viral Facebook post falsely claiming RBI issued a new ₹1,000 temple-design currency note flagged for public financial misinformation.',
    liveDispatchUrl: 'https://ntfy.sh/axiom-india-nodal-alerts',
  },
];

export const INITIAL_BROADCASTS: BroadcastDispatch[] = [
  {
    broadcastId: 'PIB-ALERT-401',
    incidentId: 'AXIOM-LIVE-9041',
    claimTitle:
      'Viral Reels Falsely Claimed as Cyclone Arnab Landfall Destruction in Andhra Pradesh & Odisha (29 Oct 2026)',
    fakeClaimSourceUrl: 'https://www.instagram.com/reels/DfAU6Ebu3-o/',
    rebuttalSourceUrl:
      'https://factly.in/these-viral-videos-are-unrelated-to-cyclone-arnabs-landfall/',
    channel: 'WhatsApp Business Cloud API',
    recipientAudience:
      'MyGov India, IMD & PIB Fact Check Subscribers (Andhra Pradesh / Odisha / Pan-India)',
    reachCount: 485000,
    messageCopy:
      '[PIB & IMD FACT CHECK · 29 OCT 2026] Viral Instagram Reels (https://www.instagram.com/reels/DfAU6Ebu3-o/) claiming catastrophic building collapses during Cyclone Arnab landfall in Andhra Pradesh are OLD, UNRELATED videos. Follow official IMD (@Indiametdept) bulletins.',
    dispatchedAtIso: '2026-10-30T09:11:30Z',
    livePushChannelUrl: 'https://ntfy.sh/axiom-india-nodal-alerts',
    liveDeliveryReceipt: 'Real Push Delivered via ntfy.sh/axiom-india-nodal-alerts',
  },
  {
    broadcastId: 'PIB-ALERT-402',
    incidentId: 'AXIOM-LIVE-9042',
    claimTitle:
      'Viral Post Claiming RBI Issued New ₹1,000 Currency Note with Temple Design (30 Oct 2026)',
    fakeClaimSourceUrl:
      'https://www.facebook.com/permalink.php?story_fbid=pfbid0Qjh3cUf778hw6gmyRpLej33cWrkuT3QVod1VVAiGBJzoBWvMc8vZd6nCTUSwVknVl&id=100009253744259',
    rebuttalSourceUrl:
      'https://english.factcrescendo.com/2026/10/30/the-viral-image-of-a-new-rs-1000-currency-note-in-india-is-fake/',
    channel: 'X Automated Reply Thread',
    recipientAudience:
      'PIB Fact Check & RBI Public Awareness Channels (Pan-India)',
    reachCount: 310000,
    messageCopy:
      '[PIB & RBI FACT CHECK · 30 OCT 2026] Viral Facebook posts claiming RBI has issued a new ₹1,000 currency note with a temple design are FALSE. The image is concept art by @oviyan_theartist, not legal tender.',
    dispatchedAtIso: '2026-10-30T09:15:10Z',
    livePushChannelUrl: 'https://ntfy.sh/axiom-india-nodal-alerts',
    liveDeliveryReceipt: 'Real Push Delivered via ntfy.sh/axiom-india-nodal-alerts',
  },
];
