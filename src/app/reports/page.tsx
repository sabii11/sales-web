'use client';
import Nav from '../components/Nav';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export default function Reports(){
  const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const [rows,setRows]=useState<any[]>([]);

  useEffect(()=>{(async()=>{
    const start=month+'-01';
    const end=new Date(new Date(start).setMonth(new Date(start).getMonth()+1)).toISOString().slice(0,10);
    const { data } = await supabase
      .from('sales')
      .select('date, gross, net, cash, card, online, notes, branches(name)')
      .gte('date', start).lt('date', end).order('date');
    setRows(data||[]);
  })();},[month]);

  function downloadXLSX(){
    const sheetData = [['Date','Branch','Gross','Net','Cash','Card','Online','Notes'], ...rows.map(r=>[
      r.date, r.branches?.name, r.gross, r.net, r.cash, r.card, r.online, r.notes||''
    ])];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `monthly_${month}.xlsx`);
  }

  function downloadCSV(){
    const headers = ['Date','Branch','Gross','Net','Cash','Card','Online','Notes'];
    const lines = rows.map(r=>[r.date, r.branches?.name, r.gross, r.net, r.cash, r.card, r.online, (r.notes||'').replace(/\n/g,' ')].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`monthly_${month}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <Nav/>
      <main className="max-w-lg mx-auto p-4">
        <h1 className="text-xl font-semibold mb-3">Reports</h1>
        <div className="flex gap-2 items-center mb-3">
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border p-2 rounded" />
          <button onClick={downloadXLSX} className="bg-black text-white px-3 py-2 rounded">Excel</button>
          <button onClick={downloadCSV} className="border px-3 py-2 rounded">CSV</button>
        </div>
      </main>
    </>
  );
}
