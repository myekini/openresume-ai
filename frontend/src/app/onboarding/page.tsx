'use client';

import Link from 'next/link';
import { useResumeStore } from '@/store/useResumeStore';
import { OnboardingStepper } from '@/components/onboarding/Stepper';
import { UploadStep } from '@/components/onboarding/UploadStep';
import { ExtractionPreview } from '@/components/onboarding/ExtractionPreview';
import { TemplateStep } from '@/components/onboarding/TemplateStep';
import { AlignmentStep } from '@/components/onboarding/AlignmentStep';

const STEP_TITLES: Record<string, { heading: string; sub: string }> = {
  upload: {
    heading: 'Drop your resume',
    sub: "We'll extract your content and help you tailor it for the role.",
  },
  extraction: {
    heading: 'Confirm your content',
    sub: 'Review what we extracted. Correct anything before moving on.',
  },
  template: {
    heading: 'Choose a template',
    sub: 'All templates are ATS-parseable and professionally typeset.',
  },
  alignment: {
    heading: 'What job are you applying for?',
    sub: "Paste the job description and we'll target the AI.",
  },
};

export default function OnboardingPage() {
  const { onboardingStep } = useResumeStore();
  const meta = STEP_TITLES[onboardingStep];

  return (
    <div className="min-h-screen bg-[#080808] text-[#e8e8e8] flex flex-col gradient-noise">
      {/* Minimal header */}
      <header className="h-12 border-b border-[#141414] flex items-center justify-between px-6 lg:px-12 shrink-0 glass-panel">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-5 h-5 border border-[#222] flex items-center justify-center rounded-sm group-hover:border-[#333] transition-colors">
            <span className="font-mono text-[8px] text-[#333] font-bold">OR</span>
          </div>
          <span className="font-semibold text-[13px] text-[#e8e8e8]">OpenResume</span>
        </Link>
        <Link
          href="/canvas"
          className="text-label hover:text-[#4a4a4a] transition-colors"
        >
          Skip to canvas →
        </Link>
      </header>

      {/* Main content — aligned above center for flow focus, not floating-in-space */}
      <main className="flex-grow flex flex-col items-center pt-[13vh] px-6 pb-16">
        {/* Stepper */}
        <div className="mb-16">
          <OnboardingStepper />
        </div>

        {/* Step heading — large, light weight */}
        <div className="mb-10 text-center max-w-sm">
          <h1
            className="text-gradient-white text-3xl mb-3 tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
          >
            {meta.heading}
          </h1>
          <p className="text-[14px] text-[#4a4a4a] leading-relaxed">{meta.sub}</p>
        </div>

        {/* Step content */}
        <div className="w-full flex justify-center">
          {onboardingStep === 'upload'     && <UploadStep />}
          {onboardingStep === 'extraction' && <ExtractionPreview />}
          {onboardingStep === 'template'   && <TemplateStep />}
          {onboardingStep === 'alignment'  && <AlignmentStep />}
        </div>
      </main>

      {/* Subtle footer */}
      <div className="text-center pb-8">
        <p className="text-label">
          ⚡ No account required · Data stays in your browser
        </p>
      </div>
    </div>
  );
}
