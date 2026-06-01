'use client'
import { useEffect, useState } from 'react'
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    const saved = localStorage.getItem('tgonly-theme')
    setIsDark(saved !== 'light')
  }, [])
  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('tgonly-theme', next ? 'dark' : 'light')
  }
  return (
    <button onClick={toggle} className="theme-toggle-btn" aria-label="Cambiar tema">
      {isDark ? '☀️ Claro' : '🌙 Oscuro'}
    </button>
  )
}
