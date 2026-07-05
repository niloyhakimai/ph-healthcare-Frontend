import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  homeFooterAccessLinks,
  homeFooterExploreLinks,
} from "./home-data";
import styles from "./home-page.module.css";

export default function HomeFooter() {
  return (
    <footer id="footer" className="mx-auto max-w-7xl px-6 pb-10 sm:px-8 lg:px-10">
      <div className={`${styles.footerPanel} overflow-hidden rounded-[2rem] p-8 text-white sm:p-10`}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span
                className={`${styles.brandMark} flex size-11 items-center justify-center rounded-2xl text-sm font-semibold tracking-[0.24em] text-white`}
              >
                PH
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.28em] text-[#8dd7d1] uppercase">
                  PH Healthcare
                </p>
                <p className="text-sm text-white/70">
                  Public care access with structured operational depth.
                </p>
              </div>
            </div>

            <h2 className={`${styles.display} max-w-xl text-3xl sm:text-4xl`}>
              Ready to turn the portal into a stronger digital front door?
            </h2>
            <p className="max-w-xl text-base leading-7 text-white/80">
              Start with consultation, guide visitors into the right care lane,
              and keep patients, doctors, and admins connected through one
              calmer experience.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-[#f3b44b] px-5 text-[#12231f] hover:bg-[#f0a92d]"
              >
                <Link href="/register">
                  Create account
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/consultation">Explore consultation</Link>
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#8dd7d1] uppercase">
              Explore
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {homeFooterExploreLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base text-white/80 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[#8dd7d1] uppercase">
              Access
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {homeFooterAccessLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base text-white/80 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-sm text-white/58">
          PH Healthcare homepage concept for the public-facing entry experience.
        </div>
      </div>
    </footer>
  );
}
