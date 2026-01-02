import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kitties powered by Droidminnds Management',
  description: 'Admin Dashboard for PreSchool Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface antialiased">
        {children}
      </body>
    </html>
  )
}
