'use client';

import { ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useResumeStore } from '@/store/useResumeStore';

const MODELS = [
  { label: 'Claude 3.5 Sonnet', sub: 'Anthropic' },
  { label: 'GPT-4o', sub: 'OpenAI' },
  { label: 'Gemini 1.5 Pro', sub: 'Google' },
  { label: 'Ollama (local)', sub: 'Your machine' },
];

export function AlignmentStep() {
  const { setOnboardingStep } = useResumeStore();

  return (
    <div className="w-full max-w-[480px] space-y-6">
      {/* JD textarea */}
      <div className="relative">
        <label
          htmlFor="jd-input"
          className="block font-mono text-[10px] text-[#444444] uppercase tracking-widest mb-2"
        >
          Job Description
        </label>
        <textarea
          id="jd-input"
          className="w-full h-40 bg-[#111111] border border-[#1e1e1e] hover:border-[#2a2a2a] focus:border-[#00e5a0] outline-none text-sm text-[#f5f5f5] p-4 leading-relaxed placeholder:text-[#444444] resize-none rounded-sm transition-colors custom-scrollbar"
          placeholder="Paste the full job description here..."
        />
      </div>

      {/* Job title + company */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="job-title"
            className="block font-mono text-[10px] text-[#444444] uppercase tracking-widest mb-2"
          >
            Job Title (optional)
          </label>
          <input
            id="job-title"
            type="text"
            placeholder="e.g. Senior PM"
            className="w-full bg-[#111111] border border-[#1e1e1e] hover:border-[#2a2a2a] focus:border-[#00e5a0] outline-none text-sm text-[#f5f5f5] px-3 py-2.5 rounded-sm placeholder:text-[#444444] transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="company"
            className="block font-mono text-[10px] text-[#444444] uppercase tracking-widest mb-2"
          >
            Company (optional)
          </label>
          <input
            id="company"
            type="text"
            placeholder="e.g. Stripe"
            className="w-full bg-[#111111] border border-[#1e1e1e] hover:border-[#2a2a2a] focus:border-[#00e5a0] outline-none text-sm text-[#f5f5f5] px-3 py-2.5 rounded-sm placeholder:text-[#444444] transition-colors"
          />
        </div>
      </div>

      {/* Model selector */}
      <div>
        <label
          htmlFor="model-selector"
          className="block font-mono text-[10px] text-[#444444] uppercase tracking-widest mb-2"
        >
          Model
        </label>
        <div className="relative">
          <select
            id="model-selector"
            className="w-full bg-[#111111] border border-[#1e1e1e] hover:border-[#2a2a2a] focus:border-[#00e5a0] outline-none text-sm text-[#f5f5f5] px-3 py-2.5 rounded-sm appearance-none cursor-pointer transition-colors"
          >
            {MODELS.map((m) => (
              <option key={m.label} value={m.label}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444444] pointer-events-none" />
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setOnboardingStep('template')}
          className="flex items-center gap-2 font-mono text-[11px] text-[#444444] hover:text-[#888888] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <Link
          href="/canvas"
          id="alignment-open-canvas-btn"
          className="flex items-center gap-2.5 bg-[#00e5a0] hover:bg-[#00c98e] text-black px-6 py-3 rounded-sm font-bold text-sm transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,160,0.2)] group"
        >
          Open Canvas
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
