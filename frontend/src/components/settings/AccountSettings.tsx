'use client';

import { Info, Fingerprint, Verified, Download, Trash2 } from 'lucide-react';

export function AccountSettings() {
  return (
    <section className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-surface-2">
      <div className="max-w-4xl space-y-16">
        {/* Header Section */}
        <header>
          <h1 className="font-display text-5xl mb-4 tracking-tight text-text-1">Account Settings</h1>
          <p className="text-text-2 max-w-xl leading-relaxed">
            Manage your storage, export your data, or delete your account.
          </p>
        </header>

        {/* Bento Layout for Settings */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Storage Used Section */}
          <section className="col-span-12 lg:col-span-8 bg-surface p-8 border-l-2 border-accent rounded-sm shadow-card">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-mono text-[10px] text-accent tracking-[0.2em] uppercase">System Monitor</span>
                <h2 className="font-display text-2xl mt-1 text-text-1">Storage Capacity</h2>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl text-mono">74%</span>
              </div>
            </div>
            
            <div className="relative h-2 w-full bg-surface-2 overflow-hidden mb-4 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-mono w-[74%]"></div>
            </div>
            
            <div className="flex justify-between font-mono text-[11px] text-text-3">
              <span>1.48 GB USED</span>
              <span>2.00 GB TOTAL</span>
            </div>
            
            <div className="mt-12 flex items-start gap-4 p-4 bg-surface-2 rounded-sm border border-border/50">
              <Info className="w-5 h-5 text-mono mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-1">Auto-Archiving Active</p>
                <p className="text-xs text-text-2 mt-1 leading-normal">Resume versions older than 180 days are automatically archived to save storage space.</p>
              </div>
            </div>
          </section>

          {/* Quick Info Chip */}
          <div className="col-span-12 lg:col-span-4 bg-background p-8 border border-border/30 flex flex-col justify-between rounded-sm">
            <div>
              <span className="font-mono text-[10px] text-text-3 tracking-[0.2em] uppercase">Identity</span>
              <h3 className="font-display text-xl mt-2 text-text-1">Active Node</h3>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center border border-border/20">
                  <Fingerprint className="w-5 h-5 text-text-2" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-text-3 uppercase">Member Since</p>
                  <p className="text-sm font-medium text-text-1">OCT 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface-2 flex items-center justify-center border border-border/20">
                  <Verified className="w-5 h-5 text-text-2" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-text-3 uppercase">Status</p>
                  <p className="text-sm font-medium text-[#16A34A]">Verified Pro</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export My Data Section */}
          <section className="col-span-12 lg:col-span-6 bg-surface p-8 rounded-sm shadow-card border border-border/20">
            <span className="font-mono text-[10px] text-text-3 tracking-[0.2em] uppercase">Portability</span>
            <h2 className="font-display text-2xl mt-1 mb-4 text-text-1">Export My Data</h2>
            <p className="text-sm text-text-2 mb-8 leading-relaxed">
              Download a JSON archive of all your resume versions, AI suggestions, and edit history.
            </p>
            <button className="w-full flex items-center justify-center gap-2 border border-border/30 py-3 text-sm font-semibold text-text-1 hover:bg-surface-2 transition-colors rounded-sm">
              <Download className="w-4 h-4" />
              Request Export
            </button>
          </section>

          {/* Danger Zone */}
          <section className="col-span-12 lg:col-span-6 border border-[#ef4444]/30 bg-[#ef4444]/5 p-8 rounded-sm">
            <span className="font-mono text-[10px] text-[#ef4444] tracking-[0.2em] uppercase">Irreversible Action</span>
            <h2 className="font-display text-2xl mt-1 mb-4 text-[#ef4444]">Danger Zone</h2>
            <p className="text-sm text-text-2 mb-8 leading-relaxed">
              Permanently deletes your account and all associated resume data. This cannot be undone.
            </p>
            <button className="w-full flex items-center justify-center gap-2 bg-[#ef4444] text-white py-3 text-sm font-semibold hover:brightness-110 transition-opacity rounded-sm shadow-lg shadow-[#ef4444]/10">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </section>

        </div>

        {/* System Footer Metadata */}
        <footer className="mt-20 pt-8 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8">
            <a className="font-mono text-[10px] text-text-3 hover:text-accent transition-colors tracking-widest uppercase" href="#">Privacy Policy</a>
            <a className="font-mono text-[10px] text-text-3 hover:text-accent transition-colors tracking-widest uppercase" href="#">Terms of Service</a>
          </div>
        </footer>
      </div>
    </section>
  );
}
