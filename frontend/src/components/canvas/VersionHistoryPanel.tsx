'use client';

import { X, Plus, ArrowLeftRight } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';

export function VersionHistoryPanel() {
  const { showVersionHistory, toggleVersionHistory } = useResumeStore();

  if (!showVersionHistory) return null;

  return (
    <aside
      id="version-history-panel"
      className="absolute right-0 top-0 h-full w-[360px] border-l border-[#1e1e1e] bg-[#0a0a0a] flex flex-col z-40 slide-from-right shadow-[-8px_0_32px_rgba(0,0,0,0.5)]"
      aria-label="Version history"
    >
      {/* Header */}
      <div className="p-5 border-b border-[#1e1e1e] shrink-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-[#f5f5f5]" style={{ fontFamily: 'var(--font-display)' }}>
            Version History
          </h2>
          <button
            id="version-history-close-btn"
            onClick={toggleVersionHistory}
            className="text-[#444444] hover:text-[#f5f5f5] transition-colors"
            aria-label="Close version history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 bg-[#00e5a0] hover:bg-[#00c98e] text-black text-xs font-bold py-2.5 rounded-sm transition-all">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            New Version
          </button>
          <button className="flex items-center justify-center gap-1.5 bg-[#161616] border border-[#1e1e1e] text-[#f5f5f5] text-xs font-bold py-2.5 rounded-sm hover:bg-[#1e1e1e] transition-colors">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Compare
          </button>
        </div>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {[
          { label: 'Applied', date: 'Mar 12', name: 'Stripe PM v2', note: 'Fintech Leadership', color: 'text-black bg-[#00e5a0]', border: 'border-[#00e5a0]' },
          { label: 'Interview', date: 'Mar 8', name: 'Google APM', note: 'Strategic Analysis focus', color: 'text-[#a3e635] bg-[#a3e635]/10', border: 'border-transparent' },
          { label: 'Draft', date: 'Mar 1', name: 'Notion Head of Product', note: 'PLG & Ecosystem narrative', color: 'text-[#888888] bg-[#888888]/10', border: 'border-transparent' },
          { label: 'Base', date: 'Feb 20', name: 'Master', note: 'Full career history', color: 'text-[#444444] bg-[#444444]/10', border: 'border-transparent', pin: true },
        ].map((v) => (
          <button
            key={v.name}
            className={`w-full text-left p-4 bg-[#111111] hover:bg-[#161616] border-l-2 ${v.border} rounded-sm transition-all cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${v.color}`}>
                {v.pin ? '📌 ' : ''}{v.label}
              </span>
              <span className="font-mono text-[9px] text-[#444444]">{v.date}</span>
            </div>
            <p className="font-medium text-sm text-[#f5f5f5] mb-0.5">{v.name}</p>
            <p className="text-xs text-[#444444] font-mono">{v.note}</p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e1e1e] shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
          <span className="font-mono text-[9px] text-[#a3e635] uppercase tracking-widest">AI Scoring Active</span>
        </div>
        <div className="h-1 w-full bg-[#161616] rounded-full overflow-hidden">
          <div className="h-full bg-[#a3e635] w-[88%] shadow-[0_0_8px_rgba(163,230,53,0.3)]" />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[9px] text-[#444444]">Compatibility: Stripe</span>
          <span className="font-mono text-[9px] text-[#a3e635]">88%</span>
        </div>
      </div>
    </aside>
  );
}
