'use client';

import { useRef, useState, useEffect } from 'react';
import { Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/badge';
import { Badge } from '@/components/ui/badge';
import { ChatInput } from '@/components/ui/input';
import { useResumeStore, ChatMessage } from '@/store/useResumeStore';

const SUGGESTED_PROMPTS = [
  'Make my bullets more concise',
  'Add metrics to my experience',
  'Tailor the summary to this JD',
  'Fix the skills section',
];

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isAi = msg.role === 'ai';
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isAi && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">
            AI
          </span>
        )}
        <div className="h-px flex-1 bg-[#141414]" />
        {!isAi && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">
            You
          </span>
        )}
      </div>

      {isAi ? (
        <div>
          <p className="text-[13px] leading-relaxed text-[#4a4a4a]">{msg.content}</p>
          {msg.isStreaming && (
            <div className="flex items-center gap-1 mt-2">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-sm p-3 text-[13px] text-[#e8e8e8] leading-relaxed"
          style={{
            background: '#141414',
            boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px #1c1c1c',
          }}
        >
          {msg.content}
        </div>
      )}
    </div>
  );
}

// ── ChatPanel ──────────────────────────────────────────────────────────────
export function ChatPanel() {
  const { messages, addMessage, jdText, jobTitle, company, selectedModel } = useResumeStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasJd = jdText.trim().length > 0;
  // Build context label for the header
  const contextLabel = [jobTitle, company].filter(Boolean).join(' @ ') || 'No role set';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');
    addMessage({ role: 'user', content: text });
    setIsLoading(true);

    // Simulate AI response (to be replaced with real API call)
    setTimeout(() => {
      addMessage({
        role: 'ai',
        content: `Understood — "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}". I'll apply that across your resume now.`,
        isStreaming: false,
      });
      setIsLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Alt+Enter or Ctrl+Enter to send
    if (e.key === 'Enter' && (e.altKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <aside
      className="w-[35%] flex flex-col border-r border-[#1c1c1c] bg-[#0f0f0f] shrink-0"
      aria-label="AI chat panel"
    >
      {/* Header */}
      <div className="px-5 py-2.5 border-b border-[#141414] flex items-center justify-between shrink-0 bg-[#080808]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#2a2a2a] truncate max-w-[60%]">
          {contextLabel}
        </span>
        <Badge variant={hasJd ? 'success' : 'neutral'}>
          {hasJd ? 'JD attached' : 'No JD'}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">AI</span>
              <div className="h-px flex-1 bg-[#141414]" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Suggested prompts — only when no human messages yet */}
        {messages.filter((m) => m.role === 'user').length === 0 && !isLoading && (
          <div className="pt-2 space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#2a2a2a]">
              Suggested
            </p>
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSuggestedPrompt(p)}
                className="block w-full text-left text-[12px] text-[#4a4a4a] hover:text-[#e8e8e8] px-3 py-2 border border-[#141414] hover:border-[#1c1c1c] rounded-sm transition-all hover:bg-[#111]"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#141414] bg-[#080808] shrink-0">
        <ChatInput
          id="chat-input"
          ref={inputRef}
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        >
          <Button
            id="chat-send-btn"
            variant="primary"
            size="sm"
            className="shrink-0 h-8 w-8 p-0"
            aria-label="Send message"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </ChatInput>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-[#222]" />
            <span className="font-mono text-[9px] text-[#2a2a2a]">{selectedModel}</span>
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
