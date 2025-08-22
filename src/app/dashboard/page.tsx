'use client'
import Nav from '@/app/components/Nav'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'

export default function Dashboard(){
  const [month,setMonth]=useState<string>(new Date().toISOString().slice(0,7))
  const [sales,setSales]=useState<any[]>([])
  const [expenses,setExpenses]=useState<any[]>([])

  useEffect(()=>{(async()=>{
    const start = month+'-01'
    const end = new Date(new Date(start).setMonth(new Date(start).getMonth()+1)).toISOString().slice(0,10)
    const { data: s } = await supabase.from('sales').select('*, branches(name)').gte('date', start).lt('date', end).order('date')
    setSales(s||[])
    const { data: e } = await supabase.from('expenses').select('*, branches(name)').gte('date', start).lt('date', end).order('date')
    setExpenses(e||[])
  })();},[month])

  const totalSales = useMemo(()=> sales.reduce((t,x)=> t + Number(x.gross||0), 0), [sales])
  const totalExp   = useMemo(()=> expenses.reduce((t,x)=> t + Number(x.amount||0),0), [expenses])
  const profit     = totalSales - totalExp

  const byBranch: Record<string, number> = {}
  sales.forEach(r=>{ const name=r.branches?.name||'Unknown'; byBranch[name]=(byBranch[name]||0) + Number(r.gross||0) })

  return (
    <>
      <Nav/>
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex gap-3 items-center mb-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border p-2 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="border rounded p-3 bg-white"><div className="text-sm">Total Sales</div><div className="text-2xl font-bold">£{totalSales.toLocaleString()}</div></div>
          <div className="border rounded p-3 bg-white"><div className="text-sm">Total Expenses</div><div className="text-2xl font-bold">£{totalExp.toLocaleString()}</div></div>
          <div className="border rounded p-3 bg-white"><div className="text-sm">Profit</div><div className={`text-2xl font-bold ${profit>=0?'text-green-600':'text-red-600'}`}>£{profit.toLocaleString()}</div></div>
        </div>
        <div className="border rounded p-4 bg-white">
          <Bar data={{ labels:Object.keys(byBranch), datasets:[{ label:'Sales by Branch', data:Object.values(byBranch) as number[] }] }} />
        </div>
      </main>
    </>
  )
}
