'use client';

import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useResumeStore, Template } from '@/store/useResumeStore';

const TEMPLATES: { id: Template; name: string; desc: string; badge?: string }[] = [
  {
    id: 'clean',
    name: 'Clean',
    desc: 'Single col · Max ATS',
    badge: 'Popular',
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: '2-col header · Accent line',
  },
  {
    id: 'compact',
    name: 'Compact',
    desc: 'Dense, 1-page · Tight margins',
  },
];

function ResumePreview({ template }: { template: Template }) {
  return (
    <div className="w-full aspect-[3/4] bg-white rounded-sm overflow-hidden relative shadow-sm">
      {template === 'clean' && (
        <div className="p-4 space-y-2">
          <div className="h-3 bg-[#1a1a1a] rounded w-1/2 mx-auto" />
          <div className="h-px bg-[#e5e5e5]" />
          <div className="h-1.5 bg-[#e5e5e5] rounded w-full" />
          <div className="h-1.5 bg-[#e5e5e5] rounded w-4/5" />
          <div className="h-1.5 bg-[#e5e5e5] rounded w-3/4" />
          <div className="mt-2 h-2 bg-[#1a1a1a] rounded w-1/3" />
          <div className="h-1.5 bg-[#e5e5e5] rounded w-full" />
          <div className="h-1.5 bg-[#e5e5e5] rounded w-4/5" />
        </div>
      )}
      {template === 'modern' && (
        <div className="flex h-full">
          <div className="w-1/3 bg-[#1a1a1a] p-3 space-y-2">
            <div className="h-2 bg-white/20 rounded w-3/4" />
            <div className="h-1.5 bg-white/10 rounded w-full" />
            <div className="h-1.5 bg-white/10 rounded w-4/5" />
            <div className="mt-2 h-1.5 bg-[#00e5a0]/40 rounded w-full" />
            <div className="h-1.5 bg-white/10 rounded w-3/4" />
          </div>
          <div className="flex-1 p-3 space-y-2">
            <div className="h-2 bg-[#1a1a1a] rounded w-1/2" />
            <div className="h-px bg-[#e5e5e5]" />
            <div className="h-1.5 bg-[#e5e5e5] rounded w-full" />
            <div className="h-1.5 bg-[#e5e5e5] rounded w-4/5" />
          </div>
        </div>
      )}
      {template === 'compact' && (
        <div className="p-3 space-y-1.5">
          <div className="h-2.5 bg-[#1a1a1a] rounded w-1/3" />
          <div className="h-1 bg-[#e5e5e5] rounded w-full" />
          <div className="h-1 bg-[#e5e5e5] rounded w-full" />
          <div className="h-1 bg-[#e5e5e5] rounded w-4/5" />
          <div className="h-1 bg-[#e5e5e5] rounded w-full" />
          <div className="h-1 bg-[#e5e5e5] rounded w-3/4" />
          <div className="h-1.5 bg-[#1a1a1a] rounded w-1/4 mt-1" />
          <div className="h-1 bg-[#e5e5e5] rounded w-full" />
          <div className="h-1 bg-[#e5e5e5] rounded w-full" />
          <div className="h-1 bg-[#e5e5e5] rounded w-2/3" />
        </div>
      )}
    </div>
  );
}

export function TemplateStep() {
  const { selectedTemplate, setSelectedTemplate, setOnboardingStep } = useResumeStore();

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="grid grid-cols-3 gap-4">
        {TEMPLATES.map((t) => {
          const isSelected = selectedTemplate === t.id;
          return (
            <button
              key={t.id}
              id={`template-${t.id}`}
              onClick={() => setSelectedTemplate(t.id)}
              className={`relative flex flex-col gap-3 p-3 rounded-sm border-2 transition-all text-left ${
                isSelected
                  ? 'border-[#00e5a0] shadow-[0_0_20px_rgba(0,229,160,0.12)]'
                  : 'border-[#1e1e1e] hover:border-[#2a2a2a]'
              } bg-[#111111]`}
            >
              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#00e5a0] rounded-sm flex items-center justify-center z-10">
                  <Check className="w-3 h-3 text-black stroke-[3]" />
                </div>
              )}

              {/* Badge */}
              {t.badge && (
                <div className="absolute top-2 left-2 bg-[#a3e635] text-black font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm z-10">
                  {t.badge}
                </div>
              )}

              <ResumePreview template={t.id} />

              <div className="px-1">
                <p className={`font-medium text-sm ${isSelected ? 'text-[#00e5a0]' : 'text-[#f5f5f5]'}`}>
                  {t.name}
                </p>
                <p className="font-mono text-[9px] text-[#444444] mt-0.5">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOnboardingStep('extraction')}
          className="flex items-center gap-2 font-mono text-[11px] text-[#444444] hover:text-[#888888] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          id="template-next-btn"
          onClick={() => setOnboardingStep('alignment')}
          className="flex items-center gap-2.5 bg-[#00e5a0] hover:bg-[#00c98e] text-black px-6 py-3 rounded-sm font-bold text-sm transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,160,0.2)]"
        >
          Use {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
