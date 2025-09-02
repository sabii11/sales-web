'use client'
export const dynamic = 'force-dynamic'

import Nav from '@/app/components/Nav'
import RequireAuth from '@/app/components/RequireAuth'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

// helper: robustly get branch name from relation (object OR array)
function branchNameFrom(rel: any): string {
  if (!rel) return ''
  if (Array.isArray(rel)) return rel[0]?.name ?? ''
  return rel?.name ?? ''
}

// quick CSV helper
function toCSV(rows: any[]) {
  const headers = [
    'Date','Branch','Gross','Cash','Card','Online',
    'Just Eat','Uber Eats','Click & Collect','Notes'
  ]
  const lines = [headers.join(',')]
  rows.forEach(r=>{
    const values = [
      r.date,
      r.branch || '',
      r.gross ?? 0,
      r.cash ?? 0,
      r.card ?? 0,
      r.online ?? 0,
      r.just_eat ?? 0,
      r.uber_eats ?? 0,
      r.click_collect ?? 0,
      (r.notes || '').replace(/[\r\n,]/g,' '),
    ]
    lines.push(values.join(','))
  })
  return lines.join('\n')
}

export default function Reports(){
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0,7))
  const [rows, setRows] = useState<any[]>([])

  useEffect(()=>{
    (async()=>{
      const start = `${month}-01`
      const end = dayjs(start).add(1,'month').format('YYYY-MM-DD')
      const { data } = await supabase
        .from('sales')
        .select('date, gross, cash, card, online, just_eat, uber_eats, click_collect, notes, branches(name)')
        .gte('date', start).lt('date', end).order('date')

      // 👇 avoid TS error by treating result rows as any and normalizing branch name
      setRows((data ?? []).map((r: any) => ({
        ...r,
        branch: branchNameFrom(r.branches),
      })))
    })()
  },[month])

  const totalGross = useMemo(()=> rows.reduce((t,r)=> t + Number(r.gross||0),0), [rows])

  function downloadCSV(){
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <RequireAuth/>
      <Nav/>
      <main className="max-w-6xl mx-auto p-4">
        <h1 className="heading mb-4">Reports</h1>

        <div className="flex items-center gap-3 mb-4">
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="field w-48" />
          <button onClick={downloadCSV} className="btn-black">CSV</button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-3">
          <div className="stat-label">Total Gross</div>
          <div className="stat-value">£{totalGross.toLocaleString()}</div>
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Branch</th>
                <th className="py-2 px-3">Gross</th>
                <th className="py-2 px-3">Cash</th>
                <th className="py-2 px-3">Card</th>
                <th className="py-2 px-3">Online</th>
                <th className="py-2 px-3">Just Eat</th>
                <th className="py-2 px-3">Uber Eats</th>
                <th className="py-2 px-3">Click & Collect</th>
                <th className="py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i} className="border-b border-slate-100 text-slate-900">
                  <td className="py-2 px-3">{r.date}</td>
                  <td className="py-2 px-3">{r.branch}</td>
                  <td className="py-2 px-3">£{Number(r.gross||0).toLocaleString()}</td>
                  <td className="py-2 px-3">£{Number(r.cash||0).toLocaleString()}</td>
                  <td className="py-2 px-3">£{Number(r.card||0).toLocaleString()}</td>
                  <td className="py-2 px-3">£{Number(r.online||0).toLocaleString()}</td>
                  <td className="py-2 px-3">£{Number(r.just_eat||0).toLocaleString()}</td>
                  <td className="py-2 px-3">£{Number(r.uber_eats||0).toLocaleString()}</td>
                  <td className="py-2 px-3">£{Number(r.click_collect||0).toLocaleString()}</td>
                  <td className="py-2 px-3">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
