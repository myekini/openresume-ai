'use client';

import { CanvasHeader } from '@/components/canvas/CanvasHeader';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ResumeCanvas } from '@/components/canvas/ResumeCanvas';
import { StatusBar } from '@/components/canvas/StatusBar';
import { VersionHistoryPanel } from '@/components/canvas/VersionHistoryPanel';
import MobileCanvas from '@/components/canvas/MobileCanvas';

export default function CanvasPage() {
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex h-screen w-full flex-col bg-[#0a0a0a] text-[#f5f5f5] overflow-hidden">
        {/* Topbar */}
        <CanvasHeader />

        {/* Main split pane: Chat | Canvas | [Version History] */}
        <main className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Left: Chat 35% */}
          <ChatPanel />

          {/* Right: Canvas 65% (or remaining space) */}
          <ResumeCanvas />

          {/* Version history panel — slides in as a column on the far right */}
          <VersionHistoryPanel />
        </main>

        {/* Status bar */}
        <StatusBar />
      </div>

      {/* Mobile experience */}
      <MobileCanvas />
    </>
  );
}
