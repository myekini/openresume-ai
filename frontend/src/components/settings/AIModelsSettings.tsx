'use client';

import { BrainCircuit, Sparkles, Settings, Terminal, ChevronsUpDown, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export function AIModelsSettings() {
  return (
    <section className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-surface-2">
      <div className="max-w-3xl space-y-16">
        
        {/* AI Models Section */}
        <div className="space-y-10">
          <header className="space-y-2">
            <h2 className="font-display text-3xl text-text-1">Cloud Models</h2>
            <p className="text-text-2 text-sm">Connect a cloud API key to use Claude or GPT-4o for resume edits.</p>
          </header>

          {/* Bento Grid for Cloud Providers */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Anthropic Card */}
            <div className="bg-background p-6 flex flex-col gap-6 group hover:bg-surface transition-colors border-l-2 border-border focus-within:border-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface flex items-center justify-center rounded-sm">
                    <BrainCircuit className="w-5 h-5 text-text-1" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-1">Anthropic</h3>
                    <span className="font-mono text-[10px] text-mono">Claude 3.5 Sonnet</span>
                  </div>
                </div>
                {/* Active Indicator */}
                <span className="w-2 h-2 rounded-full bg-[#16A34A] shadow-[0_0_8px_rgba(22,163,74,0.4)]"></span>
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-text-3">API Endpoint / Key</label>
                <input 
                  className="w-full bg-surface-2 border-0 border-b border-border/50 focus:border-accent focus:ring-0 px-0 py-2 text-xs font-mono text-text-1 outline-none transition-all placeholder:text-text-3" 
                  type="password" 
                  defaultValue="sk-ant-api03-********************"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 bg-surface-2 text-text-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 border border-border/50 transition-colors">Test</button>
                <button className="p-2 bg-surface-2 text-text-1 border border-border/50 rounded-sm hover:text-accent transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* OpenAI Card */}
            <div className="bg-background p-6 flex flex-col gap-6 group hover:bg-surface transition-colors border-l border-border/50 focus-within:border-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface flex items-center justify-center rounded-sm">
                    <Sparkles className="w-5 h-5 text-text-1" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-1">OpenAI</h3>
                    <span className="font-mono text-[10px] text-text-3">GPT-4o</span>
                  </div>
                </div>
                {/* Inactive Indicator */}
                <span className="w-2 h-2 rounded-full bg-border"></span>
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-text-3">API Key</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-2 border-0 border-b border-border/50 focus:border-accent focus:ring-0 px-0 py-2 text-xs font-mono text-text-1 outline-none transition-all placeholder:text-text-3" 
                    placeholder="sk-..." 
                    type="password"
                  />
                  <span className="absolute right-0 top-2 font-mono text-[10px] text-[#ef4444]">Missing</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 bg-surface-2 text-text-1/50 py-2 text-[11px] font-bold uppercase tracking-widest rounded-sm cursor-not-allowed border border-border/50">Test</button>
                <button className="p-2 bg-surface-2 text-text-1 border border-border/50 rounded-sm hover:text-accent transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Local Model Section */}
        <div className="space-y-10">
          <header className="space-y-2">
            <h2 className="font-display text-3xl text-text-1">LOCAL (Ollama)</h2>
            <p className="text-text-2 text-sm">Run models entirely on your machine. Your resume never leaves your device.</p>
          </header>
          
          <div className="bg-background p-8 border-l-4 border-accent relative overflow-hidden rounded-sm">
            <div className="absolute inset-0 bg-accent/5 pointer-events-none"></div>
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 flex items-center justify-center rounded-sm text-accent border border-accent/20">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-1">Ollama Instance</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                    <p className="font-mono text-[10px] text-[#16A34A]">CONNECTED: http://localhost:11434</p>
                  </div>
                </div>
              </div>
              <button className="bg-surface px-4 py-2 text-[10px] uppercase tracking-widest font-bold border border-border/50 hover:border-accent hover:text-accent transition-all rounded-sm text-text-1">Refresh Nodes</button>
            </div>
            
            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <label className="font-mono text-[10px] uppercase tracking-widest text-text-3">Active Model</label>
                <div className="relative group">
                  <select className="w-full appearance-none bg-surface-2 border border-border/50 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent text-text-1 cursor-pointer">
                    <option>llama3:8b-instruct-q4_K_M</option>
                    <option>mistral:latest</option>
                    <option>phi3:mini</option>
                  </select>
                  <ChevronsUpDown className="absolute right-3 top-3.5 w-4 h-4 text-text-3 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="font-mono text-[10px] uppercase tracking-widest text-text-3">Context Window</label>
                <div className="flex items-center gap-4 pt-2">
                  <input className="flex-1 h-1 bg-surface-2 accent-accent appearance-none cursor-pointer rounded-full" type="range" min="2048" max="128000" defaultValue="8192" />
                  <span className="font-mono text-xs text-text-1 w-12 text-right">8192</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Analytics / Status (Mini Bento) */}
        <div className="grid grid-cols-3 gap-4 h-32">
          
          <div className="bg-background p-4 flex flex-col justify-between border-b-2 border-border/50 hover:border-accent/50 transition-colors rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-3">Tokens/Min</span>
            <div className="flex items-end justify-between">
              <span className="font-display text-3xl text-text-1">4.2k</span>
              <TrendingUp className="w-5 h-5 text-mono mb-1" />
            </div>
          </div>
          
          <div className="bg-background p-4 flex flex-col justify-between border-b-2 border-border/50 hover:border-[#16A34A]/50 transition-colors rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-3">Privacy Score</span>
            <div className="flex items-end justify-between">
              <span className="font-display text-3xl text-text-1">98%</span>
              <ShieldCheck className="w-5 h-5 text-[#16A34A] mb-1" />
            </div>
          </div>
          
          <div className="bg-background p-4 flex flex-col justify-between border-b-2 border-border/50 hover:border-accent transition-colors rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-3">Latency</span>
            <div className="flex items-end justify-between">
              <span className="font-display text-3xl text-text-1">24<span className="text-sm ml-1 text-text-2">ms</span></span>
              <Activity className="w-5 h-5 text-accent mb-1" />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
