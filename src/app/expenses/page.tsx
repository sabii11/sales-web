'use client'
export const dynamic = 'force-dynamic'
import RequireAuth from '@/app/components/RequireAuth'
import Nav from '@/app/components/Nav'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

const CATS = ['all','operational','salary','marketing','inventory','other'] as const

export default function Expenses(){
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7))
  const [rows,setRows]=useState<any[]>([])
  const [cat,setCat]=useState<(typeof CATS)[number]>('all')
  const [branches,setBranches]=useState<any[]>([])
  const [profile,setProfile]=useState<any>(null)
  const [branchId,setBranchId]=useState<number|undefined>()

  useEffect(()=>{(async()=>{
    const { data: prof } = await supabase.from('profiles').select('*').single(); setProfile(prof)
    if (prof?.role==='branch') setBranchId(prof.branch_id)
    const { data: b } = await supabase.from('branches').select('id,name').eq('is_active', true); setBranches(b||[])
  })();},[])

  useEffect(()=>{(async()=>{
    const start=month+'-01';
    const end=new Date(new Date(start).setMonth(new Date(start).getMonth()+1)).toISOString().slice(0,10)
    let q = supabase.from('expenses').select('*, vendors(name), employees(full_name), branches(name)').gte('date',start).lt('date',end).order('date')
    if (cat!=='all') q = q.eq('category',cat)
    if (branchId) q = q.eq('branch_id', branchId)
    const { data } = await q
    setRows(data||[])
  })();},[month,cat,branchId])

  const total = useMemo(()=> rows.reduce((s,r)=> s + Number(r.amount||0), 0), [rows])

  function downloadCSV(){
    const headers=['Date','Branch','Category','Vendor','Employee','Amount','Payment','Notes']
    const lines = rows.map(r=>[
      r.date, r.branches?.name, r.category, r.vendors?.name||'', r.employees?.full_name||'', r.amount, r.payment_method||'', (r.notes||'').replace(/\n/g,' ')
    ].join(','))
    const csv=[headers.join(','),...lines].join('\n')
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`expenses_${month}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <>
    <RequireAuth />
      <Nav/>
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <h1 className="heading mb-3">Expenses</h1>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border p-2 rounded" />
          <select value={cat} onChange={e=>setCat(e.target.value as any)} className="border p-2 rounded">
            {CATS.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          {profile?.role==='admin' && (
            <select className="border p-2 rounded" value={branchId} onChange={e=>setBranchId(e.target.value?Number(e.target.value):undefined)}>
              <option value="">All branches</option>
              {branches.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <button onClick={downloadCSV} className= "btn-black">CSV</button>
        </div>
        <div className="border rounded mb-3 p-3 bg-white">
          <div className="text-sm">Total</div>
          <div className="text-2xl font-bold">£{total.toLocaleString()}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b">
              <th className="p-2">Date</th><th className="p-2">Branch</th><th className="p-2">Category</th><th className="p-2">Vendor/Employee</th><th className="p-2">Amount</th><th className="p-2">Payment</th><th className="p-2">Notes</th>
            </tr></thead>
            <tbody>
              {rows.map((r:any)=>(
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.branches?.name}</td>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{r.vendors?.name || r.employees?.full_name || '-'}</td>
                  <td className="p-2">£{Number(r.amount).toLocaleString()}</td>
                  <td className="p-2">{r.payment_method||'-'}</td>
                  <td className="p-2">{r.notes||''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
