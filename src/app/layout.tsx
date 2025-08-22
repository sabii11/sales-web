import './globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700'] })

export const metadata = { title: 'BabTooma Admin' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} min-h-dvh bg-gradient-to-b from-white to-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  )
}
