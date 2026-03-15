"use client";

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { HeroMockup } from './HeroMockup';

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
};

export function Hero() {
  const mockupRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX   = useSpring(useTransform(mouseY, [-0.5, 0.5], [4,  -4]),  { stiffness: 180, damping: 30 });
  const rotateY   = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]),   { stiffness: 180, damping: 30 });
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]),  { stiffness: 140, damping: 25 });
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-5, 5]),  { stiffness: 140, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mockupRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <section className="grid lg:grid-cols-[50%_50%] gap-16 py-28 lg:py-36 items-center">
      {/* ── Left column ── */}
      <motion.div
        className="space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#333]" />
          <span className="text-label">Open Source · Free to Export</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="space-y-1">
          <span
            className="block text-gradient-white leading-[1.04] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(50px, 5.5vw, 74px)', fontWeight: 300 }}
          >
            AI edits.
          </span>
          <span
            className="block leading-[1.04] tracking-[-0.04em] text-[#00e5a0]"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(50px, 5.5vw, 74px)', fontWeight: 300, fontStyle: 'italic' }}
          >
            You decide.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={itemVariants}
          className="text-[15px] text-[#4a4a4a] max-w-[400px] leading-[1.75]"
        >
          Paste a job description. Upload your resume. Watch targeted edits stream inline — approve every one.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3 items-center">
          <Link
            href="/onboarding"
            id="hero-cta-start"
            className="relative overflow-hidden inline-flex items-center gap-2.5 bg-[#00e5a0] hover:bg-[#00cf93] text-black px-7 py-3.5 font-bold text-[14px] rounded-sm group transition-all duration-200 hover:scale-[1.02] shadow-[0_0_32px_rgba(0,229,160,0.18)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full skew-x-[-30deg] group-hover:animate-[sheen_0.9s_ease-in-out]" />
            <span className="relative flex items-center gap-2.5">
              Start Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <button
            id="hero-cta-demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#1c1c1c] hover:border-[#2a2a2a] bg-transparent hover:bg-[#0f0f0f] transition-all duration-150 text-[#4a4a4a] hover:text-[#e8e8e8] font-medium text-[14px] rounded-sm"
          >
            <Play className="w-3.5 h-3.5" />
            Watch demo
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.div variants={itemVariants} className="pt-6 border-t border-[#111]">
          <p className="text-label flex items-center gap-5 flex-wrap">
            <span>Open Source</span>
            <span className="text-[#222]">·</span>
            <span>Claude · GPT-4o · Ollama</span>
            <span className="text-[#222]">·</span>
            <span>Export Always Free</span>
          </p>
        </motion.div>
      </motion.div>

      {/* ── Right column — live animated mockup ── */}
      <motion.div
        ref={mockupRef}
        className="relative hidden lg:block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 160, damping: 28, delay: 0.4 }}
        style={{ perspective: '1200px' }}
      >
        {/* Far glow */}
        <div className="absolute -inset-12 bg-[#00e5a0] opacity-[0.035] blur-[90px] rounded-full pointer-events-none" />

        <motion.div
          style={{ rotateX, rotateY, x: translateX, y: translateY, transformStyle: 'preserve-3d' }}
        >
          <HeroMockup />
        </motion.div>
      </motion.div>
    </section>
  );
}
