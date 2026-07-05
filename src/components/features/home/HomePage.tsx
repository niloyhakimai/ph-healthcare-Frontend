import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import HomeFooter from "./HomeFooter";
import HomeHeader from "./HomeHeader";
import {
  homeAudienceCards,
  homeHeroSignals,
  homeJourneyStages,
  homePreviewSteps,
  homeServices,
  homeSpecialties,
  homeStats,
} from "./home-data";
import styles from "./home-page.module.css";

function SectionIntro({
  badge,
  title,
  description,
}: {
  badge: string;
  description: string;
  title: string;
}) {
  return (
    <div className="max-w-3xl">
      <Badge
        variant="outline"
        className="rounded-full border-[#0f766e]/15 bg-white/70 px-4 py-1.5 text-xs tracking-[0.28em] text-[#0f766e] uppercase"
      >
        {badge}
      </Badge>
      <h2 className={`${styles.display} mt-5 text-4xl text-[#12231f] sm:text-5xl`}>
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-[#52635f] sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <HomeHeader />

      <main className="relative pb-14">
        <section className="relative">
          <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 pt-8 pb-20 sm:px-8 lg:grid-cols-[minmax(0,42rem)_minmax(0,31rem)] lg:justify-between lg:gap-16 lg:px-10 lg:pb-24 xl:grid-cols-[minmax(0,44rem)_minmax(0,31rem)]">
            <div className="relative z-10 max-w-[42rem] lg:pt-3">
              <Badge className="rounded-full bg-[#12231f] px-4 py-1.5 text-xs tracking-[0.28em] text-white uppercase hover:bg-[#12231f]">
                Connected care, without the public-page chaos
              </Badge>

              <h1
                className={`${styles.display} mt-6 max-w-3xl text-5xl leading-[0.95] text-[#12231f] sm:text-6xl lg:text-7xl`}
              >
                A warmer, clearer homepage for the whole healthcare portal.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#52635f]">
                PH Healthcare can welcome visitors with a modern front door that
                introduces consultation, diagnostics, medicine, health plans,
                and NGO support while steering each person toward the right next
                step.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-[#0f766e] px-6 text-white hover:bg-[#0d6861]"
                >
                  <Link href="/consultation">
                    Explore consultation
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-[#12231f]/10 bg-white/70 px-6 text-[#12231f] hover:bg-white"
                >
                  <Link href="/register">Create your account</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {homeHeroSignals.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className={`${styles.softPanel} rounded-3xl p-4 shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-[#e4f4f2] text-[#0f766e]">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <p className="text-sm leading-6 text-[#314742]">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:w-full lg:max-w-[31rem] lg:justify-self-end">
              <div className={styles.heroGlow} />
              <div className={`${styles.panel} relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:mt-1`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium tracking-[0.22em] text-[#0f766e] uppercase">
                      Portal snapshot
                    </p>
                    <h2 className={`${styles.display} mt-3 text-3xl text-[#12231f] sm:text-4xl`}>
                      From homepage discovery to follow-up momentum
                    </h2>
                  </div>
                  <span
                    className={`${styles.metricPill} rounded-full px-4 py-2 text-sm font-medium`}
                  >
                    Public-facing entry redesign
                  </span>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className={`${styles.softPanel} rounded-[1.75rem] p-5`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#52635f]">
                          Today&apos;s care flow
                        </p>
                        <p className="mt-1 text-xl font-semibold text-[#12231f]">
                          Structured patient touchpoints
                        </p>
                      </div>
                      <span className="rounded-full bg-[#12231f] px-3 py-1 text-xs tracking-[0.2em] text-white uppercase">
                        Live
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      {homePreviewSteps.map((item) => (
                        <div
                          key={`${item.time}-${item.title}`}
                          className="flex items-center gap-4 rounded-2xl bg-white/70 px-4 py-3"
                        >
                          <div className={styles.statusDot} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#12231f]">
                              {item.title}
                            </p>
                            <p className="text-sm text-[#52635f]">{item.status}</p>
                          </div>
                          <span className="text-sm font-semibold text-[#0f766e]">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`${styles.softPanel} rounded-[1.75rem] p-5`}>
                      <p className="text-sm font-medium text-[#52635f]">
                        Common specialties
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {homeSpecialties.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[#12231f]/8 bg-white/70 px-3 py-2 text-sm text-[#314742]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`${styles.accentPanel} rounded-[1.75rem] p-5`}>
                      <p className="text-sm font-medium text-[#52635f]">
                        Homepage intent
                      </p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl bg-white/55 p-4">
                          <p className="text-sm font-semibold text-[#12231f]">
                            Reduce decision fatigue
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#52635f]">
                            Visitors see the whole ecosystem first, then choose
                            the lane that fits their situation.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/55 p-4">
                          <p className="text-sm font-semibold text-[#12231f]">
                            Create continuity across roles
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#52635f]">
                            Patients, doctors, and admins enter the same
                            platform story from different but connected angles.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-4 sm:px-8 lg:px-10">
          <div className="grid gap-4 lg:grid-cols-4">
            {homeStats.map(({ icon: Icon, value, label, description }) => (
              <Card
                key={label}
                className={`${styles.softPanel} border-0 py-0 shadow-none`}
              >
                <CardHeader className="gap-4 px-5 pt-5">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e4f4f2] text-[#0f766e]">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-4xl font-semibold text-[#12231f]">{value}</p>
                    <CardTitle className="mt-2 text-lg text-[#12231f]">
                      {label}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 text-sm leading-6 text-[#52635f]">
                  {description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionIntro
            badge="Service Lanes"
            title="Five public-facing paths, presented like one connected system"
            description="The homepage can introduce every major service with enough warmth and clarity that people understand where to go next without feeling pushed into a maze of links."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {homeServices.map(({ icon: Icon, title, description, eyebrow, href }) => (
              <Card
                key={title}
                className={`${styles.softPanel} h-full rounded-[1.75rem] border-0 py-0 shadow-none`}
              >
                <CardHeader className="px-6 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-[1.35rem] bg-[#e4f4f2] text-[#0f766e]">
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full border-[#12231f]/8 bg-white/70 px-3 py-1 text-[11px] tracking-[0.22em] text-[#52635f] uppercase"
                    >
                      {eyebrow}
                    </Badge>
                  </div>
                  <CardTitle className={`${styles.display} text-3xl text-[#12231f]`}>
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col px-6 pb-6 pt-0">
                  <p className="flex-1 text-base leading-7 text-[#52635f]">
                    {description}
                  </p>
                  <Link
                    href={href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0f766e]"
                  >
                    Open this section
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="journey" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionIntro
            badge="Care Journey"
            title="A homepage that guides people forward instead of making them decode the system"
            description="This direction treats the landing page as the first clinical coordination moment: orient the visitor, surface the right lane, and keep the next actions obvious."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {homeJourneyStages.map(({ icon: Icon, title, description, steps }) => (
              <Card
                key={title}
                className={`${styles.panel} rounded-[1.75rem] border-0 py-0`}
              >
                <CardHeader className="px-6 pt-6">
                  <div className="flex size-12 items-center justify-center rounded-[1.4rem] bg-[#12231f] text-white">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className={`${styles.display} text-3xl text-[#12231f]`}>
                    {title}
                  </CardTitle>
                  <p className="text-base leading-7 text-[#52635f]">{description}</p>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="space-y-3">
                    {steps.map((step) => (
                      <div
                        key={step}
                        className="flex items-start gap-3 rounded-2xl bg-white/65 px-4 py-3"
                      >
                        <div className="mt-1 flex size-5 items-center justify-center rounded-full bg-[#0f766e] text-white">
                          <Check className="size-3.5" aria-hidden />
                        </div>
                        <p className="text-sm leading-6 text-[#314742]">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="teams" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionIntro
            badge="Role Design"
            title="Built for every side of the healthcare operation"
            description="The best public homepage is honest about the platform behind it. These cards position the portal as a shared system with distinct value for patients, doctors, and administrators."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {homeAudienceCards.map(
              ({ icon: Icon, title, description, bullets, href, cta }) => (
                <Card
                  key={title}
                  className={`${styles.softPanel} h-full rounded-[1.75rem] border-0 py-0 shadow-none`}
                >
                  <CardHeader className="px-6 pt-6">
                    <div className="flex size-12 items-center justify-center rounded-[1.4rem] bg-[#fff] text-[#0f766e] shadow-sm">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle className={`${styles.display} text-3xl text-[#12231f]`}>
                      {title}
                    </CardTitle>
                    <p className="text-base leading-7 text-[#52635f]">{description}</p>
                  </CardHeader>
                  <CardContent className="flex h-full flex-col px-6 pb-6 pt-0">
                    <div className="flex-1 space-y-3">
                      {bullets.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <div className="mt-1.5 size-2 rounded-full bg-[#0f766e]" />
                          <p className="text-sm leading-6 text-[#314742]">{item}</p>
                        </div>
                      ))}
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="mt-7 w-full rounded-full border-[#12231f]/10 bg-white/75 text-[#12231f] hover:bg-white"
                    >
                      <Link href={href}>
                        {cta}
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
