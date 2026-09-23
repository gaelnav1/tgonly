import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-4">
        <div className="h-[62px] bg-white/95 backdrop-blur-xl border border-[#e6eaf2] shadow-[0_10px_30px_rgba(39,56,95,.06)] rounded-2xl px-4 sm:px-5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-syne font-extrabold text-xl no-underline text-[#11182d] flex-shrink-0">
            <span className="w-9 h-9 rounded-xl bg-[#ffd91a] flex items-center justify-center text-[17px] -rotate-6">➤</span>
            TGOnly
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/buscar" className="px-4 py-2 rounded-xl text-[#53607e] text-sm font-semibold hover:bg-[#f3f6fb] hover:text-[#1769ff] transition-colors">⌕&nbsp; Buscar</Link>
            <Link href="/grupos" className="px-4 py-2 rounded-xl text-[#53607e] text-sm font-semibold hover:bg-[#f3f6fb] hover:text-[#1769ff] transition-colors">◉&nbsp; Explorar</Link>
            <Link
              href="/agregar"
              className="group relative ml-1 inline-flex items-center rounded-xl bg-[linear-gradient(90deg,#ff7ad9_0%,#ffd84d_18%,#7dff9b_38%,#62d9ff_58%,#7f8cff_78%,#c987ff_100%)] p-[2px] shadow-[0_10px_24px_rgba(123,97,255,.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(123,97,255,.30)] active:translate-y-0"
            >
              <span className="relative flex items-center gap-2 rounded-[10px] bg-white/90 px-4 py-2 text-sm font-extrabold text-[#13204a] backdrop-blur transition-colors group-hover:bg-white/82">
                <span className="text-[17px] leading-none text-[#1769ff]">＋</span>
                <span>Agregar grupo</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/buscar" aria-label="Buscar" className="md:hidden w-9 h-9 rounded-xl border border-[#e6eaf2] flex items-center justify-center text-[#1769ff]">⌕</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
