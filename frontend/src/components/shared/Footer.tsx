export function Footer() {
  return (
    <footer className="w-full border-t border-[#111] bg-[#080808] py-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 border border-[#222] rounded-sm flex items-center justify-center">
            <span className="font-mono text-[8px] text-[#333] font-bold">OR</span>
          </div>
          <span className="font-semibold text-[13px] tracking-tight text-[#333]">OpenResume AI</span>
        </div>
        <div className="flex gap-7 font-mono text-[10px] uppercase tracking-widest text-[#2a2a2a]">
          {[
            { label: 'Docs',    href: '#' },
            { label: 'GitHub',  href: '#' },
            { label: 'Twitter', href: '#' },
            { label: 'Status',  href: '#' },
          ].map((l) => (
            <a key={l.label} className="hover:text-[#6b6b6b] transition-colors" href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="text-[10px] font-mono text-[#222]">
          © 2026 OpenResume AI — Open Source
        </div>
      </div>
    </footer>
  );
}
