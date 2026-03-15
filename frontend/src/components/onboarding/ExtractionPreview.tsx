'use client';

import { Edit2, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';

export function ExtractionPreview() {
  const { setOnboardingStep } = useResumeStore();

  return (
    <div className="w-full max-w-[480px] space-y-6">
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-sm p-6 space-y-5">
        <div>
          <p className="font-mono text-[10px] text-[#00e5a0] uppercase tracking-widest mb-1">
            Extracted content — confirm before editing
          </p>
          <div className="h-px bg-[#1e1e1e]" />
        </div>

        {/* Name */}
        <div className="flex items-center justify-between py-2 border-b border-[#1e1e1e]">
          <div>
            <p className="font-mono text-[9px] text-[#444444] uppercase mb-0.5">Name</p>
            <p className="text-[#f5f5f5] text-sm">Taiwo Adeyemi</p>
          </div>
          <button
            aria-label="Edit name"
            className="text-[#444444] hover:text-[#00e5a0] transition-colors p-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between py-2 border-b border-[#1e1e1e]">
          <div>
            <p className="font-mono text-[9px] text-[#444444] uppercase mb-0.5">Email</p>
            <p className="text-[#f5f5f5] text-sm">taiwo@email.com</p>
          </div>
          <button
            aria-label="Edit email"
            className="text-[#444444] hover:text-[#00e5a0] transition-colors p-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Experience */}
        <div className="flex items-center justify-between py-2 border-b border-[#1e1e1e]">
          <div>
            <p className="font-mono text-[9px] text-[#444444] uppercase mb-0.5">Experience</p>
            <p className="text-[#888888] text-sm">3 roles found</p>
          </div>
          <button
            aria-label="Expand experience"
            className="text-[#444444] hover:text-[#888888] transition-colors p-1"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Education */}
        <div className="flex items-center justify-between py-2 border-b border-[#1e1e1e]">
          <div>
            <p className="font-mono text-[9px] text-[#444444] uppercase mb-0.5">Education</p>
            <p className="text-[#888888] text-sm">1 entry found</p>
          </div>
          <button
            aria-label="Expand education"
            className="text-[#444444] hover:text-[#888888] transition-colors p-1"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Skills */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-mono text-[9px] text-[#444444] uppercase mb-0.5">Skills</p>
            <p className="text-[#888888] text-sm">12 items found</p>
          </div>
          <button
            aria-label="Expand skills"
            className="text-[#444444] hover:text-[#888888] transition-colors p-1"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOnboardingStep('upload')}
          className="flex items-center gap-2 font-mono text-[11px] text-[#444444] hover:text-[#888888] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          id="extraction-next-btn"
          onClick={() => setOnboardingStep('template')}
          className="flex items-center gap-2.5 bg-[#00e5a0] hover:bg-[#00c98e] text-black px-6 py-3 rounded-sm font-bold text-sm transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,160,0.2)]"
        >
          Looks good → Choose template
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
