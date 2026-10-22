import '@/app/globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Earthquake 3D Monitor | Realtime Global Seismic Activity',
  description: 'Interactive 3D globe and real-time seismic event visualizer powered by USGS live feeds, Next.js 15, and React Three Fiber.',
  keywords: ['earthquake', 'terremoto', 'sismo', '3D globe', 'Three.js', 'React Three Fiber', 'Next.js', 'USGS', 'realtime'],
  authors: [{ name: 'Realtime 3D Monitor Team' }],
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Earthquake 3D Monitor | Realtime Seismic Activity',
    description: 'Explore global earthquakes in real time with an interactive 3D WebGL globe.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.className}`}>
      <body className="bg-slate-950 text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}
