"use client";

import { Check, Lock, Cpu, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedCanvasPreview } from './AnimatedCanvasPreview';

const fadeUpVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
};

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.01)`;
    el.style.boxShadow = `inset 0 1px 0 0 rgba(255,255,255,0.07), 0 0 0 1px #1c1c1c, ${x * 2}px ${y * 2}px 32px rgba(0,0,0,0.6)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
  };

  return (
    <div
      ref={ref}
      className={`tilt-card premium-card rounded-sm p-8 flex flex-col gap-6 ${className ?? ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export function Features() {
  return (
    <div id="features">

      {/* ── Section 1: Canvas ── wide breathing room */}
      <motion.section
        className="pt-32 pb-24 border-t border-[#111]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        <motion.div variants={fadeUpVariants} className="mb-14">
          {/* Label demoted — small monochrome */}
          <span className="text-label">The Canvas</span>
          {/* H2 stands alone — large, light weight, gradient */}
          <h2
            className="mt-4 text-gradient-white text-5xl lg:text-6xl leading-[1.06] tracking-[-0.03em] max-w-2xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
          >
            Chat on the left.<br />Resume on the right.
          </h2>
        </motion.div>

        <motion.div variants={fadeUpVariants}>
          <AnimatedCanvasPreview />
        </motion.div>
      </motion.section>

      {/* ── Section 2: Inline Control — no eyebrow, h2 alone ── */}
      <motion.section
        className="py-24 border-t border-[#111]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUpVariants}>
            {/* No label — heading stands alone */}
            <h2
              className="text-gradient-white text-5xl lg:text-6xl leading-[1.06] tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
            >
              See every<br />suggestion. Accept<br />
              <span className="italic" style={{ color: '#e8e8e8' }}>on your terms.</span>
            </h2>
            <p className="mt-6 text-[#4a4a4a] leading-[1.75] max-w-md text-[15px]">
              No black box. Before editing anything, the AI explains its reasoning.{' '}
              Accept with <kbd className="font-mono text-[#a3e635] text-xs bg-[#0f0f0f] border border-[#1c1c1c] px-1.5 py-0.5 rounded">Y</kbd>, revert with{' '}
              <kbd className="font-mono text-[#a3e635] text-xs bg-[#0f0f0f] border border-[#1c1c1c] px-1.5 py-0.5 rounded">N</kbd>.{' '}
              Tab jumps to the next pending change.
            </p>
          </motion.div>

          {/* Edit card demo */}
          <motion.div variants={fadeUpVariants} className="bg-white rounded-xl shadow-2xl p-6 relative">
            <p className="text-[#aaa] text-sm mb-4 leading-relaxed">
              Partnered with data engineering to scale the internal reporting tool for risk assessment across multiple payment rails.
            </p>
            <div className="border-l-4 border-[#00e5a0] surface-float rounded-sm p-4 slide-up">
              <div className="mb-3">
                <span className="text-label text-[#00e5a0]">✦ AI Suggested</span>
                <p className="text-sm text-[#e8e8e8] mt-2 italic leading-snug">
                  &ldquo;Partnered with data engineering to scale internal risk reporting by{' '}
                  <span className="text-[#00e5a0] not-italic font-semibold">34%</span>, enabling real-time detection for 2M+ daily transactions.&rdquo;
                </p>
              </div>
              <div className="border-t border-[#1c1c1c] pt-3 mb-3">
                <p className="text-label mb-1">Reason</p>
                <p className="text-xs text-[#4a4a4a]">JD requires quantified impact for infrastructure roles.</p>
              </div>
              <p className="text-xs font-mono text-[#c8980a] mb-3">
                ⚠ Verify &ldquo;34%&rdquo; — replace with your actual figure from Jira/Tableau.
              </p>
              <div className="flex gap-2">
                <button
                  id="feature-accept-btn"
                  className="flex items-center gap-1.5 bg-[#00e5a0] text-black text-xs font-bold px-4 py-2 rounded-sm hover:bg-[#00c98e] transition-colors"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Accept
                </button>
                <button className="text-[#e8e8e8] text-xs font-medium px-4 py-2 rounded-sm surface-panel border border-[#1c1c1c] hover:bg-[#161616] transition-colors">
                  Revert ↩
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Section 3+4: Privacy + LaTeX — short, punchy ── */}
      <motion.section
        className="py-20 border-t border-[#111]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <TiltCard>
            <div className="flex items-end gap-0 select-none">
              <span className="font-serif text-6xl text-[#e8e8e8] opacity-20 leading-none">T</span>
              <sub className="lowercase font-serif text-4xl text-[#e8e8e8] opacity-20 mb-1">e</sub>
              <span className="font-serif text-6xl text-[#e8e8e8] opacity-20 leading-none">X</span>
            </div>
            <div>
              <h3
                className="text-[#e8e8e8] text-2xl tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
              >
                Professional typesetting, always.
              </h3>
              <p className="text-[#4a4a4a] text-[14px] mt-3 leading-[1.7]">
                LaTeX rendering by default. ATS-parseable structure, pixel-perfect margins, beautiful output.
              </p>
            </div>
          </TiltCard>

          <TiltCard>
            <Lock className="text-[#333] w-7 h-7" />
            <div>
              <h3
                className="text-[#e8e8e8] text-2xl tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
              >
                Your data never leaves.
              </h3>
              <p className="text-[#4a4a4a] text-[14px] mt-3 leading-[1.7]">
                Bring your API key, or run fully local with Ollama. Private by design.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { name: 'Claude', sub: 'Anthropic', icon: <Cpu   className="w-4 h-4" /> },
                { name: 'GPT-4o', sub: 'OpenAI',   icon: <Sparkles className="w-4 h-4" /> },
                { name: 'Ollama', sub: 'Local',     icon: <Lock  className="w-4 h-4" /> },
              ].map((m) => (
                <div key={m.name} className="bg-[#111] border border-[#1c1c1c] rounded-sm p-3 flex flex-col items-center gap-1.5">
                  <div className="text-[#333]">{m.icon}</div>
                  <span className="font-mono text-[9px] uppercase text-[#6b6b6b]">{m.name}</span>
                  <span className="font-mono text-[8px] text-[#2a2a2a]">{m.sub}</span>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
      </motion.section>

      {/* ── Section 5: Pricing — generous top space ── */}
      <motion.section
        id="pricing"
        className="pt-32 pb-24 border-t border-[#111]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        <motion.div variants={fadeUpVariants} className="mb-16 max-w-xl">
          {/* No eyebrow label — h2 stands alone */}
          <h2
            className="text-gradient-white text-5xl lg:text-6xl leading-[1.06] tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
          >
            Fair pricing.<br /> No surprises.
          </h2>
          <p className="mt-5 text-[#4a4a4a] text-[15px] leading-[1.7]">
            PDF export is always free. No watermarks. Never.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Free */}
          <TiltCard>
            <div>
              <div className="text-label mb-3">Free</div>
              <div className="text-4xl font-light text-[#e8e8e8] tracking-tight">
                $0 <span className="text-sm font-normal text-[#333]">/mo</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2.5 text-[13px] text-[#4a4a4a]">
              {['Self-hosted', 'Export PDF (always)', 'Ollama support', '5 resume versions'].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#333] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="mt-auto block text-center border border-[#1c1c1c] hover:border-[#2a2a2a] py-2.5 text-[13px] font-medium text-[#6b6b6b] hover:text-[#e8e8e8] rounded-sm hover:bg-[#111] transition-all"
            >
              Get Started
            </Link>
          </TiltCard>

          {/* Pro — the only card with accent glow */}
          <TiltCard className="border-[#00e5a0]/20 shadow-[0_0_40px_rgba(0,229,160,0.06)]">
            <div className="absolute top-0 right-5 -translate-y-1/2 bg-[#e8e8e8] text-[#080808] font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
              Popular
            </div>
            <div>
              <div className="text-label text-[#00e5a0]/70 mb-3">Pro</div>
              <div className="text-4xl font-light text-[#e8e8e8] tracking-tight">
                $12 <span className="text-sm font-normal text-[#333]">/mo</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2.5 text-[13px] text-[#4a4a4a]">
              {['Cloud-hosted GPT-4o', 'Export PDF (always)', 'Unlimited versions', 'Version compare', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#00e5a0]/60 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="mt-auto block text-center bg-[#00e5a0] hover:bg-[#00cf93] py-2.5 text-[13px] font-bold text-black rounded-sm transition-all hover:scale-[1.01] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full skew-x-[-30deg] group-hover:animate-[sheen_0.9s_ease-in-out]" />
              <span className="relative">Start Free Trial</span>
            </Link>
          </TiltCard>

          {/* Team */}
          <TiltCard>
            <div>
              <div className="text-label mb-3">Team</div>
              <div className="text-4xl font-light text-[#e8e8e8] tracking-tight">
                $29 <span className="text-sm font-normal text-[#333]">/mo</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2.5 text-[13px] text-[#4a4a4a]">
              {['Everything in Pro', 'Up to 10 seats', 'Admin dashboard', 'SSO / SAML', 'Dedicated support'].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[#333] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="mt-auto block text-center border border-[#1c1c1c] hover:border-[#2a2a2a] py-2.5 text-[13px] font-medium text-[#6b6b6b] hover:text-[#e8e8e8] rounded-sm hover:bg-[#111] transition-all"
            >
              Contact Sales
            </Link>
          </TiltCard>
        </div>
      </motion.section>
    </div>
  );
}
