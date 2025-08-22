'use client';
import RequireAuth from '@/app/components/RequireAuth'
import Nav from '../../components/Nav';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function NewSale(){
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [gross,setGross]=useState('');
  const [cash,setCash]=useState('');
  const [card,setCard]=useState('');
  const [online,setOnline]=useState('');
  const [notes,setNotes]=useState('');
  const [branches,setBranches]=useState<any[]>([]);
  const [profile,setProfile]=useState<any>(null);
  const [branchId,setBranchId]=useState<number|undefined>();

  useEffect(()=>{(async()=>{
    const { data: prof } = await supabase.from('profiles').select('*').single();
    setProfile(prof); if (prof?.role==='branch') setBranchId(prof.branch_id);
    const { data: b } = await supabase.from('branches').select('id,name').eq('is_active', true);
    setBranches(b||[]);
  })();},[]);

  async function save(e:any){
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;
    const payload:any={ date, gross:Number(gross||0), cash:Number(cash||0), card:Number(card||0), online:Number(online||0), notes, created_by: user?.id };
    if (profile?.role==='admin') payload.branch_id=branchId; else payload.branch_id=profile?.branch_id;
    const { error } = await supabase.from('sales').insert(payload);
    if (error) return alert(error.message);
    alert('Saved');
  }

  return (
    <>
    <RequireAuth />
      <Nav/>
      <main className="max-w-lg mx-auto p-4">
        <h1 className="text-xl font-semibold mb-3">Add Daily Sales</h1>
        <form onSubmit={save} className="space-y-3">
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border p-2 rounded" />
          {profile?.role==='admin' && (
            <select className="w-full border p-2 rounded" value={branchId} onChange={e=>setBranchId(Number(e.target.value))}>
              <option value="">Select Branch</option>
              {branches.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <input placeholder="Gross (£)" className="w-full border p-2 rounded" value={gross} onChange={e=>setGross(e.target.value)} />
          <input placeholder="Cash (£)" className="w-full border p-2 rounded" value={cash} onChange={e=>setCash(e.target.value)} />
          <input placeholder="Card (£)" className="w-full border p-2 rounded" value={card} onChange={e=>setCard(e.target.value)} />
          <input placeholder="Online (£)" className="w-full border p-2 rounded" value={online} onChange={e=>setOnline(e.target.value)} />
          <textarea placeholder="Notes" className="w-full border p-2 rounded" value={notes} onChange={e=>setNotes(e.target.value)} />
          <button className="w-full bg-black text-white p-2 rounded">Save</button>
        </form>
      </main>
    </>
  );
}
