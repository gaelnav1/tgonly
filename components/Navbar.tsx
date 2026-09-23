import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-syne font-extrabold text-lg sm:text-xl no-underline text-[#f0eff8] flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#2AABEE] shadow-[0_0_10px_#2AABEE]" />
          TG<span className="text-[#2AABEE]">Only</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 ml-auto">
          <Link href="/buscar" className="text-[#8888aa] text-sm font-medium hover:text-[#f0eff8] transition-colors">Buscar</Link>
          <Link href="/grupos" className="text-[#8888aa] text-sm font-medium hover:text-[#f0eff8] transition-colors">Explorar</Link>
          <Link href="/agregar" className="bg-[#2AABEE] text-black font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#1a8fd1] transition-colors">Agregar grupo</Link>
          <ThemeToggle />
        </div>

        <div className="flex md:hidden items-center gap-2 ml-auto">
          <Link href="/buscar" aria-label="Buscar" className="w-9 h-9 rounded-lg border border-white/[0.10] flex items-center justify-center text-[#f0eff8] hover:border-[#2AABEE]/40 transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </Link>
          <Link href="/grupos" className="text-[#8888aa] text-sm font-medium px-2 py-2">Explorar</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
