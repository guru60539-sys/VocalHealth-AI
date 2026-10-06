"use client"
import React, { useContext } from 'react'
import HistoryList from './_components/HistoryList'
import DoctorsAgentList from './_components/DoctorsAgentList'
import AddNewSessionDialog from './_components/AddNewSessionDialog'
import { Activity, ArrowUpRight, FileText, Mic, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { UserDetailCotext } from '@/context/UserDetailContext'

function Dashboard() {
  const { UserDetail } = useContext(UserDetailCotext) || {}
  const { user } = useUser()

  const stats = [
    { label: 'Voice Assessments', value: UserDetail?.credits ? `${Math.max(1, 8 - UserDetail.credits)} started` : 'Ready', icon: Mic },
    { label: 'Latest Analysis', value: 'Updated today', icon: FileText },
    { label: 'Health Insights', value: '3 summaries', icon: Stethoscope },
    { label: 'Recent Activity', value: '12 mins ago', icon: Activity },
  ]

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-border bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:from-emerald-950/25 dark:via-slate-900 dark:to-sky-950/20 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Activity className="h-3.5 w-3.5" />
              Your care, at a glance
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {user?.firstName ? `Hi, ${user.firstName}` : 'Welcome to your care space'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Connect with an AI specialist, continue where you left off, and keep your health conversations organized.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Private, voice-first support when you need it
            </div>
          </div>
          <div className="shrink-0"><AddNewSessionDialog /></div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-[1.4rem] border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-sky-500/15 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{stat.value}</p>
            </div>
          )
        })}
      </section>

      <section className="rounded-[1.8rem] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Overview</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Voice Health Overview</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Privacy-aware review
          </span>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { label: 'Signal clarity', value: '82%', level: 'bg-emerald-500' },
            { label: 'Response pace', value: '74%', level: 'bg-sky-500' },
            { label: 'Engagement', value: '89%', level: 'bg-violet-500' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-[1.25rem] border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-base font-semibold text-foreground">{metric.value}</span>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`h-full rounded-full ${metric.level}`} style={{ width: metric.value }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Recent activity</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Consultation history</h2>
          </div>
          <Link href="/history" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View history
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <HistoryList />
      </section>

      <DoctorsAgentList />
    </div>
  )
}

export default Dashboard
