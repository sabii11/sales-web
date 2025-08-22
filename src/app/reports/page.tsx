'use client'
import Nav from '@/app/components/Nav'
import RequireAuth from '@/app/components/RequireAuth'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import * as XLSX from 'xlsx'
import { Bar, Line } from 'react-chartjs-2'
import 'chart.js/auto'

type DataType = 'sales' | 'expenses'

export default function Reports(){
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7))
  const [dataType,setDataType]=useState<DataType>('sales')
  const [branchId,setBranchId]=useState<number|undefined>()
  const [branches,setBranches]=useState<any[]>([])
  const [rows,setRows]=useState<any[]>([])
  const [isAdmin,setIsAdmin]=useState(false)
  const [busy,setBusy]=useState(false)
  const chartRef = useRef<any>(null)

  useEffect(()=>{(async()=>{
    const { data: b } = await supabase.from('branches').select('id,name').eq('is_active', true)
    setBranches(b||[])
    const { data: prof } = await supabase.from('profiles').select('role').single()
    setIsAdmin(prof?.role==='admin')
  })();},[])

  useEffect(()=>{(async()=>{
    const start=month+'-01'
    const end=new Date(new Date(start).setMonth(new Date(start).getMonth()+1)).toISOString().slice(0,10)
    if (dataType==='sales'){
      let q = supabase.from('sales').select('date, gross, branch_id, branches(name)').gte('date', start).lt('date', end).order('date')
      if (branchId) q = q.eq('branch_id', branchId)
      const { data } = await q; setRows(data||[])
    } else {
      let q = supabase.from('expenses').select('date, amount, category, branch_id, branches(name)').gte('date', start).lt('date', end).order('date')
      if (branchId) q = q.eq('branch_id', branchId)
      const { data } = await q; setRows(data||[])
    }
  })();},[month,dataType,branchId])

  const input='border border-slate-300 bg-white text-slate-900 p-2 rounded-lg'

  const total = useMemo(()=>{
    return dataType==='sales'
      ? rows.reduce((s:any,r:any)=> s + Number(r.gross||0), 0)
      : rows.reduce((s:any,r:any)=> s + Number(r.amount||0),0)
  },[rows,dataType])

  const chartData = useMemo(()=>{
    const m = new Map<string, number>()
    for (const r of rows) {
      const key = r.date
      m.set(key, (m.get(key)||0) + Number(dataType==='sales' ? r.gross||0 : r.amount||0))
    }
    const labels = Array.from(m.keys()).sort()
    const values = labels.map(l => m.get(l) || 0)
    return { labels, values }
  },[rows,dataType])

  function excel(){
    let header:string[]; let data:any[]=[]
    if (dataType==='sales'){
      header = ['Date','Branch','Gross']
      data = rows.map((r:any)=>[r.date, r.branches?.name, r.gross])
    } else {
      header = ['Date','Branch','Category','Amount']
      data = rows.map((r:any)=>[r.date, r.branches?.name, r.category, r.amount])
    }
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([header, ...data])
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `report_${dataType}_${month}${branchId?`_b${branchId}`:''}.xlsx`)
  }

  function csv(){
    const header = dataType==='sales' ? ['Date','Branch','Gross'] : ['Date','Branch','Category','Amount']
    const lines = rows.map((r:any)=> dataType==='sales'
      ? [r.date, r.branches?.name, r.gross].join(',')
      : [r.date, r.branches?.name, r.category, r.amount].join(',')
    )
    const blob=new Blob([[header.join(','),...lines].join('\n')],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`report_${dataType}_${month}${branchId?`_b${branchId}`:''}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  function png(){
    const canvas = (chartRef.current as any)?.canvas as HTMLCanvasElement | undefined
    if(!canvas) return
    const url = canvas.toDataURL('image/png')
    const a=document.createElement('a'); a.href=url; a.download=`report_${dataType}_${month}.png`; a.click()
  }

  async function resetAll(){
    if (!isAdmin) return
    if (!confirm('This will permanently delete SALES, EXPENSES and PO data. Continue?')) return
    setBusy(true)
    const { error } = await supabase.rpc('admin_reset_data')
    setBusy(false)
    if (error) return alert(error.message)
    alert('All data cleared.')
    setRows([])
  }

  return (
    <>
      <RequireAuth />
      <Nav/>
      <main className="max-w-6xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-3">Reports</h1>
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className={input}/>
          <select className={input} value={dataType} onChange={e=>setDataType(e.target.value as DataType)}>
            <option value="sales">Sales</option>
            <option value="expenses">Expenses</option>
          </select>
          <select className={input} value={branchId??''} onChange={e=>setBranchId(e.target.value?Number(e.target.value):undefined)}>
            <option value="">All branches</option>
            {branches.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <button onClick={excel} className="ml-auto bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg">Excel</button>
          <button onClick={csv} className="border border-slate-300 px-3 py-2 rounded-lg bg-white hover:bg-slate-50">CSV</button>
          <button onClick={png} className="border border-slate-300 px-3 py-2 rounded-lg bg-white hover:bg-slate-50">PNG</button>

          {isAdmin && (
            <button
              onClick={resetAll}
              disabled={busy}
              className="border border-red-300 text-red-700 px-3 py-2 rounded-lg bg-white hover:bg-red-50 disabled:opacity-60"
              title="Admin only"
            >
              {busy ? 'Resetting…' : 'Reset Data'}
            </button>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-4">
          <div className="text-sm text-slate-600">Total</div>
          <div className="text-2xl font-bold">£{total.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
          {dataType==='sales' ? (
            <Line ref={chartRef} data={{ labels: chartData.labels, datasets:[{ label:'Daily Gross', data: chartData.values, borderColor:'rgba(14,116,144,0.9)', backgroundColor:'rgba(14,116,144,0.2)', fill:true }] }} />
          ) : (
            <Bar ref={chartRef} data={{ labels: chartData.labels, datasets:[{ label:'Daily Expenses', data: chartData.values, backgroundColor:'rgba(239,68,68,0.35)', borderColor:'rgba(239,68,68,0.9)', borderWidth:1 }] }} />
          )}
        </div>
      </main>
    </>
  )
}
