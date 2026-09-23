'use client'
import { useEffect, useState } from 'react'
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => { setIsDark(localStorage.getItem('tgonly-theme') !== 'light') }, [])
  function toggle() {
    const next = !isDark; setIsDark(next)
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('tgonly-theme', next ? 'dark' : 'light')
  }
  return <button onClick={toggle} className="theme-toggle-btn">{isDark ? '☀️ Claro' : '🌙 Oscuro'}</button>
}
