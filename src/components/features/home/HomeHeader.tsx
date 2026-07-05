import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { homeNavLinks } from "./home-data";
import styles from "./home-page.module.css";

export default function HomeHeader() {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:px-10">
        <Link href="/" className="flex items-center gap-3 lg:justify-self-start">
          <span
            className={`${styles.brandMark} flex size-11 items-center justify-center rounded-2xl text-sm font-semibold tracking-[0.24em] text-white`}
          >
            PH
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.28em] text-[#0f766e] uppercase">
              PH Healthcare
            </span>
            <span className="text-sm text-[#52635f]">
              Coordinated care portal
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[#38504b] lg:flex lg:justify-self-center">
          {homeNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[#12231f]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex lg:justify-self-end">
          <Button
            asChild
            variant="ghost"
            className="text-[#12231f] hover:bg-white/60"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-[#12231f] px-5 text-white hover:bg-[#0c1816]"
          >
            <Link href="/consultation">
              Find a doctor
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 pb-3 text-sm sm:px-8 lg:hidden lg:px-10">
        {homeNavLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-white/60 bg-white/55 px-4 py-2 whitespace-nowrap text-[#38504b] shadow-sm backdrop-blur"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
