"use client"
import React, { useContext, useEffect, useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Calendar, MessageSquare, Users, TrendingUp } from 'lucide-react'
import axios from 'axios'
import { UserDetailCotext } from '@/context/UserDetailContext'

type ConsultationStats = {
  totalConsultations: number
  lastConsultation: string
  assistantUsage: {
    [specialist: string]: {
      count: number
    }
  }
}

function ProfilePage() {
  const { user } = useUser()
  const { UserDetail } = useContext(UserDetailCotext) || {}
  const [stats, setStats] = useState<ConsultationStats>({
    totalConsultations: 0,
    lastConsultation: 'No consultations yet',
    assistantUsage: {}
  })

  useEffect(() => {
    const loadFromApi = async () => {
      try{
        const res = await axios.get('/api/session-chat?sessionId=all')
        const sessions = Array.isArray(res.data) ? res.data : []
        const totalConsultations = sessions.length
        const last = sessions
          .map((s:any)=>s.createdOn)
          .filter(Boolean)
          .sort((a:any,b:any)=> new Date(b).getTime() - new Date(a).getTime())[0]
          || 'No consultations yet'
        const usage:Record<string,{count:number}> = {}
        sessions.forEach((s:any)=>{
          const spec = s?.selectedDoctor?.specialist || 'Unknown'
          usage[spec] = { count: (usage[spec]?.count || 0) + 1 }
        })
        setStats({
          totalConsultations,
          lastConsultation: last,
          assistantUsage: usage as any
        } as ConsultationStats)
      }catch(e){
        // ignore for now
      }
    }
    loadFromApi()
  }, [])

  const formatDate = (dateString: string) => {
    if (dateString === 'No consultations yet') return dateString
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header & User Info */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserButton/>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Hello, {UserDetail?.name || user?.fullName || 'User'}</h1>
                <p className="text-sm text-muted-foreground">Your account and consultation activity</p>
              </div>
            </div>
          </div>

          {/* Inline user details */}
          <div className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-muted/70 p-4">
              <p className="text-muted-foreground">Name</p>
              <p className="mt-1 font-medium">{UserDetail?.name || user?.fullName || '—'}</p>
            </div>
            <div className="rounded-xl bg-muted/70 p-4">
              <p className="text-muted-foreground">Email</p>
              <p className="mt-1 break-all font-medium">{UserDetail?.email || user?.primaryEmailAddress?.emailAddress || '—'}</p>
            </div>
            
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Consultations</p>
                <p className="text-2xl font-semibold">{stats.totalConsultations}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Calendar className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Consultation</p>
                <p className="text-sm font-medium">{formatDate(stats.lastConsultation)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Most Used Assistant</p>
                <p className="text-sm font-medium">
                  {Object.keys(stats.assistantUsage).length > 0 
                    ? Object.entries(stats.assistantUsage).sort((a, b) => b[1].count - a[1].count)[0][0]
                    : 'None'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assistant Usage Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Assistant Usage Breakdown</h2>
          <div className="space-y-4">
            {Object.keys(stats.assistantUsage).length > 0 ? (
              Object.entries(stats.assistantUsage)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([specialist, data]) => (
                  <div key={specialist} className="flex items-center justify-between rounded-xl bg-muted/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{specialist}</p>
                        <p className="text-sm text-muted-foreground">{data.count} consultations</p>
                      </div>
                    </div>
                    <div className="text-right" />
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
                <p className="text-muted-foreground">No consultation data available yet</p>
                <p className="text-sm text-muted-foreground">Start your first consultation to see statistics here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
