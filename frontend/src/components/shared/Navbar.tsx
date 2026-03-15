import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full glass-panel"
      aria-label="Main navigation"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-[52px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 border border-[#1c1c1c] flex items-center justify-center rounded-sm group-hover:border-[#2a2a2a] transition-colors">
            <span className="font-mono text-[9px] text-[#333] font-bold">OR</span>
          </div>
          <span className="font-semibold tracking-tight text-[13px] text-[#6b6b6b] group-hover:text-[#e8e8e8] transition-colors">
            OpenResume
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#333]">
          <a href="#features" className="hover:text-[#e8e8e8] transition-colors duration-150">Features</a>
          <a href="#pricing"  className="hover:text-[#e8e8e8] transition-colors duration-150">Pricing</a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e8e8e8] transition-colors duration-150"
          >
            GitHub ↗
          </a>
        </div>

        {/* CTA */}
        <Link href="/onboarding" id="nav-cta-start" className="group">
          <Button variant="primary" size="sm" sheen className="group">
            Start Free
          </Button>
        </Link>
      </div>
    </nav>
  );
}
