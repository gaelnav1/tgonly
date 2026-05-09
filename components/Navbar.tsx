import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-[60px] bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/[0.07]">
      <Link href="/" className="flex items-center gap-2 font-syne font-extrabold text-xl no-underline text-[#f0eff8]">
        <span className="w-2 h-2 rounded-full bg-[#2AABEE] shadow-[0_0_10px_#2AABEE] animate-pulse" />
        TG<span className="text-[#2AABEE]">Only</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/#categories" className="text-[#8888aa] text-sm font-medium hover:text-[#f0eff8] transition-colors">Explorar</Link>
        <Link href="/#trending" className="text-[#8888aa] text-sm font-medium hover:text-[#f0eff8] transition-colors">Trending</Link>
        <Link href="/grupos" className="text-[#8888aa] text-sm font-medium hover:text-[#f0eff8] transition-colors">Categorias</Link>
        <Link href="/agregar" className="bg-[#2AABEE] text-black font-semibold text-[13px] px-4 py-2 rounded-lg hover:bg-[#1a8fd1] transition-colors">+ Agregar grupo</Link>
        <ThemeToggle />
      </div>
    </nav>
  )
}
