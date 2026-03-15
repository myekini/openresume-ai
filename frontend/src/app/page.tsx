import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Link from "next/link";

export const metadata = {
  title: "OpenResume AI — AI edits. You decide.",
  description:
    "Paste a job description. Upload your resume. Watch targeted edits stream into a live canvas. You approve every change.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#e8e8e8] relative gradient-noise">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <Hero />
        <Features />

        {/* Final CTA — tall breathing room, no eyebrow, statement copy */}
        <section className="pt-40 pb-32 flex flex-col items-center text-center gap-10 border-t border-[#111]">
          <h2
            className="text-gradient-white text-5xl md:text-7xl max-w-3xl leading-[1.04] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}
          >
            Your next role starts<br />with a better resume.
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <Link
              href="/onboarding"
              id="cta-final-start"
              className="relative overflow-hidden bg-[#00e5a0] hover:bg-[#00cf93] text-black px-12 py-4 font-bold text-[15px] rounded-sm shadow-[0_0_32px_rgba(0,229,160,0.2)] hover:scale-[1.02] transition-all group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full skew-x-[-30deg] group-hover:animate-[sheen_0.9s_ease-in-out]" />
              <span className="relative">Start Free →</span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              id="cta-final-github"
              className="px-12 py-4 border border-[#1c1c1c] hover:border-[#2a2a2a] text-[#4a4a4a] hover:text-[#e8e8e8] font-medium text-[15px] rounded-sm hover:bg-[#0f0f0f] transition-all"
            >
              View GitHub ↗
            </a>
          </div>
          <p className="text-label">
            No account required · Data stays in your browser · Export always free
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
