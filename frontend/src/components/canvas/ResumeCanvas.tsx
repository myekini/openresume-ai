'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Undo2, Edit2, RefreshCw, History, Save } from 'lucide-react';
import { useResumeStore, ExperienceEntry, EducationEntry } from '@/store/useResumeStore';

// ── Inline-edit wrapper ─────────────────────────────────────────────────────
function InlineEditable({
  value,
  onSave,
  className,
  tag: Tag = 'span',
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  tag?: React.ElementType;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onSave(draft.trim() || value);
  };

  if (editing) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { setEditing(false); setDraft(value); }
        }}
        className={`${className} bg-[#fffde7] outline-2 outline-[#00e5a0] rounded-sm resize-none w-full min-h-10 p-0.5 text-black`}
        rows={Math.max(2, Math.ceil(draft.length / 80))}
      />
    );
  }

  const TagElement = Tag as React.ElementType;
  return (
    <TagElement
      ref={ref}
      className={`${className} cursor-text hover:bg-[#f0fdf4] hover:outline-1 hover:outline-[#86efac] rounded-sm transition-all group/edit`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value}
      <Edit2 className="inline-block w-2.5 h-2.5 ml-1 text-transparent group-hover/edit:text-[#86efac] transition-colors" />
    </TagElement>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold border-b border-black/10 pb-1 mb-4 uppercase tracking-wider text-[11px] italic text-black">
      {children}
    </h2>
  );
}

