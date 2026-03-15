'use client';

export function StatusBar() {
  return (
    <footer className="h-6 bg-[#080808] border-t border-[#141414] flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-[#00e5a0] animate-pulse" />
          <span className="font-mono text-[9px] text-[#2a2a2a]">Synced</span>
        </div>
        <span className="text-[#1c1c1c]">·</span>
        <span className="font-mono text-[9px] text-[#2a2a2a]">4,821 tokens remaining</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[9px] text-[#1c1c1c]">LaTeX · 12ms</span>
      </div>
    </footer>
  );
}
