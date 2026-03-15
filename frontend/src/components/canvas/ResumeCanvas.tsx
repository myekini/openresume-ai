'use client';

import { useEffect, useRef } from 'react';
import { Check, Undo2, Edit2, RefreshCw, History } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';

export function ResumeCanvas() {
  const { editCards, acceptEdit, revertEdit } = useResumeStore();

  const edit1 = editCards.find((e) => e.id === 'edit-1');
  const edit2 = editCards.find((e) => e.id === 'edit-2');

  const pendingIds = editCards.filter((e) => e.status === 'pending').map((e) => e.id);
  const acceptedCount = editCards.filter((e) => e.status === 'accepted').length;
  const revertedCount = editCards.filter((e) => e.status === 'reverted').length;
  const allResolved = pendingIds.length === 0 && (acceptedCount + revertedCount) > 0;

  const edit1Ref = useRef<HTMLDivElement>(null);
  const edit2Ref = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts: Y = accept first pending, N = revert, Tab = scroll to next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (pendingIds.length === 0) return;

      const firstId = pendingIds[0];

      if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        acceptEdit(firstId);
        const nextId = pendingIds[1];
        if (nextId) setTimeout(() => {
          document.getElementById(`edit-card-${nextId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        revertEdit(firstId);
        const nextId = pendingIds[1];
        if (nextId) setTimeout(() => {
          document.getElementById(`edit-card-${nextId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const nextId = pendingIds[1] ?? pendingIds[0];
        document.getElementById(`edit-card-${nextId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingIds, acceptEdit, revertEdit]);

  return (
    <section className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden relative" aria-label="Resume canvas">
      {/* Canvas toolbar */}
      <div className="h-10 flex items-center justify-between px-5 border-b border-[#1e1e1e] bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-[#444444]">Template:</span>
          <button className="flex items-center gap-1 font-mono text-[10px] text-[#888888] hover:text-[#f5f5f5] transition-colors">
            Modern <span className="ml-0.5">&#9662;</span>
          </button>
          <div className="h-3 w-px bg-[#1e1e1e]" />
          <button id="canvas-edit-directly-btn" className="flex items-center gap-1.5 font-mono text-[10px] text-[#444444] hover:text-[#888888] transition-colors">
            <Edit2 className="w-3 h-3" />
            Edit directly
          </button>
          <button id="canvas-rerun-btn" className="flex items-center gap-1.5 font-mono text-[10px] text-[#444444] hover:text-[#888888] transition-colors">
            <RefreshCw className="w-3 h-3" />
            Re-run AI
          </button>
          <button id="canvas-version-history-btn" className="flex items-center gap-1.5 font-mono text-[10px] text-[#444444] hover:text-[#888888] transition-colors">
            <History className="w-3 h-3" />
            Versions
          </button>
        </div>
        {pendingIds.length > 0 && (
          <button
            id="canvas-accept-all-btn"
            onClick={() => pendingIds.forEach((id) => acceptEdit(id))}
            className="font-mono text-[10px] text-[#00e5a0] hover:text-[#00c98e] transition-colors uppercase tracking-widest"
          >
            Accept all ({pendingIds.length})
          </button>
        )}
      </div>

      {/* Resume content */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-[740px] mx-auto bg-white text-black min-h-[1000px] shadow-[0_4px_32px_rgba(0,0,0,0.5)] p-14 relative">

          {/* Resume header */}
          <header className="text-center space-y-1 mb-10 pb-8 border-b-2 border-black">
            <h1 className="text-[28px] font-bold uppercase tracking-tight text-black">Alex Rivera</h1>
            <p className="font-mono text-[11px] space-x-3 text-[#333]">
              <span>San Francisco, CA</span>
              <span>&middot;</span>
              <span>linkedin.com/in/arivera</span>
              <span>&middot;</span>
              <span>alex.rivera@product.io</span>
            </p>
          </header>

          {/* Experience */}
          <section className="mb-10">
            <h2 className="font-bold border-b border-black/10 pb-1 mb-4 uppercase tracking-wider text-sm italic text-black">
              Experience
            </h2>

            <div className="space-y-8">
              {/* Stripe */}
              <div>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-lg text-black">Stripe</span>
                  <span className="font-mono text-xs text-black">Jan 2021 &ndash; Present</span>
                </div>
                <div className="italic text-sm font-medium text-black mb-2">Senior Product Manager, Payment Methods</div>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-black">
                  <li>Led global expansion of localized payment methods across 14 European markets, resulting in a 22% increase in cross-border volume.</li>

                  {/* Streaming bullet */}
                  <li className="relative">
                    <div className="bg-[#00e5a0]/10 border-l-2 border-[#00e5a0] -ml-5 pl-4 py-1 flex items-center flex-wrap">
                      <span className="text-black">Optimized checkout flow for enterprise merchants using AI-driven routing, reducing latency by{' '}</span>
                      <span className="font-bold text-[#005d3e] ml-1">45ms for high-volume transactions</span>
                      <span className="inline-block w-0.5 h-[1.1em] bg-[#00e5a0] ml-0.5 cursor-blink" />
                    </div>
                  </li>

                  {/* Edit card 1 */}
                  {edit1?.status === 'pending' && (
                    <li className="relative list-none -mx-5">
                      <div className="pl-5 blur-sm opacity-30 text-sm text-black">
                        Partnered with data engineering to scale the internal reporting tool for risk assessment across multiple payment rails.
                      </div>
                      <div
                        id="edit-card-edit-1"
                        ref={edit1Ref}
                        className="mt-2 bg-[#0a0a0a] border-l-4 border-[#00e5a0] shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-4 rounded-sm slide-up"
                        role="region"
                        aria-label="Proposed edit 1"
                        aria-live="polite"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-widest">&#10022; AI Suggested Enhancement</span>
                            <p className="text-sm text-[#f5f5f5] mt-1.5 italic leading-snug">
                              &ldquo;Partnered with data engineering to scale internal risk reporting by{' '}
                              <span className="text-[#00e5a0] not-italic font-medium">34%</span>, enabling real-time detection for 2M+ transactions daily.&rdquo;
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              id="accept-edit-1"
                              onClick={() => acceptEdit('edit-1')}
                              className="w-8 h-8 flex items-center justify-center bg-[#00e5a0] text-black rounded-sm hover:bg-[#00c98e] transition-colors shadow-[0_0_12px_rgba(0,229,160,0.2)]"
                              aria-label="Accept edit (Y)"
                              title="Accept (Y)"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <button
                              id="revert-edit-1"
                              onClick={() => revertEdit('edit-1')}
                              className="w-8 h-8 flex items-center justify-center bg-[#161616] border border-[#1e1e1e] text-[#888888] rounded-sm hover:bg-[#1e1e1e] transition-colors"
                              aria-label="Revert edit (N)"
                              title="Revert (N)"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-[#1e1e1e] pt-3">
                          <div>
                            <p className="font-mono text-[8px] uppercase text-[#444444] mb-1">&#128161; Reason</p>
                            <p className="text-xs text-[#888888]">JD requires quantified impact for infrastructure roles.</p>
                          </div>
                          <div>
                            <p className="font-mono text-[8px] uppercase text-[#eab308] mb-1">&#9888; Note</p>
                            <p className="text-xs text-[#888888]">Replace <span className="text-[#eab308]">34%</span> with your actual number from Jira/Tableau.</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}

                  {edit1?.status === 'accepted' && (
                    <li className="text-[#005d3e] font-medium">
                      Partnered with data engineering to scale internal risk reporting by 34%, enabling real-time detection for 2M+ transactions daily.
                    </li>
                  )}

                  <li>Spearheaded the integration of 3DS2 authentication protocols for 500+ top-tier merchants, minimizing fraud by 18% while maintaining conversion.</li>
                </ul>
              </div>

              {/* Google */}
              <div>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-lg text-black">Google</span>
                  <span className="font-mono text-xs text-black">Jun 2018 &ndash; Dec 2020</span>
                </div>
                <div className="italic text-sm font-medium text-black mb-2">Product Manager, Google Pay</div>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-black">

                  {/* Edit card 2 */}
                  {edit2?.status === 'pending' && (
                    <li className="relative list-none -mx-5">
                      <div className="pl-5 blur-sm opacity-30 text-sm text-black">
                        Worked with cross-functional teams on stakeholder alignment and roadmap planning.
                      </div>
                      <div
                        id="edit-card-edit-2"
                        ref={edit2Ref}
                        className="mt-2 bg-[#0a0a0a] border-l-4 border-[#00e5a0] shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-4 rounded-sm slide-up"
                        role="region"
                        aria-label="Proposed edit 2"
                        aria-live="polite"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-widest">&#10022; AI Suggested Enhancement</span>
                            <p className="text-sm text-[#f5f5f5] mt-1.5 italic leading-snug">
                              &ldquo;Led cross-functional alignment across 6 product teams, delivering a revised roadmap that accelerated Google Pay&apos;s merchant adoption by{' '}
                              <span className="text-[#00e5a0] not-italic font-medium">31%</span> in 3 markets.&rdquo;
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              id="accept-edit-2"
                              onClick={() => acceptEdit('edit-2')}
                              className="w-8 h-8 flex items-center justify-center bg-[#00e5a0] text-black rounded-sm hover:bg-[#00c98e] transition-colors shadow-[0_0_12px_rgba(0,229,160,0.2)]"
                              aria-label="Accept edit (Y)"
                              title="Accept (Y)"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <button
                              id="revert-edit-2"
                              onClick={() => revertEdit('edit-2')}
                              className="w-8 h-8 flex items-center justify-center bg-[#161616] border border-[#1e1e1e] text-[#888888] rounded-sm hover:bg-[#1e1e1e] transition-colors"
                              aria-label="Revert edit (N)"
                              title="Revert (N)"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-[#1e1e1e] pt-3">
                          <div>
                            <p className="font-mono text-[8px] uppercase text-[#444444] mb-1">&#128161; Reason</p>
                            <p className="text-xs text-[#888888]">JD emphasises stakeholder alignment and cross-functional leadership.</p>
                          </div>
                          <div>
                            <p className="font-mono text-[8px] uppercase text-[#eab308] mb-1">&#9888; Note</p>
                            <p className="text-xs text-[#888888]">Replace <span className="text-[#eab308]">31%</span> with your verified metric.</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}

                  {edit2?.status === 'accepted' && (
                    <li className="text-[#005d3e] font-medium">
                      Led cross-functional alignment across 6 product teams, delivering a revised roadmap that accelerated Google Pay&apos;s merchant adoption by 31% in 3 markets.
                    </li>
                  )}

                  <li>Defined and shipped tap-to-pay expansion for Android devices in 8 APAC markets.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="font-bold border-b border-black/10 pb-1 mb-4 uppercase tracking-wider text-sm italic text-black">
              Education
            </h2>
            <div>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-base text-black">University of Waterloo</span>
                <span className="font-mono text-xs text-black">2016 &ndash; 2020</span>
              </div>
              <div className="italic text-sm text-black">B.A.Sc. in Computer Engineering, Management Science Option</div>
            </div>
          </section>
        </div>
      </div>

      {/* ATS summary bar */}
      {allResolved && (
        <div className="border-t border-[#1e1e1e] bg-[#0a0a0a] px-10 py-4 flex items-center justify-between slide-up shrink-0">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] text-[#888888]">
              <span className="text-[#00e5a0]">{acceptedCount} accepted</span> &middot; {revertedCount} reverted
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-[#888888]">ATS match</span>
              <div className="w-32 h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00e5a0] ats-bar-animate"
                  style={{ '--bar-width': '81%' } as React.CSSProperties}
                />
              </div>
              <span className="font-mono text-[11px] text-[#00e5a0]">81%</span>
              <span className="font-mono text-[10px] text-[#444444]">(+14 from original)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="font-mono text-[10px] text-[#888888] hover:text-[#f5f5f5] border border-[#1e1e1e] hover:border-[#2a2a2a] px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors">
              Save This Version
            </button>
            <button className="font-mono text-[10px] text-[#888888] hover:text-[#f5f5f5] uppercase tracking-widest transition-colors">
              Apply to another role &rarr;
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
