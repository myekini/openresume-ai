"use client";

import { useEffect, useState, useRef } from "react";
import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Animation phases ─── */
type Phase =
  | "idle"
  | "user-typing"
  | "ai-thinking"
  | "ai-responding"
  | "resume-streaming"
  | "card-visible"
  | "accepting"
  | "accepted"
  | "resetting";

const USER_MSG      = "Make my experience bullets more quantified";
const AI_PRE_MSG    = "Analyzing bullet 2 — adding metrics...";
const ORIGINAL_LINE = "Led cross-functional team on payment platform initiative";
const STREAMED_LINE = "Led 8-person cross-functional team to ship payment platform, cutting fraud by 23%";
const REASON_TEXT   = "JD requires quantified impact for infrastructure roles.";

function useTyped(target: string, active: boolean, speed = 28) {
  const [typed, setTyped]   = useState("");
  const [done,  setDone]    = useState(false);
  const indexRef            = useRef(0);

  useEffect(() => {
    if (!active) { setTyped(""); setDone(false); indexRef.current = 0; return; }
    const id = setInterval(() => {
      if (indexRef.current >= target.length) { setDone(true); clearInterval(id); return; }
      setTyped(target.slice(0, ++indexRef.current));
    }, speed);
    return () => clearInterval(id);
  }, [active, target, speed]);

  return { typed, done };
}

