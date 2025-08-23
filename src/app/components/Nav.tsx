'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

function Icon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const icons = {
  dashboard: 'M3 12l9-9 9 9M5 10v10h5V14h4v6h5V10',
  sale:      'M3 12h18M5 7h14M7 17h10',
  expenses:  'M4 6h16v12H4z M8 10h8',
  add:       'M12 5v14M5 12h14',
  po:        'M6 4h12v16H6z M8 8h8M8 12h8M8 16h8',
  reports:   'M4 19V5m0 14h16M8 17V9m4 8V7m4 10v-6',
  logout:    'M10 17l5-5-5-5M15 12H3',
}

export default function Nav(){
  const [user,setUser]=useState<any>(null)
  const [open,setOpen]=useState(false)

  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user)) },[])
  useEffect(()=>{ 
    const k=(e:KeyboardEvent)=> e.key==='Escape' && setOpen(false);
    window.addEventListener('keydown',k);
    return ()=>window.removeEventListener('keydown',k)
  },[])

  // 🔒 Body lock + attribute for extra mobile safety (iOS native pickers)
  useEffect(()=>{
    if (open) {
      document.body.classList.add('overflow-hidden')
      document.documentElement.setAttribute('data-drawer','open')
    } else {
      document.body.classList.remove('overflow-hidden')
      document.documentElement.removeAttribute('data-drawer')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
      document.documentElement.removeAttribute('data-drawer')
    }
  }, [open])

  const links = [
    { href:'/dashboard',   label:'Dashboard',    icon:icons.dashboard },
    { href:'/sales/new',   label:'Add Sale',     icon:icons.sale },
    { href:'/expenses',    label:'Expenses',     icon:icons.expenses },
    { href:'/expenses/new',label:'Add Expense',  icon:icons.add },
    { href:'/po/new',      label:'New PO',       icon:icons.po },
    { href:'/reports',     label:'Reports',      icon:icons.reports },
  ]

  const homeHref = user ? '/dashboard' : '/'

  return (
    <>
      <nav className="w-full border-b bg-white">
        <div className="max-w-6xl mx-auto px-3 py-3 flex items-center gap-3">
          <Link href={homeHref} className="flex items-center gap-2">
            {/* 150px logo */}
            <Image src="/logo.png" alt="BabTooma" width={150} height={36} className="h-9 w-auto" />
          </Link>

          {/* desktop links */}
          {user && (
            <div className="hidden md:flex items-center gap-4 ml-4 text-sm text-slate-700">
              {links.map(l => (
                <Link key={l.href} href={l.href} className="hover:text-slate-900 flex items-center gap-1.5">
                  <Icon path={l.icon} /> {l.label}
                </Link>
              ))}
            </div>
          )}

          <div className="ml-auto hidden md:block">
            {user ? (
              <button
                className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                onClick={()=>supabase.auth.signOut().then(()=>location.href='/')}
              >
                Sign out
              </button>
            ) : null}
          </div>

          {/* mobile hamburger */}
          {user && (
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={()=>setOpen(true)}
              className="md:hidden ml-auto inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Off-canvas drawer */}
      {user && (
        <>
          {/* ⬆️ Added z-40 so it beats all inputs/pickers */}
          <div
            className={`fixed inset-0 bg-black/30 transition-opacity z-40 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={()=>setOpen(false)}
          />
          {/* ⬆️ Added z-50 on drawer */}
          <aside
            className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl transition-transform duration-200 z-50 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <Image src="/logo.png" alt="BabTooma" width={120} height={28} className="h-7 w-auto" />
              <button aria-label="Close menu" onClick={()=>setOpen(false)} className="rounded-md border border-slate-300 px-2 py-1">✕</button>
            </div>
            <nav className="p-3 flex flex-col gap-2 text-slate-800">
              {links.map(l=>(
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={()=>setOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Icon path={l.icon} /> {l.label}
                </Link>
              ))}
              <button
                onClick={()=>supabase.auth.signOut().then(()=>location.href='/')}
                className="mt-2 text-left rounded-lg px-3 py-2 border border-slate-300 hover:bg-slate-50 flex items-center gap-2"
              >
                <Icon path={icons.logout} /> Sign out
              </button>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
