'use client';

import { useRef, useState } from 'react';
import { Upload, ArrowRight } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { Button } from '@/components/ui/button';

export function UploadStep() {
  const { setOnboardingStep } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zoneRef      = useRef<HTMLDivElement>(null);
  const [fileName, setFileName]     = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => { if (file) setFileName(file.name); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = zoneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--glow-x', `${e.clientX - rect.left - 140}px`);
    el.style.setProperty('--glow-y', `${e.clientY - rect.top  - 140}px`);
  };

  return (
    <div className="w-full max-w-[460px] space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        className="sr-only"
        aria-label="Upload resume file"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />

      {/* Drop zone */}
      <div
        id="upload-dropzone"
        ref={zoneRef}
        className={[
          'cursor-glow relative dot-grid border transition-all cursor-pointer rounded-sm overflow-hidden',
          isDragOver
            ? 'border-[#00e5a0] shadow-[0_0_40px_rgba(0,229,160,0.1)]'
            : 'border-[#1c1c1c] hover:border-[#2a2a2a]',
        ].join(' ')}
        style={{ background: '#0a0a0a' }}
        onClick={() => fileInputRef.current?.click()}
        onMouseMove={handleMouseMove}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload resume file"
      >
        <div className="relative z-10 flex flex-col items-center justify-center py-14 px-8 text-center gap-5">
          <div className="w-14 h-14 rounded-full border border-[#1c1c1c] bg-[#0f0f0f] flex items-center justify-center transition-all">
            <Upload className="w-5 h-5 text-[#333]" />
          </div>
          <div>
            {fileName ? (
              <>
                <p className="text-[#e8e8e8] font-medium mb-1.5 text-[14px]">{fileName}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#333]">File ready</p>
              </>
            ) : (
              <>
                <p className="text-[#e8e8e8] font-medium mb-1.5 text-[14px]">Drop your resume</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#333]">DOCX or PDF · max 10 MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#111]" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#333]">or</span>
        <div className="flex-1 h-px bg-[#111]" />
      </div>

      <Button
        id="upload-browse-btn"
        variant="secondary"
        size="md"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        Browse files
      </Button>

      {/* Nav */}
      <div className="pt-3 flex items-center justify-between">
        <Button variant="ghost" size="sm">
          Skip to manual →
        </Button>
        <Button
          id="upload-next-btn"
          variant="primary"
          size="md"
          sheen
          onClick={() => setOnboardingStep('extraction')}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-widest text-[#333] pt-1">
        No account required to start
      </p>
    </div>
  );
}
