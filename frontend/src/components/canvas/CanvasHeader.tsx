'use client';

import { ChevronDown, Download, History, Save } from 'lucide-react';
import Link from 'next/link';
import { useResumeStore } from '@/store/useResumeStore';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/badge';

export function CanvasHeader() {
  const { resumeName, setResumeName, toggleVersionHistory, showVersionHistory } = useResumeStore();

  return (
    <header className="h-11 border-b border-[#141414] flex items-center justify-between px-5 glass-panel z-50 shrink-0">
      {/* Left: Logo + resume name */}
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 border border-[#222] flex items-center justify-center rounded-sm">
            <span className="font-mono text-[8px] text-[#333] font-bold">OR</span>
          </div>
        </Link>

        <div className="h-3.5 w-px bg-[#1c1c1c]" />

        <div className="flex items-center gap-2 min-w-0">
          <input
            id="resume-name-input"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            className="bg-transparent outline-none text-[13px] font-medium text-[#e8e8e8] w-36 border-b border-transparent focus:border-[#2a2a2a] transition-colors pb-0.5 min-w-0 truncate"
            aria-label="Resume name"
          />
          <ChevronDown className="w-3 h-3 text-[#333] shrink-0" />
        </div>

        <span className="text-[#222] text-[10px]">·</span>
        <span className="font-mono text-[10px] text-[#2a2a2a]">Draft</span>
      </div>

      {/* Center: keyboard shortcut hints */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2.5">
        <Kbd>Y</Kbd>
        <span className="font-mono text-[9px] text-[#222] uppercase tracking-widest">Accept</span>
        <span className="text-[#1c1c1c] text-[10px]">·</span>
        <Kbd>N</Kbd>
        <span className="font-mono text-[9px] text-[#222] uppercase tracking-widest">Revert</span>
        <span className="text-[#1c1c1c] text-[10px]">·</span>
        <Kbd>Tab</Kbd>
        <span className="font-mono text-[9px] text-[#222] uppercase tracking-widest">Next</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        <Button id="save-version-btn" variant="secondary" size="sm">
          <Save className="w-3 h-3" />
          Save
        </Button>

        <Button
          id="version-history-btn"
          variant={showVersionHistory ? 'ghost' : 'secondary'}
          size="sm"
          onClick={toggleVersionHistory}
          aria-label="Toggle version history"
          className={showVersionHistory ? 'text-[#e8e8e8] bg-[#111]' : ''}
        >
          <History className="w-3 h-3" />
          History
        </Button>

        <Button
          id="export-pdf-btn"
          variant="primary"
          size="sm"
          sheen
          className="group"
        >
          <Download className="w-3 h-3" />
          Export PDF
        </Button>
      </div>
    </header>
  );
}
