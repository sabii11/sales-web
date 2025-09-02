'use client'
import Nav from '@/app/components/Nav'
import RequireAuth from '@/app/components/RequireAuth'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type Branch = { id: number; name: string }

export default function NewSale() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [branchId, setBranchId] = useState<number | ''>('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [cash, setCash] = useState<number | ''>('')
  const [card, setCard] = useState<number | ''>('')
  const [online, setOnline] = useState<number | ''>('')       // existing field
  const [justEat, setJustEat] = useState<number | ''>('')     // NEW
  const [uberEats, setUberEats] = useState<number | ''>('')   // NEW
  const [clickCollect, setClickCollect] = useState<number | ''>('') // NEW
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('branches').select('id,name').order('name')
      setBranches(data || [])
    })()
  }, [])

  // helper
  const n = (v: number | '' ) => Number(v || 0)

  async function save() {
    setSaving(true); setMsg('')
    const total = n(cash)+n(card)+n(online)+n(justEat)+n(uberEats)+n(clickCollect)

    // who creates
    const { data: u } = await supabase.auth.getUser()
    const created_by = u?.user?.id

    const { error } = await supabase.from('sales').insert({
      date,
      branch_id: branchId || null,
      // we keep your DB's 'gross' as the total of all channels
      gross: total,
      cash: n(cash),
      card: n(card),
      online: n(online),
      just_eat: n(justEat),          // NEW
      uber_eats: n(uberEats),        // NEW
      click_collect: n(clickCollect),// NEW
      notes,
      created_by,
    })

    setSaving(false)
    if (error) { setMsg(error.message); return }
    setMsg('Saved!')
    // reset amounts only
    setCash(''); setCard(''); setOnline(''); setJustEat(''); setUberEats(''); setClickCollect(''); setNotes('')
  }

  return (
    <>
      <RequireAuth />
      <Nav />
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="heading mb-4">Add Daily Sales</h1>

        <div className="space-y-3">
          <input type="date" className="field w-full" value={date} onChange={e=>setDate(e.target.value)} />

          <select className="field w-full" value={branchId} onChange={e=>setBranchId(Number(e.target.value)||'')}>
            <option value="">Select Branch</option>
            {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <input className="field w-full" placeholder="Cash (£)" inputMode="decimal" value={cash} onChange={e=>setCash(e.target.value as any)} />
          <input className="field w-full" placeholder="Card (£)" inputMode="decimal" value={card} onChange={e=>setCard(e.target.value as any)} />
          <input className="field w-full" placeholder="Online (£)" inputMode="decimal" value={online} onChange={e=>setOnline(e.target.value as any)} />

          {/* NEW CHANNELS */}
          <input className="field w-full" placeholder="Just Eat (£)" inputMode="decimal" value={justEat} onChange={e=>setJustEat(e.target.value as any)} />
          <input className="field w-full" placeholder="Uber Eats (£)" inputMode="decimal" value={uberEats} onChange={e=>setUberEats(e.target.value as any)} />
          <input className="field w-full" placeholder="Click & Collect (£)" inputMode="decimal" value={clickCollect} onChange={e=>setClickCollect(e.target.value as any)} />

          <textarea className="field w-full" placeholder="Notes" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />

          <button disabled={saving} onClick={save} className="w-full btn-black">
            {saving ? 'Saving…' : 'Save'}
          </button>

          {msg ? <div className="text-sm text-green-700">{msg}</div> : null}
        </div>
      </main>
    </>
  )
}

/* utilities from globals.css:
.heading { ... } .field { ... } .btn-black { ... }
*/
