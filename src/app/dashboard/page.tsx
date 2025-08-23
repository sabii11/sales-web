'use client'
import Nav from '@/app/components/Nav'
import RequireAuth from '@/app/components/RequireAuth'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'

export default function Dashboard() {
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [sales, setSales] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

  // Load data for selected month
  useEffect(() => {
    (async () => {
      const start = `${month}-01`
      const endDate = new Date(start)
      endDate.setMonth(endDate.getMonth() + 1)
      const end = endDate.toISOString().slice(0, 10)

      const { data: s } = await supabase
        .from('sales')
        .select('date, gross, branches(name)')
        .gte('date', start)
        .lt('date', end)
        .order('date')

      setSales(s || [])

      const { data: e } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', start)
        .lt('date', end)

      setExpenses(e || [])
      setSelectedBranch(null)
    })()
  }, [month])

  const totalSales = useMemo(
    () => sales.reduce((t, x) => t + Number(x.gross || 0), 0),
    [sales]
  )
  const totalExp = useMemo(
    () => expenses.reduce((t, x) => t + Number(x.amount || 0), 0),
    [expenses]
  )
  const profit = totalSales - totalExp

  // Aggregate by branch for the main chart
  const byBranch: Record<string, number> = {}
  sales.forEach((r) => {
    const name = r.branches?.name || 'Unknown'
    byBranch[name] = (byBranch[name] || 0) + Number(r.gross || 0)
  })

  // Daily data for selected branch (second chart)
  const daily = useMemo(() => {
    if (!selectedBranch) return { labels: [], data: [] as number[] }
    const map = new Map<string, number>()
    sales
      .filter((r) => (r.branches?.name || 'Unknown') === selectedBranch)
      .forEach((r) => {
        map.set(r.date, (map.get(r.date) || 0) + Number(r.gross || 0))
      })
    const labels = Array.from(map.keys()).sort()
    const data = labels.map((l) => map.get(l) || 0)
    return { labels, data }
  }, [selectedBranch, sales])

  return (
    <>
      <RequireAuth />
      <Nav />

      <main className="max-w-6xl mx-auto p-4">
        {/* Header: title + month picker. Wraps on mobile. */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>

          {/* Month picker */}
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full sm:w-48 border border-slate-300 bg-white text-slate-900 p-2 rounded-lg pr-10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {/* calendar icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M7 3v3M17 3v3M3 9h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Stat cards: stack on mobile, 2-up on small, 3-up on large */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Total Sales</div>
            <div className="text-2xl font-bold text-slate-900">£{totalSales.toLocaleString()}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Total Expenses</div>
            <div className="text-2xl font-bold text-slate-900">£{totalExp.toLocaleString()}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-700">Profit</div>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              £{profit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Main chart by branch */}
<div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-4">
  {/* Give the chart a fixed height so mobile Safari can't stretch it */}
  <div className="relative h-80"> {/* 20rem ≈ 320px */}
    <Bar
      data={{
        labels: Object.keys(byBranch),
        datasets: [
          {
            label: 'Sales by Branch',
            data: Object.values(byBranch) as number[],
            backgroundColor: 'rgba(14,116,144,0.35)',
            borderColor: 'rgba(14,116,144,0.9)',
            borderWidth: 1,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,   // <- important
        resizeDelay: 200,             // smooth out Safari resize thrash
        animation: false,             // prevents height creep
        onClick: (_evt, elements) => {
          if (elements.length) {
            const idx = (elements[0] as any).index as number
            setSelectedBranch(Object.keys(byBranch)[idx])
          }
        },
        plugins: { legend: { position: 'top' as const } },
        scales: {
          y: { grid: { color: '#edf2f7' } },
          x: { grid: { display: false } },
        },
      }}
    />
  </div>
</div>


      {/* Daily chart for selected branch (when a bar is tapped) */}
{selectedBranch && (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h2 className="font-medium text-slate-800">Daily sales: {selectedBranch}</h2>
      <button
        className="text-sm text-slate-600 underline"
        onClick={() => setSelectedBranch(null)}
      >
        clear
      </button>
    </div>

    {/* Fixed height to stop endless growth on mobile */}
    <div className="relative h-72"> {/* 18rem ≈ 288px */}
      <Bar
        data={{
          labels: daily.labels,
          datasets: [
            {
              label: 'Daily Gross',
              data: daily.data,
              backgroundColor: 'rgba(99,102,241,0.35)',
              borderColor: 'rgba(99,102,241,0.9)',
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false, // <- important
          resizeDelay: 200,
          animation: false,
          scales: {
            y: { grid: { color: '#edf2f7' } },
            x: { grid: { display: false } },
          },
        }}
      />
    </div>
  </div>
)}

      </main>
    </>
  )
}
