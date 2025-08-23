'use client'
import Nav from '@/app/components/Nav'
import RequireAuth from '@/app/components/RequireAuth'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'

export default function Dashboard(){
  const [month,setMonth]=useState<string>(new Date().toISOString().slice(0,7))
  const [sales,setSales]=useState<any[]>([])
  const [expenses,setExpenses]=useState<any[]>([])
  const [selectedBranch,setSelectedBranch]=useState<string | null>(null)

  useEffect(()=>{(async()=>{
    const start = month+'-01'
    const end = new Date(new Date(start).setMonth(new Date(start).getMonth()+1)).toISOString().slice(0,10)
    const { data: s } = await supabase.from('sales').select('date, gross, branches(name)').gte('date', start).lt('date', end).order('date')
    setSales(s||[])
    const { data: e } = await supabase.from('expenses').select('amount, date').gte('date', start).lt('date', end)
    setExpenses(e||[])
    setSelectedBranch(null)
  })();},[month])

  const totalSales = useMemo(()=> sales.reduce((t,x)=> t + Number(x.gross||0), 0), [sales])
  const totalExp   = useMemo(()=> expenses.reduce((t,x)=> t + Number(x.amount||0),0), [expenses])
  const profit     = totalSales - totalExp

  const byBranch: Record<string, number> = {}
  sales.forEach(r=>{ const name=r.branches?.name||'Unknown'; byBranch[name]=(byBranch[name]||0) + Number(r.gross||0) })

  const daily = useMemo(()=>{
    if(!selectedBranch) return { labels:[], data:[] }
    const m = new Map<string, number>()
    sales.filter(r => (r.branches?.name||'Unknown')===selectedBranch).forEach(r=>{
      m.set(r.date, (m.get(r.date)||0) + Number(r.gross||0))
    })
    const labels = Array.from(m.keys()).sort()
    const data = labels.map(l => m.get(l) || 0)
    return { labels, data }
  },[selectedBranch, sales])

  const inputWrap = 'relative'
  const inputBase = 'border border-slate-300 bg-white text-slate-900 p-2 rounded-lg pr-10'

  return (
    <>
      <RequireAuth />
      <Nav/>
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex gap-3 items-center mb-4">
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
              <div className="text-sm font-medium text-slate-700">Total Sales</div>
                <div className="text-2xl font-bold text-slate-900">£{totalSales.toLocaleString()}</div>
</div>
<div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
  <div className="text-sm font-medium text-slate-700">Total Expenses</div>
  <div className="text-2xl font-bold text-slate-900">£{totalExp.toLocaleString()}</div>
</div>

<div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
  <div className="text-sm font-medium text-slate-700">Profit</div>
  <div className={`text-2xl font-bold ${profit>=0?'text-green-600':'text-red-600'}`}>£{profit.toLocaleString()}</div>
</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-4">
          <Bar
            data={{
              labels:Object.keys(byBranch),
              datasets:[{ label:'Sales by Branch', data:Object.values(byBranch) as number[], backgroundColor:'rgba(14,116,144,0.35)', borderColor:'rgba(14,116,144,0.9)', borderWidth:1 }]
            }}
            options={{
              onClick: (_evt, elements)=>{ if(elements.length){ const idx=elements[0].index as number; setSelectedBranch(Object.keys(byBranch)[idx]) } },
              scales: { y: { grid: { color:'#edf2f7'}}, x: { grid: { display:false }}}
            }}
          />
        </div>

        {selectedBranch && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">Daily sales: {selectedBranch}</h2>
              <button className="text-sm text-slate-600 underline" onClick={()=>setSelectedBranch(null)}>clear</button>
            </div>
            <Bar
              data={{
                labels: daily.labels,
                datasets:[{ label:'Daily Gross', data: daily.data, backgroundColor:'rgba(99,102,241,0.35)', borderColor:'rgba(99,102,241,0.9)', borderWidth:1 }]
              }}
              options={{ scales: { y: { grid: { color:'#edf2f7'}}, x: { grid: { display:false }}} }}
            />
          </div>
        )}
      </main>
    </>
  )
}
