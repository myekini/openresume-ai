'use client';

import { Bolt, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useResumeStore, SettingsTab } from '@/store/useResumeStore';
import { Toggle } from '@/components/ui/badge';

const NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'ai-models', label: 'AI Models', icon: <Bolt className="w-3.5 h-3.5" /> },
  { id: 'account',   label: 'Account',   icon: <User className="w-3.5 h-3.5" /> },
];

export function SettingsSidebar() {
  const { settingsTab, setSettingsTab } = useResumeStore();

  return (
    <aside className="w-60 border-r border-[#141414] flex flex-col bg-[#080808] shrink-0" aria-label="Settings navigation">
      <div className="p-6 border-b border-[#141414]">
        <Link
          href="/canvas"
          className="flex items-center gap-1.5 font-mono text-[10px] text-[#2a2a2a] hover:text-[#4a4a4a] transition-colors uppercase tracking-widest mb-5"
        >
          <ArrowLeft className="w-3 h-3" />
          Canvas
        </Link>
        <h1
          className="text-2xl text-[#e8e8e8] tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
        >
          Settings
        </h1>
        <p className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest mt-1">Configuration</p>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-1" aria-label="Settings sections">
        {NAV_ITEMS.map((item) => {
          const isActive = settingsTab === item.id;
          return (
            <button
              key={item.id}
              id={`settings-nav-${item.id}`}
              onClick={() => setSettingsTab(item.id)}
              className={[
                'flex items-center justify-between py-2.5 px-3 rounded-sm text-left transition-all text-[13px] font-medium',
                isActive
                  ? 'bg-[#111] text-[#e8e8e8] border-l-2 border-[#e8e8e8]/20'
                  : 'text-[#2a2a2a] hover:text-[#6b6b6b] hover:bg-[#0f0f0f] border-l-2 border-transparent',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{item.label}</span>
              <span className={[
                'transition-opacity',
                isActive ? 'opacity-100 text-[#4a4a4a]' : 'opacity-0',
              ].join(' ')}>
                {item.icon}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Privacy mode */}
      <div className="m-3 p-4 bg-[#0f0f0f] rounded-sm border border-[#141414]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#4a4a4a]">
            Privacy Mode
          </span>
          <Toggle
            id="privacy-mode-toggle"
            checked={true}
            aria-label="Toggle privacy mode"
          />
        </div>
        <p className="text-[11px] leading-relaxed text-[#2a2a2a]">
          Nothing leaves your browser.
        </p>
      </div>
    </aside>
  );
}
