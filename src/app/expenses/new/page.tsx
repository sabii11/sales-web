'use client'
import RequireAuth from '@/app/components/RequireAuth'
import Nav from '@/app/components/Nav'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

const CATS = ['operational','salary','marketing','inventory','other'] as const

export default function NewExpense(){
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [category,setCategory]=useState<(typeof CATS)[number]>('operational')
  const [amount,setAmount]=useState('')
  const [payment,setPayment]=useState('')
  const [notes,setNotes]=useState('')
  const [branches,setBranches]=useState<any[]>([])
  const [vendors,setVendors]=useState<any[]>([])
  const [employees,setEmployees]=useState<any[]>([])
  const [profile,setProfile]=useState<any>(null)
  const [branchId,setBranchId]=useState<number|undefined>()
  const [vendorId,setVendorId]=useState<number|undefined>()
  const [employeeId,setEmployeeId]=useState<number|undefined>()

  useEffect(()=>{(async()=>{
    const { data: prof } = await supabase.from('profiles').select('*').single()
    setProfile(prof); if (prof?.role==='branch') setBranchId(prof.branch_id)
    const { data: b } = await supabase.from('branches').select('id,name').eq('is_active', true)
    setBranches(b||[])
    const { data: v } = await supabase.from('vendors').select('id,name')
    setVendors(v||[])
    const { data: e } = await supabase.from('employees').select('id,full_name,branch_id')
    setEmployees(e||[])
  })();},[])

  async function save(e:any){
    e.preventDefault()
    const user = (await supabase.auth.getUser()).data.user
    const payload:any={ date, category, amount:Number(amount||0), payment_method:payment, notes, created_by:user?.id }
    if (profile?.role==='admin') payload.branch_id=branchId; else payload.branch_id=profile?.branch_id
    if (vendorId) payload.vendor_id=vendorId
    if (employeeId && category==='salary') payload.employee_id=employeeId
    const { error } = await supabase.from('expenses').insert(payload)
    if (error) return alert(error.message)
    alert('Expense saved')
  }

  return (
    <>
    <RequireAuth />
      <Nav/>
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Add Expense</h1>
        <form onSubmit={save} className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border p-2 rounded" />
            <select value={category} onChange={e=>setCategory(e.target.value as any)} className="border p-2 rounded">
              {CATS.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {profile?.role==='admin' && (
            <select className="border p-2 rounded" value={branchId} onChange={e=>setBranchId(Number(e.target.value))}>
              <option value="">Select Branch</option>
              {branches.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <input placeholder="Amount (£)" value={amount} onChange={e=>setAmount(e.target.value)} className="border p-2 rounded" />
            <input placeholder="Payment Method (cash/bank/card)" value={payment} onChange={e=>setPayment(e.target.value)} className="border p-2 rounded" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <select className="border p-2 rounded" value={vendorId} onChange={e=>setVendorId(e.target.value?Number(e.target.value):undefined)}>
              <option value="">Vendor (optional)</option>
              {vendors.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            {category==='salary' && (
              <select className="border p-2 rounded" value={employeeId} onChange={e=>setEmployeeId(Number(e.target.value))}>
                <option value="">Employee</option>
                {employees.filter(x=>!branchId || x.branch_id===branchId).map(e=> <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            )}
          </div>
          <textarea placeholder="Notes" className="border p-2 rounded" value={notes} onChange={e=>setNotes(e.target.value)} />
          <button className="w-full bg-black hover:bg-neutral-800 text-white p-2 rounded-lg">Save Expense</button>
        </form>
      </main>
    </>
  )
}
