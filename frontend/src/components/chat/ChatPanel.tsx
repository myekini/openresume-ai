'use client';

import { Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import { ChatInput } from '@/components/ui/input';

const SUGGESTED_PROMPTS = [
  'Make this shorter',
  'Fix the skills section',
  'Add more metrics',
];

export function ChatPanel() {
  return (
    <aside
      className="w-[35%] flex flex-col border-r border-[#1c1c1c] bg-[#0f0f0f] shrink-0"
      aria-label="AI chat panel"
    >
      {/* Header */}
      <div className="px-5 py-2.5 border-b border-[#141414] flex items-center justify-between shrink-0 bg-[#080808]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#2a2a2a]">
          Stripe Senior PM
        </span>
        <Badge variant="success">JD attached</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar">
        {/* AI — recedes (Layer 0) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">AI</span>
            <div className="h-px flex-1 bg-[#141414]" />
          </div>
          <p className="text-[13px] leading-relaxed text-[#4a4a4a]">
            Analyzed your JD. Found 3 gaps:{' '}
            <span className="text-[#e8e8e8]">&ldquo;stakeholder alignment,&rdquo;</span>{' '}
            <span className="text-[#e8e8e8]">&ldquo;roadmap prioritization,&rdquo;</span>{' '}
            <span className="text-[#e8e8e8]">&ldquo;cross-functional leadership.&rdquo;</span>{' '}
            Address these across your Experience section?
          </p>
        </div>

        {/* User — raised (Layer 2) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-[#141414]" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">You</span>
          </div>
          <div
            className="rounded-sm p-3 text-[13px] text-[#e8e8e8] leading-relaxed"
            style={{
              background: '#141414',
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px #1c1c1c',
            }}
          >
            Yes, but keep my voice. Don&apos;t be too formal.
          </div>
        </div>

        {/* AI streaming */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">AI</span>
            <div className="h-px flex-1 bg-[#141414]" />
          </div>
          <p className="text-[13px] leading-relaxed text-[#4a4a4a]">
            Got it. Editing 4 bullets now...
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Suggested */}
        <div className="pt-2 space-y-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">Suggested</p>
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              className="block w-full text-left text-[12px] text-[#4a4a4a] hover:text-[#e8e8e8] px-3 py-2 border border-[#141414] hover:border-[#1c1c1c] rounded-sm transition-all hover:bg-[#111]"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#141414] bg-[#080808] shrink-0">
        <ChatInput id="chat-input" placeholder="Type a message...">
          <Button
            id="chat-send-btn"
            variant="primary"
            size="sm"
            className="shrink-0 h-8 w-8 p-0"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </ChatInput>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-[#222]" />
            <span className="font-mono text-[9px] text-[#2a2a2a]">Claude 3.5 Sonnet</span>
            <button className="text-[#2a2a2a] hover:text-[#444]">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <Kbd>⌥</Kbd>
            <Kbd>↵</Kbd>
            <span className="font-mono text-[9px] text-[#222]">to send</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
