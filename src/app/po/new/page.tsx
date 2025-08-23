'use client'
import RequireAuth from '@/app/components/RequireAuth'
import Nav from '@/app/components/Nav'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type Line = { item:string; qty:string; unit:string }

export default function NewPO(){
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [branches,setBranches]=useState<any[]>([])
  const [vendors,setVendors]=useState<any[]>([])
  const [profile,setProfile]=useState<any>(null)
  const [branchId,setBranchId]=useState<number|undefined>()
  const [vendorId,setVendorId]=useState<number|undefined>()
  const [lines,setLines]=useState<Line[]>([{item:'',qty:'',unit:''}])
  const [notes,setNotes]=useState('')

  useEffect(()=>{(async()=>{
    const { data: prof } = await supabase.from('profiles').select('*').single(); setProfile(prof); if(prof?.role==='branch') setBranchId(prof.branch_id)
    const { data: b } = await supabase.from('branches').select('id,name').eq('is_active', true); setBranches(b||[])
    const { data: v } = await supabase.from('vendors').select('id,name'); setVendors(v||[])
  })();},[])

  function addLine(){ setLines([...lines,{item:'',qty:'',unit:''}]) }
  function setLine(i:number,patch:Partial<Line>){ setLines(ls=> ls.map((l,idx)=> idx===i? {...l,...patch}: l)) }
  function removeLine(i:number){ setLines(ls=> ls.filter((_,idx)=> idx!==i)) }

  async function save(e:any){
    e.preventDefault()
    const user = (await supabase.auth.getUser()).data.user
    const subtotal = lines.reduce((s,l)=> s + (Number(l.qty||0)*Number(l.unit||0)), 0)
    const payload:any={ date, branch_id: (profile?.role==='admin'? branchId: profile?.branch_id), vendor_id: vendorId, subtotal, tax:0, total:subtotal, notes, created_by:user?.id }
    const { data: po, error } = await supabase.from('purchase_orders').insert(payload).select('id').single()
    if (error) return alert(error.message)
    const items = lines.filter(l=>l.item && (Number(l.qty)>0)).map(l=> ({ po_id: po.id, item: l.item, qty: Number(l.qty), unit_price: Number(l.unit||0) }))
    if (items.length) {
      const { error: e2 } = await supabase.from('purchase_order_items').insert(items)
      if (e2) return alert(e2.message)
    }
    alert('PO saved')
  }

  return (
    <>
    <RequireAuth />
      <Nav/>
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">New Purchase Order</h1>
        <form onSubmit={save} className="grid gap-3">
          <div className="grid md:grid-cols-3 gap-3">
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border p-2 rounded" />
            {profile?.role==='admin' && (
              <select className="border p-2 rounded" value={branchId} onChange={e=>setBranchId(Number(e.target.value))}>
                <option value="">Select Branch</option>
                {branches.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <select className="border p-2 rounded" value={vendorId} onChange={e=>setVendorId(Number(e.target.value))}>
              <option value="">Vendor</option>
              {vendors.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div className="border rounded p-3 bg-white">
            <div className="font-medium mb-2">Items</div>
            {lines.map((l,idx)=> (
              <div key={idx} className="grid md:grid-cols-4 gap-2 mb-2">
                <input placeholder="Item" value={l.item} onChange={e=>setLine(idx,{item:e.target.value})} className="border p-2 rounded" />
                <input placeholder="Qty" value={l.qty} onChange={e=>setLine(idx,{qty:e.target.value})} className="border p-2 rounded" />
                <input placeholder="Unit Price" value={l.unit} onChange={e=>setLine(idx,{unit:e.target.value})} className="border p-2 rounded" />
                <div className="flex items-center gap-2"><button type="button" onClick={()=>removeLine(idx)} className="border px-3 py-2 rounded">Remove</button></div>
              </div>
            ))}
            <button type="button" onClick={addLine} className="mt-1 border px-3 py-2 rounded">+ Add item</button>
          </div>

          <textarea placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} className="border p-2 rounded" />
          <button className="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded">Save PO</button>

        </form>
      </main>
    </>
  )
}
