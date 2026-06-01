import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://tgonly.com'),
  title: {
    default: 'Telegram Only — Directorio #1 de Grupos de Telegram en Español | TGOnly',
    template: '%s | Telegram Only - TGOnly',
  },
  description: 'Telegram Only — El directorio más completo de grupos y canales de Telegram en español. Cripto, gaming, OnlyFans, tech, deportes y más para toda LATAM.',
  keywords: 'telegram only, telegramonly, grupos telegram, canales telegram, telegram onlyfans, telegram latam, grupos telegram espanol, telegram only fans',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Preconnect a Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
