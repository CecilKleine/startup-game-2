import type { Metadata } from 'next'
import './globals.css'
import { MUIThemeProvider } from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'SaaSimulator',
  description: 'Manage your startup as a CEO',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <MUIThemeProvider>
          {children}
        </MUIThemeProvider>
      </body>
    </html>
  )
}
