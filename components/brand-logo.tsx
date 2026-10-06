import * as React from "react";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-blue-500/20 shadow-[0_0_25px_rgba(45,212,191,0.18)]">
        <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2.3" className="text-teal-600 dark:text-teal-300" opacity="0.9" />
          <path d="M20 30.5V33.5M28 25.5V38.5M36 22.5V41.5M44 28.5V35.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-emerald-600 dark:text-emerald-300" />
          <path d="M22 22.5C24.5 20.5 27.5 19.5 32 19.5C36.5 19.5 39.5 20.5 42 22.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" className="text-sky-500 dark:text-sky-300" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          VocalHealth
        </div>
        <div className="text-[0.63rem] font-medium uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">
          AI
        </div>
      </div>
    </div>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-blue-500/20 shadow-[0_0_20px_rgba(45,212,191,0.15)] ${className}`}>
      <svg viewBox="0 0 64 64" className="h-6 w-6" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2.5" className="text-teal-600 dark:text-teal-300" />
        <path d="M20 30V34M27 26V38M34 23V41M41 28V36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-emerald-600 dark:text-emerald-300" />
      </svg>
    </div>
  );
}
