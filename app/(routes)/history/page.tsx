"use client"
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import moment from 'moment'
import ViewConversationDialog from '../dashboard/_components/ViewConversationDialog'
import ViewReportDialog from '../dashboard/_components/ViewReportDialog'
import { sessionDetail } from '../dashboard/medical-agent/[sessionId]/page'

function HistoryPage() {
  const [items, setItems] = useState<sessionDetail[]>([])
  const [filter, setFilter] = useState<string>('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    const load = async ()=>{
      try{
        setLoading(true)
        setError(null)
        const res = await axios.get('/api/session-chat?sessionId=all')
        setItems(res.data || [])
      } catch (e: any) {
        console.error("History fetch error:", e)
        setError(e.response?.data?.error || "Failed to load history. Please check your database connection.")
      } finally{
        setLoading(false)
      }
    }
    load()
  },[])

  const specialists = useMemo(()=>{
    const set = new Set<string>()
    items.forEach(i => { if (i?.selectedDoctor?.specialist) set.add(i.selectedDoctor.specialist) })
    return ['All', ...Array.from(set)]
  }, [items])

  const filtered = useMemo(()=>{
    if (filter === 'All') return items
    return items.filter(i => i?.selectedDoctor?.specialist === filter)
  }, [items, filter])

  return (
    <div className='mx-auto max-w-6xl px-1 py-2 sm:px-3'>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your care timeline</p>
      <h1 className='mt-1 text-3xl font-semibold tracking-tight'>Consultation history</h1>
      <div className='mt-2 mb-6 flex items-center gap-3'>
        <p className='text-sm text-muted-foreground'>Your recent consultations and conversations</p>
        <div className='ml-auto'>
          <select aria-label="Filter by specialist" className='rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring' value={filter} onChange={e=>setFilter(e.target.value)}>
            {specialists.map((s, idx)=> <option key={idx} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center p-12'>
          <p className='animate-pulse text-lg text-muted-foreground'>Loading consultations...</p>
        </div>
      ) : error ? (
        <div className='rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive'>
          <p className='font-semibold'>Error Loading History</p>
          <p className='text-sm mt-1'>{error}</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {items.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center text-muted-foreground'>
              No previous conversations found.
            </div>
          ) : (
             filtered.map((rec, idx)=> (
                <div key={idx} className='flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:p-5'>
                  <div className="min-w-0">
                    <p className='font-semibold'>{rec.selectedDoctor?.specialist}</p>
                    <p className='mt-1 line-clamp-1 text-sm text-muted-foreground'>{rec.notes || 'No additional notes'}</p>
                    <p className='mt-2 text-xs text-muted-foreground'>{moment(new Date(rec.createdOn)).format('MMM D, YYYY · h:mm A')}</p>
                  </div>
                  <div className='flex gap-2'>
                    <ViewConversationDialog record={rec}/>
                    <ViewReportDialog record={rec}/>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage

