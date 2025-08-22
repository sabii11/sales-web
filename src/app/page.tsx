'use client'
import Image from 'next/image'
import { useState } from 'react'
import { signIn } from '@/app/lib/auth'

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false)

  const submit=async(e:any)=>{
    e.preventDefault(); setErr(''); setBusy(true)
    try{
      await signIn(email,password)
      window.location.href='/dashboard'
    }catch(e:any){
      setErr(e.message||'Login failed')
    }finally{ setBusy(false) }
  }

  return (
    <main className="min-h-[80dvh] grid place-items-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col items-center mb-4">
          <Image src="/logo.png" alt="BabTooma" width={200} height={150} className="rounded mb-2" />
          <h1 className="text-xl font-semibold">Welcome</h1>
          <p className="text-sm text-slate-600">Sign in to BabTooma Admin</p>
        </div>
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-sm">Email</span>
            <input className="mt-1 w-full border border-slate-300 p-2 rounded-lg" type="email" inputMode="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm">Password</span>
            <input className="mt-1 w-full border border-slate-300 p-2 rounded-lg" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
          </label>
          <button disabled={busy} className="w-full bg-sky-600 hover:bg-sky-700 text-white p-2 rounded-lg disabled:opacity-60">{busy? 'Signing in…':'Sign in'}</button>
        </form>
      </div>
    </main>
  )
}
