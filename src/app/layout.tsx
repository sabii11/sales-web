import './globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700'] })

export const metadata = { title: 'BabTooma Admin' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Tell the UA we only support light UI */}
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${poppins.className} min-h-dvh bg-white text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