// ── Experience ──────────────────────────────────────────────────────────────
function ExperienceSection({
  entries,
  editCards,
  acceptEdit,
  revertEdit,
}: {
  entries: ExperienceEntry[];
  editCards: { id: string; status: string }[];
  acceptEdit: (id: string) => void;
  revertEdit: (id: string) => void;
}) {
  const updateBullet = useResumeStore((s) => s.updateBullet);

  return (
    <section className="mb-10">
      <SectionHeading>Experience</SectionHeading>
      <div className="space-y-8">
        {entries.map((exp) => (
          <div key={exp.id}>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-lg text-black">{exp.company}</span>
              <span className="font-mono text-xs text-black">
                {exp.startDate} – {exp.endDate}
              </span>
            </div>
            <div className="italic text-sm font-medium text-black mb-2">{exp.title}</div>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-black">
              {exp.bullets.map((bullet) => {
                const editCard = editCards.find((ec) => ec.id === `edit-${bullet.id}`);
                const isPending = editCard?.status === 'pending';
                const isAccepted = editCard?.status === 'accepted';

                return (
                  <li key={bullet.id} className={isPending ? 'relative list-none -mx-5' : ''}>
                    {isPending ? (
                      <>
                        <div className="pl-5 blur-sm opacity-30 text-sm text-black">
                          {bullet.text}
                        </div>
                        <div
                          id={`edit-card-edit-${bullet.id}`}
                          className="mt-2 bg-[#0a0a0a] border-l-4 border-[#00e5a0] shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-4 rounded-sm slide-up"
                          role="region"
                          aria-label={`Proposed edit for bullet`}
                          aria-live="polite"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <span className="font-mono text-[9px] text-[#00e5a0] uppercase tracking-widest">
                                ✦ AI Suggested Enhancement
                              </span>
                              <p className="text-sm text-[#f5f5f5] mt-1.5 italic leading-snug">
                                &ldquo;{bullet.text}&rdquo;
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                id={`accept-edit-${bullet.id}`}
                                onClick={() => acceptEdit(`edit-${bullet.id}`)}
                                className="w-8 h-8 flex items-center justify-center bg-[#00e5a0] text-black rounded-sm hover:bg-[#00c98e] transition-colors shadow-[0_0_12px_rgba(0,229,160,0.2)]"
                                aria-label="Accept edit (Y)"
                                title="Accept (Y)"
                              >
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              </button>
                              <button
                                id={`revert-edit-${bullet.id}`}
                                onClick={() => revertEdit(`edit-${bullet.id}`)}
                                className="w-8 h-8 flex items-center justify-center bg-[#161616] border border-[#1e1e1e] text-[#888888] rounded-sm hover:bg-[#1e1e1e] transition-colors"
                                aria-label="Revert edit (N)"
                                title="Revert (N)"
                              >
                                <Undo2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : isAccepted ? (
                      <span className="text-[#005d3e] font-medium">{bullet.text}</span>
                    ) : (
                      <InlineEditable
                        value={bullet.text}
                        onSave={(val) => updateBullet(exp.id, bullet.id, val)}
                        className="text-black text-sm leading-relaxed"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Education ───────────────────────────────────────────────────────────────
function EducationSection({ entries }: { entries: EducationEntry[] }) {
  return (
    <section className="mb-10">
      <SectionHeading>Education</SectionHeading>
      <div className="space-y-4">
        {entries.map((edu) => (
          <div key={edu.id}>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-base text-black">{edu.institution}</span>
              <span className="font-mono text-xs text-black">
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
            <div className="italic text-sm text-black">{edu.degree}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Skills ──────────────────────────────────────────────────────────────────
function SkillsSection({ skills }: { skills: string[] }) {
  if (!skills.length) return null;
  return (
    <section className="mb-10">
      <SectionHeading>Skills</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="font-mono text-[11px] bg-[#f5f5f5] text-black px-2 py-0.5 rounded-sm border border-black/10"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyResumeState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
      <div className="w-12 h-12 rounded-full border border-[#1e1e1e] flex items-center justify-center">
        <Edit2 className="w-5 h-5 text-[#333]" />
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#444] mb-1">
          No resume loaded
        </p>
        <p className="text-[13px] text-[#333] max-w-[260px] leading-relaxed">
          Complete the onboarding to load your resume into the canvas.
        </p>
      </div>
    </div>
  );
}

// ── Main ResumeCanvas ───────────────────────────────────────────────────────
export function ResumeCanvas() {
  const { editCards, acceptEdit, revertEdit, resumeData, selectedTemplate } = useResumeStore();

  const pendingIds = editCards.filter((e) => e.status === 'pending').map((e) => e.id);
  const acceptedCount = editCards.filter((e) => e.status === 'accepted').length;
  const revertedCount = editCards.filter((e) => e.status === 'reverted').length;
  const allResolved = pendingIds.length === 0 && (acceptedCount + revertedCount) > 0;

  const hasContent =
    resumeData.contact.name && resumeData.contact.name !== 'Your Name';

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
        if (nextId)
          setTimeout(() => {
            document
              .getElementById(`edit-card-${nextId}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        revertEdit(firstId);
        const nextId = pendingIds[1];
        if (nextId)
          setTimeout(() => {
            document
              .getElementById(`edit-card-${nextId}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const nextId = pendingIds[1] ?? pendingIds[0];
        document
          .getElementById(`edit-card-${nextId}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingIds, acceptEdit, revertEdit]);

  return (
    <section
      className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden relative"
      aria-label="Resume canvas"
    >
      {/* Canvas toolbar */}
      <div className="h-10 flex items-center justify-between px-5 border-b border-[#1e1e1e] bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-[#444444]">Template:</span>
          <button className="flex items-center gap-1 font-mono text-[10px] text-[#888888] hover:text-[#f5f5f5] transition-colors capitalize">
            {selectedTemplate} <span className="ml-0.5">&#9662;</span>
          </button>
          <div className="h-3 w-px bg-[#1e1e1e]" />
          <button
            id="canvas-edit-directly-btn"
            className="flex items-center gap-1.5 font-mono text-[10px] text-[#444444] hover:text-[#888888] transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Edit directly
          </button>
          <button
            id="canvas-rerun-btn"
            className="flex items-center gap-1.5 font-mono text-[10px] text-[#444444] hover:text-[#888888] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Re-run AI
          </button>
          <button
            id="canvas-version-history-btn"
            className="flex items-center gap-1.5 font-mono text-[10px] text-[#444444] hover:text-[#888888] transition-colors"
          >
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
        <div
          className="max-w-[740px] mx-auto bg-white text-black min-h-[1000px] shadow-[0_4px_32px_rgba(0,0,0,0.5)] p-14 relative"
          data-template={selectedTemplate}
        >
          {!hasContent ? (
            <EmptyResumeState />
          ) : (
            <>
              {/* Header */}
              <header className="text-center space-y-1 mb-10 pb-8 border-b-2 border-black">
                <h1 className="text-[28px] font-bold uppercase tracking-tight text-black">
                  {resumeData.contact.name}
                </h1>
                <p className="font-mono text-[11px] space-x-3 text-[#333]">
                  {[
                    resumeData.contact.location,
                    resumeData.contact.linkedin,
                    resumeData.contact.email,
                    resumeData.contact.phone,
                  ]
                    .filter(Boolean)
                    .map((item, i, arr) => (
                      <span key={i}>
                        {item}
                        {i < arr.length - 1 && (
                          <span className="mx-2 text-[#aaa]">&middot;</span>
                        )}
                      </span>
                    ))}
                </p>
              </header>

              {/* Summary */}
              {resumeData.summary && (
                <section className="mb-10">
                  <SectionHeading>Summary</SectionHeading>
                  <p className="text-sm leading-relaxed text-black">{resumeData.summary}</p>
                </section>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <ExperienceSection
                  entries={resumeData.experience}
                  editCards={editCards}
                  acceptEdit={acceptEdit}
                  revertEdit={revertEdit}
                />
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <EducationSection entries={resumeData.education} />
              )}

              {/* Skills */}
              <SkillsSection skills={resumeData.skills} />
            </>
          )}
        </div>
      </div>

      {/* ATS summary bar — shown after all edits resolved */}
      {allResolved && (
        <div className="border-t border-[#1e1e1e] bg-[#0a0a0a] px-10 py-4 flex items-center justify-between slide-up shrink-0">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] text-[#888888]">
              <span className="text-[#00e5a0]">{acceptedCount} accepted</span> &middot;{' '}
              {revertedCount} reverted
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
            <button className="flex items-center gap-1.5 font-mono text-[10px] text-[#888888] hover:text-[#f5f5f5] border border-[#1e1e1e] hover:border-border-hover px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors">
              <Save className="w-3 h-3" />
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
