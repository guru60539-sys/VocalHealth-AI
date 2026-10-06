"use client";

import { motion } from "motion/react";
import { ArrowRight, AudioLines, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { user } = useUser();

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="VocalHealth AI home"><BrandLogo /></Link>
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link href="#how-it-works" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">How it works</Link>
          <ThemeToggle />
          {user ? (
            <>
              <UserButton />
              <Button asChild className="rounded-xl">
                <Link href="/dashboard">Dashboard <ArrowRight /></Link>
              </Button>
            </>
          ) : (
            <Button asChild className="rounded-xl px-5">
              <Link href="/sign-in">Sign in <ArrowRight /></Link>
            </Button>
          )}
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-16">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3.5 py-2 text-sm font-medium text-primary shadow-sm">
              <Sparkles className="h-4 w-4" /> Thoughtful care, powered by AI
            </div>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[4.35rem]">
              A clearer path to <span className="text-primary">better health.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Talk through your concerns with a voice-first AI health assistant. Get helpful guidance, understand your next steps, and keep your care history in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl px-6 shadow-lg shadow-primary/15">
                <Link href="/dashboard">Start a consultation <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-border bg-card/70 px-6">
                <Link href="#how-it-works">Explore the platform</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Private by design</span>
              <span className="inline-flex items-center gap-2"><AudioLines className="h-4 w-4 text-primary" /> Natural voice conversations</span>
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-emerald-200/40 via-transparent to-teal-200/30 blur-2xl dark:from-emerald-400/10 dark:to-teal-300/10" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-5 shadow-[0_30px_100px_-35px_rgba(15,75,65,0.24)] sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your care space</div>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">How are you feeling today?</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><HeartPulse className="h-5 w-5" /></div>
            </div>
            <div className="mt-6 rounded-2xl bg-muted/70 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><AudioLines className="h-4 w-4" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Your AI care assistant</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">“Tell me what’s been on your mind. We can take it one step at a time.”</p>
                </div>
              </div>
              <div className="mt-6 flex h-20 items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-card/75">
                {[14, 26, 38, 20, 46, 30, 54, 25, 40, 18, 34, 48, 22, 37, 17, 29, 44, 24, 35, 16, 41, 27, 50, 20].map((height, index) => (
                  <span key={index} className="w-1 rounded-full bg-primary/75" style={{ height }} />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Voice support, whenever you need it</span><span>Secure session</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/80 p-4">
                <div className="text-2xl font-semibold tracking-tight">24/7</div>
                <div className="mt-1 text-xs text-muted-foreground">Always available</div>
              </div>
              <div className="rounded-2xl border border-border/80 p-4">
                <div className="text-2xl font-semibold tracking-tight">1:1</div>
                <div className="mt-1 text-xs text-muted-foreground">Personalized guidance</div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div><div className="text-sm font-semibold">Your wellbeing comes first</div><div className="text-xs text-muted-foreground">Guidance, not a diagnosis</div></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border/70 bg-card/45">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[.8fr_1.2fr] md:items-center md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Care, made more accessible</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Support that meets you where you are.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Share what you’re experiencing in your own words. VocalHealth helps connect you with the right specialist assistant, keeps your sessions organized, and makes it easier to revisit your conversations.
          </p>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <BrandLogo className="scale-[.88] origin-left" />
        <p>© {new Date().getFullYear()} VocalHealth AI. Care conversations, made clearer.</p>
      </footer>
    </main>
  );
}
