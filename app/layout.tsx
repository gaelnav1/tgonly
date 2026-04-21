import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://telegramonly.com'),
  title: { default: 'TGOnly - Directorio #1 de Grupos de Telegram en Espanol', template: '%s | TGOnly' },
  description: 'El directorio mas completo de grupos de Telegram en espanol para toda LATAM.',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
