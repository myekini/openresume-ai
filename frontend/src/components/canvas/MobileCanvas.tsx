'use client';

import { useState } from 'react';
import { Wand2, Download, MessageSquare, Check, Undo2, X } from 'lucide-react';
import Link from 'next/link';
import { useResumeStore } from '@/store/useResumeStore';

export default function MobileCanvas() {
  const [chatOpen, setChatOpen] = useState(false);
  const { editCards, acceptEdit, revertEdit } = useResumeStore();

  const edit1 = editCards.find((e) => e.id === 'edit-1');
  const edit2 = editCards.find((e) => e.id === 'edit-2');
  const pendingCount = editCards.filter((e) => e.status === 'pending').length;
  const acceptedCount = editCards.filter((e) => e.status === 'accepted').length;
  const revertedCount = editCards.filter((e) => e.status === 'reverted').length;
  const allResolved = pendingCount === 0 && (acceptedCount + revertedCount) > 0;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-[#f5f5f5] md:hidden overflow-hidden">
      {/* Top bar */}
      <header className="h-12 border-b border-[#1e1e1e] flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a] z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[rgba(0,229,160,0.08)] border border-[#00e5a0]/20 flex items-center justify-center rounded-sm">
            <Wand2 className="text-[#00e5a0] w-3 h-3" />
          </div>
          <span className="font-mono text-[10px] text-[#444444] uppercase tracking-tighter">OR</span>
        </Link>
        <span className="text-sm font-medium text-[#f5f5f5]">Stripe PM v2</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00e5a0] text-black text-xs font-bold rounded-sm">
          <Download className="w-3 h-3" />
          PDF
        </button>
      </header>

      {/* Resume fullscreen */}
      <main className="flex-1 overflow-y-auto bg-[#0d0d0d] p-4 custom-scrollbar">
        <div className="bg-white text-black shadow-xl p-8 mx-auto max-w-2xl">

          {/* Resume header */}
          <header className="text-center space-y-1 mb-8 pb-6 border-b-2 border-black">
            <h1 className="text-2xl font-bold uppercase tracking-tight">Alex Rivera</h1>
            <p className="font-mono text-[10px] text-[#333]">
              San Francisco, CA &middot; alex.rivera@product.io &middot; linkedin.com/in/arivera
            </p>
          </header>

          {/* Experience */}
          <section className="mb-8">
            <h2 className="font-bold border-b border-black/10 pb-1 mb-4 uppercase tracking-wider text-xs italic">Experience</h2>

            {/* Stripe */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-base">Stripe</span>
                <span className="font-mono text-[10px]">Jan 2021 &ndash; Present</span>
              </div>
              <div className="italic text-sm font-medium mb-2">Senior Product Manager, Payment Methods</div>
              <ul className="list-disc pl-4 space-y-2 text-xs leading-relaxed">
                <li>Led global expansion of localized payment methods across 14 European markets, resulting in a 22% increase in cross-border volume.</li>

                {/* Edit card 1 */}
                {edit1?.status === 'pending' && (
                  <li className="list-none -mx-4">
                    <div className="blur-sm opacity-30 text-xs px-4 mb-1">
                      Partnered with data engineering to scale the internal reporting tool for risk assessment.
                    </div>
                    <div className="bg-[#0a0a0a] border-l-4 border-[#00e5a0] p-3 rounded-sm slide-up">
                      <span className="font-mono text-[8px] text-[#00e5a0] uppercase tracking-widest block mb-1.5">&#10022; AI Suggested Enhancement</span>
                      <p className="text-xs text-[#f5f5f5] italic mb-2 leading-relaxed">
                        &ldquo;Partnered with data engineering to scale internal risk reporting by <span className="text-[#00e5a0] not-italic font-medium">34%</span>, enabling real-time detection for 2M+ transactions daily.&rdquo;
                      </p>
                      <p className="font-mono text-[8px] text-[#eab308] mb-3">&#9888; Replace &ldquo;34%&rdquo; with your actual number</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptEdit('edit-1')}
                          className="flex items-center gap-1.5 bg-[#00e5a0] text-black text-xs font-bold px-3 py-1.5 rounded-sm"
                          aria-label="Accept edit"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => revertEdit('edit-1')}
                          className="flex items-center gap-1.5 bg-[#161616] border border-[#1e1e1e] text-[#888888] text-xs px-3 py-1.5 rounded-sm"
                          aria-label="Revert edit"
                        >
                          <Undo2 className="w-3 h-3" /> Revert
                        </button>
                      </div>
                    </div>
                  </li>
                )}

                {edit1?.status === 'accepted' && (
                  <li className="text-[#005d3e] font-medium">
                    Partnered with data engineering to scale internal risk reporting by 34%, enabling real-time detection for 2M+ transactions daily.
                  </li>
                )}

                <li>Spearheaded the integration of 3DS2 authentication protocols for 500+ merchants, minimizing fraud by 18%.</li>
              </ul>
            </div>

            {/* Google */}
            <div>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-base">Google</span>
                <span className="font-mono text-[10px]">Jun 2018 &ndash; Dec 2020</span>
              </div>
              <div className="italic text-sm font-medium mb-2">Product Manager, Google Pay</div>
              <ul className="list-disc pl-4 space-y-2 text-xs leading-relaxed">

                {/* Edit card 2 */}
                {edit2?.status === 'pending' && (
                  <li className="list-none -mx-4">
                    <div className="blur-sm opacity-30 text-xs px-4 mb-1">
                      Worked with cross-functional teams on stakeholder alignment and roadmap planning.
                    </div>
                    <div className="bg-[#0a0a0a] border-l-4 border-[#00e5a0] p-3 rounded-sm slide-up">
                      <span className="font-mono text-[8px] text-[#00e5a0] uppercase tracking-widest block mb-1.5">&#10022; AI Suggested Enhancement</span>
                      <p className="text-xs text-[#f5f5f5] italic mb-2 leading-relaxed">
                        &ldquo;Led cross-functional alignment across 6 product teams, accelerating Google Pay&apos;s merchant adoption by <span className="text-[#00e5a0] not-italic font-medium">31%</span> in 3 markets.&rdquo;
                      </p>
                      <p className="font-mono text-[8px] text-[#eab308] mb-3">&#9888; Replace &ldquo;31%&rdquo; with your verified metric</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptEdit('edit-2')}
                          className="flex items-center gap-1.5 bg-[#00e5a0] text-black text-xs font-bold px-3 py-1.5 rounded-sm"
                          aria-label="Accept edit"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => revertEdit('edit-2')}
                          className="flex items-center gap-1.5 bg-[#161616] border border-[#1e1e1e] text-[#888888] text-xs px-3 py-1.5 rounded-sm"
                          aria-label="Revert edit"
                        >
                          <Undo2 className="w-3 h-3" /> Revert
                        </button>
                      </div>
                    </div>
                  </li>
                )}

                {edit2?.status === 'accepted' && (
                  <li className="text-[#005d3e] font-medium">
                    Led cross-functional alignment across 6 product teams, accelerating Google Pay&apos;s merchant adoption by 31% in 3 markets.
                  </li>
                )}

                <li>Defined and shipped tap-to-pay expansion for Android devices in 8 APAC markets.</li>
              </ul>
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="font-bold border-b border-black/10 pb-1 mb-3 uppercase tracking-wider text-xs italic">Education</h2>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-sm">University of Waterloo</span>
              <span className="font-mono text-[10px]">2016 &ndash; 2020</span>
            </div>
            <div className="italic text-xs">B.A.Sc. in Computer Engineering, Management Science Option</div>
          </section>
        </div>
      </main>

      {/* ATS bar when all resolved */}
      {allResolved && (
        <div className="border-t border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2.5 flex items-center justify-between shrink-0 slide-up">
          <span className="font-mono text-[10px] text-[#888888]">
            <span className="text-[#00e5a0]">{acceptedCount} accepted</span> &middot; {revertedCount} reverted
          </span>
          <span className="font-mono text-[10px] text-[#00e5a0]">ATS 81% (+14)</span>
        </div>
      )}

      {/* Bottom action bar — always visible */}
      <div className="border-t border-[#1e1e1e] bg-[#111111] px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setChatOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#1e1e1e] hover:border-[#2a2a2a] text-[#888888] hover:text-[#f5f5f5] text-sm font-medium rounded-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Chat
          {pendingCount > 0 && <span className="font-mono text-[10px] text-[#00e5a0] ml-0.5">({pendingCount})</span>}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#00e5a0] hover:bg-[#00c98e] text-black py-2.5 text-sm font-bold rounded-sm transition-colors">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Chat bottom sheet */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setChatOpen(false)}
          />
          <div className="relative bg-[#111111] border-t border-[#1e1e1e] rounded-t-xl max-h-[65vh] flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
            {/* Handle */}
            <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
              <div className="w-8 h-1 bg-[#2a2a2a] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-[#1e1e1e] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#888888]">Stripe Senior PM</span>
                <div className="flex items-center gap-1 px-2 py-1 bg-[#161616] rounded-sm border border-[#1e1e1e]">
                  <span className="font-mono text-[9px] text-[#00e5a0]">JD attached &#10003;</span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-[#444444] hover:text-[#888888] transition-colors" aria-label="Close chat">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#444444] uppercase">AI</span>
                <p className="text-sm text-[#888888] leading-relaxed">
                  Analyzed your JD. Found 3 gaps:{' '}
                  <span className="text-[#f5f5f5] italic">&ldquo;stakeholder alignment,&rdquo;</span>{' '}
                  <span className="text-[#f5f5f5] italic">&ldquo;roadmap prioritization,&rdquo;</span>{' '}
                  <span className="text-[#f5f5f5] italic">&ldquo;cross-functional leadership.&rdquo;</span>{' '}
                  Want me to address these across your Experience section?
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-end">
                  <span className="font-mono text-[9px] text-[#444444] uppercase">You</span>
                </div>
                <div className="bg-[#161616] border border-[#1e1e1e] rounded-sm p-3 text-sm text-[#f5f5f5]">
                  Yes, but keep my voice. Don&apos;t be too formal.
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-[#00e5a0] uppercase">AI</span>
                <p className="text-sm text-[#888888]">Got it. Editing 4 bullets now...</p>
                <div className="flex gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <p className="font-mono text-[9px] text-[#444444] uppercase tracking-wider">Suggested</p>
                {['Make this shorter', 'Fix the skills section', 'Add more metrics'].map((p) => (
                  <button
                    key={p}
                    className="block w-full text-left text-xs text-[#888888] hover:text-[#f5f5f5] px-3 py-2 border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-sm transition-all hover:bg-[#161616]"
                  >
                    &ldquo;{p}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#1e1e1e] shrink-0">
              <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1e1e1e] focus-within:border-[#00e5a0] rounded-sm px-3 py-2.5 transition-colors">
                <input
                  className="flex-1 bg-transparent outline-none text-sm text-[#f5f5f5] placeholder:text-[#444444]"
                  placeholder="Type a message..."
                />
                <button className="p-1.5 bg-[#00e5a0] text-black rounded-sm hover:bg-[#00c98e] transition-colors" aria-label="Send">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
