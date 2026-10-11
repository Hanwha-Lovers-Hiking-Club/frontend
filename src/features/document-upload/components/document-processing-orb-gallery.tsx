"use client";

import Link from "next/link";

import { processingSteps } from "@/features/document-upload/config";
import { ParticlesOrb } from "@/features/document-upload/components/voice-orbs/particles-orb";
import { Button } from "@/components/ui/button";

export function DocumentProcessingOrbGallery() {
  return (
    <main className="app-page px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">ORB TEST LAB</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
              문서 처리 오브 상태
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
              실제 처리 화면과 동일한 단계 설정을 한곳에서 비교합니다. 모든 오브는 독립적으로 반복 재생됩니다.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950">
            <Link href="/upload">업로드 화면으로 돌아가기</Link>
          </Button>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {processingSteps.map((step, index) => (
            <article
              key={`${step.label}-${step.progress}`}
              className="flex min-h-[25rem] flex-col overflow-hidden rounded-[1.5rem] border border-zinc-200/90 bg-white shadow-[0_18px_40px_-34px_rgba(24,36,31,0.5)]"
            >
              <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
                <div>
                  <p className="font-mono text-xs tabular-nums text-zinc-400">0{index + 1}</p>
                  <h2 className="mt-1 text-base font-semibold tracking-[-0.02em] text-zinc-900">{step.label}</h2>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-600">
                  {step.orb.state}
                </span>
              </header>

              <div className="grid flex-1 place-items-center bg-zinc-50/70 px-5 py-6">
                <ParticlesOrb
                  state={step.orb.state}
                  size={184}
                  speed={step.orb.speed}
                  colorFrom={step.orb.colorFrom}
                  colorTo={step.orb.colorTo}
                  particleCount={step.orb.particleCount}
                  motion={step.orb.motion}
                  label={`${step.label} 오브`}
                />
              </div>

              <footer className="flex items-center justify-between gap-3 px-5 py-4 text-xs text-zinc-500">
                <span className="font-mono tabular-nums">{step.progress}%</span>
                <span className="font-mono tabular-nums">speed {step.orb.speed}×</span>
                <span className="flex items-center gap-1.5">
                  <i
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: step.orb.colorFrom }}
                  />
                  <i
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: step.orb.colorTo }}
                  />
                </span>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
