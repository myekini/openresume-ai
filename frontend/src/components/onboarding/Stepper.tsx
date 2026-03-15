'use client';

import { Check } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { motion } from 'framer-motion';

type Step = 'upload' | 'extraction' | 'template' | 'alignment';

const STEPS: { id: Step; label: string; num: string }[] = [
  { id: 'upload',     label: 'Upload',   num: '01' },
  { id: 'extraction', label: 'Review',   num: '02' },
  { id: 'template',   label: 'Template', num: '03' },
  { id: 'alignment',  label: 'Target',   num: '04' },
];

export function OnboardingStepper() {
  const { onboardingStep } = useResumeStore();
  const currentIdx = STEPS.findIndex((s) => s.id === onboardingStep);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isDone   = idx  < currentIdx;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step node */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="relative flex items-center justify-center"
                animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* Outer ring for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[#00e5a0]/30"
                    style={{ width: 28, height: 28, margin: -4 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  />
                )}

                <div
                  className={[
                    'w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300',
                    isActive
                      ? 'bg-[#00e5a0] border-[#00e5a0] shadow-[0_0_12px_rgba(0,229,160,0.4)]'
                      : isDone
                      ? 'bg-[#0d2620] border-[#00e5a0]/30'
                      : 'bg-[#0f0f0f] border-[#1c1c1c]',
                  ].join(' ')}
                >
                  {isDone ? (
                    <Check className="w-2.5 h-2.5 text-[#00e5a0]" strokeWidth={3} />
                  ) : (
                    <span
                      className={[
                        'font-mono text-[8px] font-bold',
                        isActive ? 'text-black' : 'text-[#333]',
                      ].join(' ')}
                    >
                      {step.num}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Label */}
              <span
                className={[
                  'font-mono text-[9px] uppercase tracking-widest whitespace-nowrap transition-colors duration-300',
                  isActive ? 'text-[#e8e8e8]' : isDone ? 'text-[#333]' : 'text-[#222]',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div className="relative h-px w-12 mx-3 bg-[#141414] mb-5 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-[#00e5a0]/30"
                  initial={{ width: '0%' }}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
