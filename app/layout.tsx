import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://telegramonly.com'),
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon-192.png' },
  title: { default: 'TGOnly — Directorio #1 de Grupos de Telegram en Español', template: '%s | TGOnly' },
  description: 'El directorio #1 de grupos de Telegram en español. OnlyFans, cripto, gaming, tech, deportes y más para LATAM. Miles de grupos verificados.',
  keywords: 'grupos telegram espanol, telegram onlyfans, grupos telegram latam, telegram only fans, canales telegram, grupos telegram 2025',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-192.png" />
        <meta name="google-adsense-account" content="ca-pub-3124148866017945" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('tgonly-theme')||'dark';document.documentElement.classList.toggle('light',t==='light')}catch(e){}` }} />
        {children}
      </body>
    </html>
  )
}
