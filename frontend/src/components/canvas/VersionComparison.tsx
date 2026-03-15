import { Wand2, ChevronDown, ArrowLeft, GitMerge, Lightbulb, Edit2, History, Settings } from 'lucide-react';
import Link from 'next/link';

export function VersionComparison() {
  return (
    <div className="flex flex-col h-screen bg-background text-text-1 selection:bg-accent selection:text-black">
      {/* TopNavBar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border/15 bg-surface-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-sm flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-mono text-xs tracking-widest uppercase font-bold text-accent">OpenResume AI</span>
          </div>
          <div className="h-4 w-px bg-border/30"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface rounded-sm border border-border/20">
            <span className="font-mono text-[10px] text-text-3 uppercase">Project</span>
            <span className="text-sm font-medium">Resume Title</span>
            <ChevronDown className="w-4 h-4 text-text-3" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-text-3">v1.0.4</span>
          <button className="px-4 py-2 bg-surface-2 text-text-1 text-xs font-bold uppercase tracking-wider rounded-sm border border-border/20 hover:brightness-110 transition-colors">
            Export PDF
          </button>
          <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#1e1e1e] flex items-center justify-center">
            <span className="font-mono text-[10px] text-[#888888]">AR</span>
          </div>
        </div>
      </nav>

      {/* Version Control Bar */}
      <header className="flex items-center justify-between px-8 py-6 bg-surface border-b border-border/15">
        <div>
          <h1 className="font-display text-4xl italic text-text-1">Comparing Versions</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-2 mt-1">Reviewing architectural deltas between snapshots</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/canvas" className="flex items-center gap-2 px-5 py-2.5 bg-surface-2 border border-border/30 rounded-sm hover:border-accent/50 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:text-accent transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Canvas</span>
          </Link>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-accent to-accent/80 text-black rounded-sm shadow-[0_0_15px_rgba(0,229,160,0.2)] hover:shadow-[0_0_25px_rgba(0,229,160,0.3)] transition-all">
            <GitMerge className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Merge Changes</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Version A: Master */}
        <section className="flex-1 overflow-y-auto bg-surface-2 p-12 border-r border-border/15 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-12 opacity-80">
            <div className="flex justify-between items-end border-b border-border/10 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 bg-surface text-text-1 rounded-sm border border-border/20">Base: Master</span>
              <span className="font-mono text-[10px] text-text-3">Last synced 2h ago</span>
            </div>
            
            {/* Resume Header */}
            <header className="space-y-4">
              <h2 className="font-display text-5xl">Alex Rivera</h2>
              <div className="flex gap-4 font-mono text-[11px] text-text-2 uppercase tracking-tight">
                <span>San Francisco, CA</span>
                <span className="text-accent/50">/</span>
                <span>Product Manager</span>
                <span className="text-accent/50">/</span>
                <span>arivera.pm</span>
              </div>
            </header>

            {/* Professional Summary */}
            <div className="space-y-4">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Summary</h3>
              <p className="text-text-2 leading-relaxed font-light text-lg">
                Product Manager with 6+ years of experience in fintech and B2B SaaS. Focused on building scalable payment infrastructure and developer-first tools.
              </p>
            </div>

            {/* Experience Items */}
            <div className="space-y-6">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Experience</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xl font-medium">Stripe</h4>
                  <span className="font-mono text-xs text-text-2 text-text-3">2021 — PRESENT</span>
                </div>
                <p className="font-mono text-xs text-accent/80 uppercase tracking-wider">Senior Product Manager</p>
                <ul className="space-y-4 mt-4 text-text-2 list-none">
                  <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-1 before:h-1 before:bg-text-3">
                    Led the development of global payout systems for Connect, processing $10B+ annually across 40+ countries.
                  </li>
                  <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-1 before:h-1 before:bg-text-3 bg-[#ffb4ab]/10 border-l-2 border-[#ffb4ab] pl-4 line-through italic">
                    Managed a cross-functional team of 12 engineers and 3 designers to launch the new dashboard interface.
                  </li>
                  <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-1 before:h-1 before:bg-text-3">
                    Optimized API latency by 15% through strategic infrastructure redesign.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Version B: Current Enhancement */}
        <section className="flex-1 overflow-y-auto bg-background p-12 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="flex justify-between items-end border-b border-accent/20 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 bg-accent text-black font-bold rounded-sm">Current: Stripe PM v2</span>
                <Wand2 className="w-3 h-3 text-accent fill-accent" />
              </div>
              <span className="font-mono text-[10px] text-accent">AI Enhanced Content</span>
            </div>

            {/* Resume Header */}
            <header className="space-y-4">
              <h2 className="font-display text-5xl">Alex Rivera</h2>
              <div className="flex gap-4 font-mono text-[11px] text-text-2 uppercase tracking-tight">
                <span>San Francisco, CA</span>
                <span className="text-accent/50">/</span>
                <span>Senior Product Manager</span>
                <span className="text-accent/50">/</span>
                <span>arivera.pm</span>
              </div>
            </header>

            {/* Professional Summary */}
            <div className="space-y-4">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Summary</h3>
              <p className="text-text-2 leading-relaxed font-light text-lg">
                <span className="bg-accent/10 border-l-2 border-accent pl-2 italic">Architect of high-scale financial ecosystems</span> with 6+ years of experience. Expert in building developer-centric payment infrastructure that powers the global internet economy.
              </p>
            </div>

            {/* Experience Items */}
            <div className="space-y-6">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Experience</h3>
              <div className="space-y-2 p-6 bg-surface rounded-sm border-l-2 border-accent/30 shadow-card">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xl font-medium">Stripe</h4>
                  <span className="font-mono text-xs text-text-3">2021 — PRESENT</span>
                </div>
                <p className="font-mono text-xs text-accent/80 uppercase tracking-wider">Senior Product Manager</p>
                <ul className="space-y-4 mt-4 text-text-2 list-none">
                  <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-1 before:h-1 before:bg-accent">
                    Led the development of global payout systems for Connect, processing <span className="text-accent font-medium font-bold">$15B+</span> annually across 40+ countries.
                  </li>
                  <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-1 before:h-1 before:bg-accent bg-accent/10 border-l-2 border-accent pl-2 italic">
                    Directed a high-velocity squad of 15+ to pioneer the &quot;Adaptive Payouts&quot; framework, increasing transaction success by 2.4%.
                  </li>
                  <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-3 before:w-1 before:h-1 before:bg-accent">
                    Optimized API latency by 15% through strategic infrastructure redesign.
                  </li>
                </ul>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="p-6 bg-mono/5 border border-mono/20 rounded-sm space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-mono" />
                <span className="font-mono text-[10px] uppercase font-bold text-mono">AI Recommendation</span>
              </div>
              <p className="text-sm text-text-2 leading-relaxed">
                Modified bullet point 2 uses more impactful action verbs and includes quantifiable metrics (2.4%), increasing ATS score by <span className="text-mono font-mono font-bold">14%</span>.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Meta */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 space-y-2 pointer-events-none z-50">
        <div className="px-3 py-1 bg-surface-2 border border-border/30 text-[10px] font-mono rounded-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
          <span>2 ADDITIONS</span>
        </div>
        <div className="px-3 py-1 bg-surface-2 border border-border/30 text-[10px] font-mono rounded-sm flex items-center gap-2 opacity-80">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></div>
          <span>1 REMOVAL</span>
        </div>
      </div>

      {/* Floating ToolBar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111111]/90 backdrop-blur-md border border-[#1e1e1e] rounded-full px-6 py-3 flex items-center gap-8 shadow-[0_8px_32px_rgba(0,0,0,0.7)] z-50">
        <div className="flex items-center gap-6">
          <button className="flex flex-col items-center gap-1 group text-text-3 hover:text-text-1 transition-all">
            <Edit2 className="w-4 h-4 group-hover:text-accent transition-colors" />
            <span className="font-mono text-[8px] uppercase tracking-tighter">Edit</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-accent">
            <History className="w-4 h-4 fill-accent/20" />
            <span className="font-mono text-[8px] uppercase tracking-tighter">Diff</span>
          </button>
          <button className="flex flex-col items-center gap-1 group text-text-3 hover:text-text-1 transition-all">
            <Wand2 className="w-4 h-4 group-hover:text-mono transition-colors" />
            <span className="font-mono text-[8px] uppercase tracking-tighter">Refine</span>
          </button>
          <button className="flex flex-col items-center gap-1 group text-text-3 hover:text-text-1 transition-all">
            <Settings className="w-4 h-4 group-hover:text-text-1 transition-colors" />
            <span className="font-mono text-[8px] uppercase tracking-tighter">Config</span>
          </button>
        </div>
        <div className="h-8 w-px bg-border/20"></div>
        <button className="px-5 py-2 bg-[#00e5a0] text-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_16px_rgba(0,229,160,0.2)] hover:brightness-110 transition-all">
          Accept All
        </button>
      </div>

      {/* Background Decorators */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-mono/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}
