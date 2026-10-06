import { SignUp } from '@clerk/nextjs'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute left-5 top-5 sm:left-8 sm:top-8"><BrandLogo /></div>
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8"><ThemeToggle /></div>
      <section className="relative w-full max-w-md rounded-[1.75rem] border border-border bg-card/90 p-5 shadow-2xl shadow-primary/5 backdrop-blur sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Begin your care journey</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">A more personal way to organize your health conversations.</p>
        </div>
        <div className="flex justify-center">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "var(--primary)",
                colorPrimaryForeground: "var(--primary-foreground)",
                colorBackground: "var(--card)",
                colorForeground: "var(--foreground)",
                colorInput: "var(--background)",
                borderRadius: "0.75rem",
              },
            }}
          />
        </div>
      </section>
    </main>
  )
}