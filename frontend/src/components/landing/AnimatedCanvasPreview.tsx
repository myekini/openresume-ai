"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Stage = "a-idle" | "a-stream" | "a-card" | "b-idle" | "b-stream" | "b-card" | "reset";

const BULLETS = [
  {
    original: "Managed internal tooling project",
    streamed:  "Orchestrated 6-engineer rebuild of internal tooling, reducing deploy time by 40%",
    keyword:   "40%",
  },
  {
    original: "Worked on API design for partner integrations",
    streamed:  "Designed and shipped REST API for 12 enterprise partners, onboarding 3 in Q1",
    keyword:   "12 enterprise",
  },
];

export function AnimatedCanvasPreview() {
  const [stage,    setStage]    = useState<Stage>("a-idle");
  const [charsA,   setCharsA]   = useState(0);
  const [charsB,   setCharsB]   = useState(0);
  const [chatLine, setChatLine] = useState(0);

  const chatMessages = [
    "Analyzing 2 bullets for quantifiable impact...",
    "Editing bullet 1 — added team size + metric.",
    "Editing bullet 2 — added partner count + timeline.",
  ];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (stage === "a-idle") {
      setChatLine(0);
      timer = setTimeout(() => setStage("a-stream"), 1000);
    }
    if (stage === "a-card") {
      setChatLine(1);
      timer = setTimeout(() => setStage("b-idle"),   2200);
    }
    if (stage === "b-idle") {
      timer = setTimeout(() => setStage("b-stream"), 600);
    }
    if (stage === "b-card") {
      setChatLine(2);
      timer = setTimeout(() => setStage("reset"),    2200);
    }
    if (stage === "reset") {
      timer = setTimeout(() => {
        setCharsA(0);
        setCharsB(0);
        setStage("a-idle");
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [stage]);

  /* stream bullet A */
  useEffect(() => {
    if (stage !== "a-stream") return;
    let i = charsA;
    const id = setInterval(() => {
      i++;
      setCharsA(i);
      if (i >= BULLETS[0].streamed.length) {
        clearInterval(id);
        setTimeout(() => setStage("a-card"), 300);
      }
    }, 24);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  /* stream bullet B */
  useEffect(() => {
    if (stage !== "b-stream") return;
    let i = charsB;
    const id = setInterval(() => {
      i++;
      setCharsB(i);
      if (i >= BULLETS[1].streamed.length) {
        clearInterval(id);
        setTimeout(() => setStage("b-card"), 300);
      }
    }, 24);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const showA     = ["a-stream","a-card","b-idle","b-stream","b-card","reset"].includes(stage);
  const showACard = stage === "a-card";
  const showB     = ["b-stream","b-card","reset"].includes(stage);
  const showBCard = stage === "b-card";
  const streamingA = stage === "a-stream";
  const streamingB = stage === "b-stream";
  const isReset    = stage === "reset";

  return (
    <div className="relative premium-card rounded-xl overflow-hidden h-64 flex shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      {/* Chat panel */}
      <div className="w-[35%] border-r border-[#1c1c1c] p-5 flex flex-col gap-3 bg-[#0a0a0a]">
        <div className="space-y-1 mb-1">
          <span className="font-mono text-[8px] uppercase text-[#2a2a2a] tracking-widest">AI</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={chatLine}
            className="text-[10px] text-[#4a4a4a] leading-relaxed"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -2 }}
            transition={{ duration: 0.25 }}
          >
            {chatMessages[chatLine]}
          </motion.p>
        </AnimatePresence>

        {/* Streaming dots */}
        <AnimatePresence>
          {(streamingA || streamingB) && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-bounce" style={{ animationDelay: "300ms" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resume */}
      <div className="flex-1 p-5 bg-[#080808]">
        <div className="surface-paper rounded shadow h-full p-4 space-y-3 overflow-hidden relative">
          {/* Name */}
          <div className="h-3 bg-[#111] rounded w-1/3" />
          <div className="h-px bg-[#f0f0f0]" />

          {/* Bullet A */}
          <div className="flex gap-2 items-start">
            <div
              className="w-1 h-1 rounded-full mt-1 shrink-0 transition-colors duration-300"
              style={{ background: showA ? "#00e5a0" : "#ccc" }}
            />
            <div className="flex-1 min-w-0">
              {!showA ? (
                <div className="h-1.5 bg-[#eee] rounded w-full" />
              ) : (
                <div
                  className="rounded px-1.5 py-1 text-[8px] leading-relaxed transition-all duration-300"
                  style={{
                    background: isReset ? "transparent" : showACard ? "rgba(0,229,160,0.12)" : "rgba(0,229,160,0.07)",
                    borderLeft: isReset || !showA ? "none" : "2px solid #00e5a0",
                    color: "#2a2a2a",
                  }}
                >
                  {BULLETS[0].streamed.slice(0, charsA)}
                  {streamingA && <span className="inline-block w-0.5 h-2 bg-[#00e5a0] ml-0.5 align-middle animate-pulse" />}
                </div>
              )}
            </div>
          </div>

          {/* Bullet B */}
          <div className="flex gap-2 items-start">
            <div
              className="w-1 h-1 rounded-full mt-1 shrink-0 transition-colors duration-300"
              style={{ background: showB ? "#00e5a0" : "#ccc" }}
            />
            <div className="flex-1 min-w-0">
              {!showB ? (
                <div className="space-y-1">
                  <div className="h-1.5 bg-[#eee] rounded w-5/6" />
                  <div className="h-1.5 bg-[#eee] rounded w-3/4" />
                </div>
              ) : (
                <div
                  className="rounded px-1.5 py-1 text-[8px] leading-relaxed transition-all duration-300"
                  style={{
                    background: isReset ? "transparent" : showBCard ? "rgba(0,229,160,0.12)" : "rgba(0,229,160,0.07)",
                    borderLeft: isReset || !showB ? "none" : "2px solid #00e5a0",
                    color: "#2a2a2a",
                  }}
                >
                  {BULLETS[1].streamed.slice(0, charsB)}
                  {streamingB && <span className="inline-block w-0.5 h-2 bg-[#00e5a0] ml-0.5 align-middle animate-pulse" />}
                </div>
              )}
            </div>
          </div>

          {/* Static bullet 3 */}
          <div className="flex gap-2 items-start">
            <div className="w-1 h-1 rounded-full bg-[#ccc] mt-1 shrink-0" />
            <div className="h-1.5 bg-[#eee] rounded w-2/3" />
          </div>

          {/* Accept card for A */}
          <AnimatePresence>
            {showACard && (
              <motion.div
                className="absolute bottom-3 left-3 right-3 rounded-sm p-2.5 border-l-4 border-[#00e5a0]"
                style={{ background: "#0a0a0a", boxShadow: "0 4px 20px rgba(0,0,0,0.8), 0 0 0 1px #1c1c1c" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: 4 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[7px] text-[#00e5a0] uppercase tracking-wider">✦ Accepted</span>
                    <p className="text-[8px] text-[#e8e8e8] mt-0.5 italic leading-snug">
                      Added team size + <span className="text-[#00e5a0] not-italic font-semibold">40%</span> metric
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-sm bg-[#00e5a0] flex items-center justify-center shrink-0">
                    <span className="text-black text-[9px] font-bold">✓</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Accept card for B */}
          <AnimatePresence>
            {showBCard && (
              <motion.div
                className="absolute bottom-3 left-3 right-3 rounded-sm p-2.5 border-l-4 border-[#00e5a0]"
                style={{ background: "#0a0a0a", boxShadow: "0 4px 20px rgba(0,0,0,0.8), 0 0 0 1px #1c1c1c" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: 4 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[7px] text-[#00e5a0] uppercase tracking-wider">✦ Accepted</span>
                    <p className="text-[8px] text-[#e8e8e8] mt-0.5 italic leading-snug">
                      Added <span className="text-[#00e5a0] not-italic font-semibold">12 enterprise</span> partners + timeline
                    </p>
                  </div>
                  <div className="w-5 h-5 rounded-sm bg-[#00e5a0] flex items-center justify-center shrink-0">
                    <span className="text-black text-[9px] font-bold">✓</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0f0f0f] to-transparent pointer-events-none" />
    </div>
  );
}