export function HeroMockup() {
  const [phase, setPhase]           = useState<Phase>("idle");
  const [streamedChars, setStreamed] = useState(0);
  const streamRef                    = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Phase sequencer ─── */
  useEffect(() => {
    const go = (next: Phase, delay: number) =>
      setTimeout(() => setPhase(next), delay);

    let timers: ReturnType<typeof setTimeout>[] = [];

    if (phase === "idle") {
      timers.push(go("user-typing",    1200));
    }
    if (phase === "ai-thinking") {
      timers.push(go("ai-responding",  1600));
    }
    if (phase === "ai-responding") {
      timers.push(go("resume-streaming", 1200));
    }
    if (phase === "card-visible") {
      /* stays visible for 2.4 s before auto-accepting */
      timers.push(go("accepting", 2400));
    }
    if (phase === "accepting") {
      timers.push(go("accepted",   700));
    }
    if (phase === "accepted") {
      timers.push(go("resetting",  1400));
    }
    if (phase === "resetting") {
      setStreamed(0);
      timers.push(go("idle",       600));
    }

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  /* ─── User-typing done → trigger AI thinking ─── */
  const onUserTypingDone = () => setPhase("ai-thinking");

  /* ─── Resume streaming ─── */
  useEffect(() => {
    if (phase !== "resume-streaming") {
      if (streamRef.current) clearInterval(streamRef.current);
      if (phase !== "card-visible" && phase !== "accepting" && phase !== "accepted")
        setStreamed(0);
      return;
    }
    let i = 0;
    streamRef.current = setInterval(() => {
      i++;
      setStreamed(i);
      if (i >= STREAMED_LINE.length) {
        clearInterval(streamRef.current!);
        setTimeout(() => setPhase("card-visible"), 400);
      }
    }, 22); // ~22ms per char ≈ 45 chars/sec
    return () => clearInterval(streamRef.current!);
  }, [phase]);

  const { typed: userTyped, done: userDone } = useTyped(
    USER_MSG,
    phase === "user-typing",
    38,
  );

  /* derived state */
  const showUserMsg      = ["user-typing","ai-thinking","ai-responding","resume-streaming","card-visible","accepting","accepted","resetting"].includes(phase);
  const showAiThinking   = ["ai-thinking"].includes(phase);
  const showAiPre        = ["ai-responding","resume-streaming","card-visible","accepting","accepted"].includes(phase);
  const showStreamedLine = ["resume-streaming","card-visible","accepting","accepted"].includes(phase);
  const showAccepted     = ["accepted"].includes(phase);
  const showCard         = ["card-visible","accepting"].includes(phase);
  const isAccepting      = phase === "accepting";

  /* trigger onUserTypingDone once */
  const prevUserDone = useRef(false);
  useEffect(() => {
    if (userDone && !prevUserDone.current && phase === "user-typing") {
      prevUserDone.current = true;
      onUserTypingDone();
    }
    if (!userDone) prevUserDone.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDone, phase]);

  return (
    <div className="relative premium-card rounded-xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.9)]">
      {/* ── Topbar ── */}
      <div className="h-9 border-b border-[#1c1c1c] flex items-center px-4 gap-3 glass-panel">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
        </div>
        <div className="flex-1 h-[3px] bg-[#1c1c1c] rounded-full max-w-[70px]" />
        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
          <span className="font-mono text-[8px] text-[#333]">AI READY</span>
        </div>
      </div>

      {/* ── Split pane ── */}
      <div className="flex" style={{ height: "340px" }}>

        {/* Chat panel */}
        <div className="w-[36%] border-r border-[#1c1c1c] flex flex-col bg-[#0a0a0a]">
          {/* Chat header */}
          <div className="px-4 py-2 border-b border-[#141414] flex items-center justify-between">
            <span className="font-mono text-[9px] text-[#2a2a2a] uppercase tracking-widest">Stripe PM · JD Loaded</span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            {/* AI opening message — always visible */}
            <div className="space-y-1">
              <span className="font-mono text-[8px] text-[#2a2a2a] uppercase">AI</span>
              <div className="text-[11px] text-[#4a4a4a] leading-relaxed">
                Analyzed your JD. Found 3 gaps — quantified impact, stakeholder alignment, cross-functional scope.
              </div>
            </div>

            {/* User typed message */}
            <AnimatePresence>
              {showUserMsg && (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-end">
                    <span className="font-mono text-[8px] text-[#2a2a2a] uppercase">You</span>
                  </div>
                  <div
                    className="text-[11px] text-[#e8e8e8] leading-relaxed rounded-sm px-3 py-2 ml-4"
                    style={{
                      background: "#141414",
                      boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px #1c1c1c",
                    }}
                  >
                    {userTyped}
                    {phase === "user-typing" && (
                      <span className="inline-block w-0.5 h-3 bg-[#e8e8e8] ml-0.5 align-middle animate-pulse" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI thinking */}
            <AnimatePresence>
              {showAiThinking && (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="font-mono text-[8px] text-[#00e5a0] uppercase">AI</span>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI pre-response */}
            <AnimatePresence>
              {showAiPre && (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="font-mono text-[8px] text-[#00e5a0] uppercase">AI</span>
                  <div className="text-[11px] text-[#5a5a5a] leading-relaxed">{AI_PRE_MSG}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="p-3 border-t border-[#141414]">
            <div className="flex items-center gap-2 bg-[#0f0f0f] border border-[#1c1c1c] rounded-sm px-3 py-2">
              <div className="flex-1 h-1 bg-[#1c1c1c] rounded-full" />
              <div className="w-5 h-5 rounded-sm bg-[#00e5a0] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 border-r border-b border-black rotate-[-45deg] translate-y-[-1px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Resume canvas */}
        <div className="flex-1 p-5 bg-[#080808] overflow-hidden relative">
          <div className="surface-paper rounded-sm p-5 h-full overflow-hidden relative">
            {/* Header */}
            <div className="mb-3">
              <div className="h-3 bg-[#111] rounded w-[45%] mb-1" />
              <div className="h-1.5 bg-[#e0e0e0] rounded w-1/3" />
            </div>
            <div className="h-px bg-[#f0f0f0] mb-3" />

            {/* Summary section */}
            <div className="mb-3">
              <div className="h-1.5 bg-[#111] rounded w-[22%] mb-2" />
              <div className="h-1.5 bg-[#eee] rounded w-full mb-1.5" />
              <div className="h-1.5 bg-[#eee] rounded w-5/6" />
            </div>

            {/* Experience section */}
            <div>
              <div className="h-1.5 bg-[#111] rounded w-[25%] mb-2" />

              {/* Bullet 1 — always static */}
              <div className="flex gap-2 mb-2 items-start">
                <div className="w-1 h-1 rounded-full bg-[#ccc] mt-1 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-1.5 bg-[#eee] rounded w-full" />
                  <div className="h-1.5 bg-[#eee] rounded w-4/5" />
                </div>
              </div>

              {/* Bullet 2 — animated */}
              <div className="flex gap-2 items-start relative">
                <div
                  className="w-1 h-1 rounded-full mt-1 shrink-0 transition-colors duration-300"
                  style={{ background: showStreamedLine ? "#00e5a0" : "#ccc" }}
                />
                <div className="flex-1">
                  {/* Original line — hidden when streaming takes over */}
                  {!showStreamedLine && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-[#eee] rounded w-full" />
                      <div className="h-1.5 bg-[#eee] rounded w-3/5" />
                    </div>
                  )}

                  {/* Streaming / accepted line */}
                  {showStreamedLine && (
                    <div
                      className="rounded-sm px-2 py-1 transition-all duration-300"
                      style={{
                        background: showAccepted
                          ? "transparent"
                          : isAccepting
                          ? "rgba(0,229,160,0.18)"
                          : "rgba(0,229,160,0.08)",
                        borderLeft: showAccepted
                          ? "2px solid transparent"
                          : "2px solid #00e5a0",
                      }}
                    >
                      <p
                        className="text-[9px] leading-relaxed transition-colors duration-300"
                        style={{ color: showAccepted ? "#555" : "#2a2a2a" }}
                      >
                        {STREAMED_LINE.slice(0, streamedChars)}
                        {phase === "resume-streaming" && (
                          <span className="inline-block w-0.5 h-2.5 bg-[#00e5a0] ml-0.5 align-middle animate-pulse" />
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bullet 3 — always static */}
              <div className="flex gap-2 mt-2 items-start">
                <div className="w-1 h-1 rounded-full bg-[#ccc] mt-1 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-1.5 bg-[#eee] rounded w-5/6" />
                </div>
              </div>
            </div>

            {/* ── Suggestion card ── */}
            <AnimatePresence>
              {showCard && (
                <motion.div
                  className="absolute bottom-4 left-4 right-4"
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,  scale: 1 }}
                  exit={{    opacity: 0, y: 6,  scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 360, damping: 28 }}
                >
                  <div
                    className="rounded-sm p-3 border-l-4 border-[#00e5a0]"
                    style={{
                      background: "#0a0a0a",
                      boxShadow: "0 4px 32px rgba(0,0,0,0.8), 0 0 0 1px #1c1c1c",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <span className="font-mono text-[8px] text-[#00e5a0] uppercase tracking-wider">
                          ✦ AI Suggested
                        </span>
                        <p className="text-[10px] text-[#e8e8e8] mt-1 italic leading-snug">
                          &ldquo;...cutting fraud by{" "}
                          <span className="text-[#00e5a0] not-italic font-semibold">23%</span>
                          &rdquo;
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-[8px] text-[#333] mb-2">{REASON_TEXT}</p>
                    <div className="flex gap-1.5">
                      <motion.button
                        className="flex items-center gap-1 bg-[#00e5a0] text-black text-[9px] font-bold px-3 py-1 rounded-sm"
                        animate={isAccepting ? { scale: [1, 0.95, 1], opacity: [1, 0.8, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        Accept
                      </motion.button>
                      <button className="flex items-center gap-1 text-[#4a4a4a] text-[9px] font-medium px-3 py-1 rounded-sm border border-[#1c1c1c] bg-[#0f0f0f]">
                        <X className="w-2.5 h-2.5" />
                        Revert
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Accepted flash overlay */}
            <AnimatePresence>
              {showAccepted && (
                <motion.div
                  className="absolute inset-0 rounded-sm pointer-events-none"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.9 }}
                  style={{ background: "rgba(0,229,160,0.12)" }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
