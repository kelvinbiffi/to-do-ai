import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { QueryProvider } from './providers'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'To-Do AI',
    template: '%s | To-Do AI',
  },
  description: 'Organize your tasks with intelligence - An AI-powered todo application with WhatsApp integration',
  keywords: ['todo', 'tasks', 'ai', 'whatsapp', 'task-management'],
  authors: [{ name: 'To-Do AI Team' }],
  creator: 'To-Do AI',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://todo-ai.app',
    siteName: 'To-Do AI',
    title: 'To-Do AI - Intelligent Task Management',
    description: 'Organize your tasks with AI assistance and WhatsApp integration',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Root layout component
 * Wraps the entire application with necessary providers and configurations
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans bg-gray-50`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
