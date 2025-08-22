'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function Nav(){
  const [user,setUser]=useState<any>(null)
  const [open,setOpen]=useState(false)

  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user)) },[])
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') setOpen(false) }
    window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey)
  },[])

  const links = [
    { href:'/dashboard', label:'Dashboard' },
    { href:'/sales/new', label:'Add Sale' },
    { href:'/expenses', label:'Expenses' },
    { href:'/expenses/new', label:'Add Expense' },
    { href:'/po/new', label:'New PO' },
    { href:'/reports', label:'Reports' },
  ]

  return (
    <>
      <nav className="w-full border-b bg-white">
        <div className="max-w-6xl mx-auto px-3 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo (put /public/logo.png) */}
            <Image src="/logo.png" alt="BabTooma" width={150} height={32} className="rounded" />
            
          </Link>

          {/* Desktop links */}
          {user && (
            <div className="hidden md:flex items-center gap-4 ml-6 text-sm text-slate-700">
              {links.map(l => <Link key={l.href} href={l.href} className="hover:text-slate-900">{l.label}</Link>)}
            </div>
          )}

          <div className="ml-auto">
            {user ? (
              <button
                className="hidden md:inline-flex text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                onClick={()=>supabase.auth.signOut().then(()=>location.href='/')}
              >
                Sign out
              </button>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          {user && (
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={()=>setOpen(true)}
              className="md:hidden ml-auto inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
      </nav>

      {/* Off-canvas drawer */}
      {user && (
        <>
          <div
            className={`fixed inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={()=>setOpen(false)}
          />
          <aside
            className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl transition-transform duration-200 ${
              open ? 'translate-x-0' : '-translate-x-full'
            }`}
            role="dialog" aria-modal="true"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="BabTooma" width={28} height={28} className="rounded" />
                <span className="font-semibold">Menu</span>
              </div>
              <button aria-label="Close menu" onClick={()=>setOpen(false)} className="rounded-md border border-slate-300 px-2 py-1">
                ✕
              </button>
            </div>
            <nav className="p-3 flex flex-col gap-2 text-slate-800">
              {links.map(l=>(
                <Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100">
                  {l.label}
                </Link>
              ))}
              <button
                onClick={()=>supabase.auth.signOut().then(()=>location.href='/')}
                className="mt-2 text-left rounded-lg px-3 py-2 border border-slate-300 hover:bg-slate-50"
              >
                Sign out
              </button>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
