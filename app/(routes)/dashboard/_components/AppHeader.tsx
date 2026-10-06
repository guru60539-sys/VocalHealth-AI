"use client";

import { UserDetailCotext } from "@/context/UserDetailContext";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useContext } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";

const menuOptions = [
  { name: "Overview", path: "/dashboard" },
  { name: "History", path: "/history" },
  { name: "Profile", path: "/dashboard/profile" },
];

function AppHeader() {
  const { UserDetail } = useContext(UserDetailCotext);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-7">
        <Link href="/" aria-label="VocalHealth home"><BrandLogo /></Link>
        <nav className="hidden items-center gap-1 rounded-xl border border-border/70 bg-card/70 p-1 md:flex">
          {menuOptions.map((option) => {
            const active = pathname === option.path;
            return (
              <Link
                key={option.path}
                href={option.path}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                {option.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5">
          <div className="hidden rounded-xl border border-border bg-card px-3 py-2 text-xs sm:block">
            <span className="text-muted-foreground">Available credits</span>
            <span className="ml-2 font-semibold text-foreground">{UserDetail?.credits ?? "—"}</span>
          </div>
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
      <nav aria-label="Main navigation" className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {menuOptions.map((option) => {
          const active = pathname === option.path;
          return (
            <Link key={option.path} href={option.path} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}>
              {option.name}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export default AppHeader;
