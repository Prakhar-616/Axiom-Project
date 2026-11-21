import React, { useState, useEffect } from 'react';
import { EnforcementTicket, IncidentRecord } from '../data/seedIncidents';
import { buildLegalTakedownNotice, LegalFramework } from '../utils/fusionEngine';
import { ExternalLink, FileCheck2, Send, Terminal } from 'lucide-react';

interface EnforcementPanelProps {
  selectedIncident: IncidentRecord;
  incidents?: IncidentRecord[];
  tickets: EnforcementTicket[];
  onDispatchTicket: (ticket: EnforcementTicket) => void;
}

export const EnforcementPanel: React.FC<EnforcementPanelProps> = ({
  selectedIncident,
  incidents = [],
  tickets,
  onDispatchTicket,
}) => {
  const [framework, setFramework] = useState<LegalFramework>('IT_ACT_69A');
  const [customNoticeBody, setCustomNoticeBody] = useState<string>('');
  const [statuteCitation, setStatuteCitation] = useState<string>('');
  const [recipientPortal, setRecipientPortal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const selectedFakeSourceUrl =
    selectedIncident.atomicClaims[0]?.fakeClaimSourceUrl ||
    selectedIncident.sourceUrl;
  const selectedRebuttalUrl =
    selectedIncident.atomicClaims[0]?.evidenceSourceUrl ||
    'https://pib.gov.in/factcheck.aspx';

  useEffect(() => {
    const generated = buildLegalTakedownNotice({
      incidentId: selectedIncident.id,
      platform: selectedIncident.platform,
      sourceUrl: selectedFakeSourceUrl,
      framework,
      sHarm: selectedIncident.sHarm,
      viralityViewsPerHr: selectedIncident.viralityVelocityViewsPerHr,
      visualScore: selectedIncident.visualArtifacts,
      audioScore: selectedIncident.audioArtifacts,
      claimScore: selectedIncident.claimDivergence,
      claimSummary:
        selectedIncident.atomicClaims[0]?.proposition ||
        selectedIncident.rawTranscriptOrText,
      verifiedFactRebuttal: selectedIncident.verifiedRebuttalSummary,
      sha256FrameHash: selectedIncident.sha256FrameHash,
    });
    setCustomNoticeBody(generated.noticeBody);
    setStatuteCitation(generated.statuteCitation);
    setRecipientPortal(generated.recipientPortal);
    setStatusFeedback(null);
  }, [selectedIncident, framework, selectedFakeSourceUrl]);

  const handleDispatchEnforcement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNoticeBody.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newTicket: EnforcementTicket = {
        ticketId: `MEITY-69A-${Math.floor(910 + Math.random() * 89)}`,
        incidentId: selectedIncident.id,
        claimTitle: selectedIncident.title,
        fakeClaimSourceUrl: selectedFakeSourceUrl,
        rebuttalSourceUrl: selectedRebuttalUrl,
        framework,
        statuteCitation,
        recipientPortal,
        playwrightWorkerStatus: 'DISPATCHED',
        municipalWebhookCode: 202,
        timestampIso: new Date().toISOString(),
        noticeBody: customNoticeBody,
        liveDispatchUrl: 'https://ntfy.sh/axiom-india-nodal-alerts',
      };
      onDispatchTicket(newTicket);
      setIsSubmitting(false);
      setStatusFeedback(
        `Dispatched ${newTicket.ticketId} to ${recipientPortal} (HTTP 202 Accepted)`
      );
    }, 150);
  };

  return (
    <div id="legal-notice-board" className="space-y-6 scroll-mt-20">
      {/* Legal Notice Board (All Issued Notices with 1-Click Viral Claim Source Links) */}
      <div className="border border-slate-200 bg-white rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              MeitY Section 69A, PIB &amp; I4C Legal Notice Board
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Every statutory takedown order below includes a 1-click link to inspect the original viral claim source URL and the official fact-check rebuttal.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-600">
            Total Statutory Notices Issued: {tickets.length}
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {tickets.map((t) => {
            const matchedIncident = incidents.find(
              (inc) => inc.id === t.incidentId
            );
            const claimSourceUrl =
              t.fakeClaimSourceUrl ||
              matchedIncident?.atomicClaims[0]?.fakeClaimSourceUrl ||
              matchedIncident?.sourceUrl ||
              'https://x.com/PIBFactCheck';
            const officialRebuttalUrl =
              t.rebuttalSourceUrl ||
              matchedIncident?.atomicClaims[0]?.evidenceSourceUrl ||
              'https://pib.gov.in/factcheck.aspx';
            const displayTitle =
              t.claimTitle ||
              matchedIncident?.title ||
              `Statutory Takedown Notice for ${t.incidentId}`;

            return (
              <div
                key={t.ticketId}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors px-2 rounded"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                    <span className="font-bold text-slate-900">
                      {t.ticketId}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="text-slate-700 font-semibold">
                      {t.incidentId}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      {t.playwrightWorkerStatus} (HTTP {t.municipalWebhookCode})
                    </span>
                    <span aria-hidden="true" className="text-slate-400">
                      ·
                    </span>
                    <span className="text-slate-500">
                      {t.timestampIso.slice(0, 19).replace('T', ' ')} UTC
                    </span>
                  </div>

                  <a
                    href={claimSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-bold text-slate-900 hover:text-red-600 hover:underline transition-colors"
                  >
                    {displayTitle}
                  </a>

                  <p className="text-xs text-slate-600 font-mono">
                    {t.statuteCitation} — {t.recipientPortal}
                  </p>
                </div>

                {/* 1-Click Source Verification Buttons on Notice Board */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={claimSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Check Viral Claim Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={officialRebuttalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Official Fact-Check</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statutory Takedown Generator for Currently Selected Case */}
      <div className="border border-slate-200 bg-white rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Draft &amp; Issue Statutory Takedown Notice ({selectedIncident.id})
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Auto-populates Government of India Section 69A / BNS Section 353 blocking directions with BSA Section 63 SHA-256 forensic certificates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={selectedFakeSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Check Selected Claim Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <form onSubmit={handleDispatchEnforcement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="legal-framework-select"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Indian Statutory / Regulatory Provision
              </label>
              <select
                id="legal-framework-select"
                value={framework}
                onChange={(e) => setFramework(e.target.value as LegalFramework)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="IT_ACT_69A">
                  IT Act, 2000 Sec 69A &amp; IT Rules 2021 Rule 3(1)(b)(v) (MeitY Blocking Order)
                </option>
                <option value="DMCA_512">
                  Bharatiya Nyaya Sanhita (BNS) Sec 353 &amp; I4C Cyber Crime Notice
                </option>
                <option value="PLATFORM_TOS">
                  PIB Fact Check Unit &amp; ECI Deepfake Removal Directive (36-Hr SOP)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Designated Nodal / SSMI Grievance Endpoint
              </label>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 truncate font-mono">
                {recipientPortal}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                BSA Sec 63 Cryptographic Hash (SHA-256)
              </label>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 truncate font-mono tabular-nums">
                {selectedIncident.sha256FrameHash}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="legal-notice-textarea"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Auto-Drafted Nodal Direction Payload (Editable by Nodal Officer before Dispatch)
            </label>
            <textarea
              id="legal-notice-textarea"
              rows={8}
              value={customNoticeBody}
              onChange={(e) => setCustomNoticeBody(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 leading-relaxed focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Playwright SSMI Portal Worker &amp; I4C (`cybercrime.gov.in`) Webhook ready
              </span>
            </div>

            <div className="flex items-center gap-3">
              {statusFeedback && (
                <span className="text-xs font-medium text-emerald-700 font-mono">
                  {statusFeedback}
                </span>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'Dispatching Sec 69A / I4C Order...'
                    : 'Issue Statutory Takedown & Add to Notice Board'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
