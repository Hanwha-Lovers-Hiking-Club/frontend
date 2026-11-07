"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { processingSteps } from "@/features/document-upload/config";
import { UploadProcessingState } from "@/features/document-upload/components/document-upload-processing-state";
import { ParticlesOrb } from "@/features/document-upload/components/voice-orbs/particles-orb";
import type { ProcessingStep } from "@/features/document-upload/types";

const DEFAULT_ORB_SIZE = 164;
const MINIMUM_PREVIEW_DURATION_MS = 1_000;
const measuredStepDurations = [4_700, MINIMUM_PREVIEW_DURATION_MS, 17_900, 11_000, 15_500, 2_100, MINIMUM_PREVIEW_DURATION_MS, 1_200, MINIMUM_PREVIEW_DURATION_MS];

const legacyProcessingSteps = [
  {
    label: "파일을 업로드할 준비를 하는 중",
    progress: 16,
    orb: {
      state: "idle",
      speed: 0.8,
      colorFrom: "#7766f8",
      colorTo: "#38c7e8",
      motion: { spin: 0.55, breathe: 0.15, breatheRate: 1.8, drift: 0.45 },
    },
  },
  {
    label: "문서 구조를 읽는 중",
    progress: 32,
    orb: { state: "listening", speed: 0.5, colorFrom: "#7766f8", colorTo: "#38c7e8" },
  },
  {
    label: "핵심 내용을 추출하는 중",
    progress: 48,
    orb: { state: "thinking", speed: 1, colorFrom: "#7766f8", colorTo: "#38c7e8" },
  },
  {
    label: "지식카드 초안을 구성하는 중",
    progress: 66,
    orb: { state: "speaking", speed: 0.8, colorFrom: "#7766f8", colorTo: "#38c7e8" },
  },
  {
    label: "문서 간 관계를 연결하는 중",
    progress: 84,
    orb: {
      state: "connecting",
      speed: 0.5,
      colorFrom: "#7766f8",
      colorTo: "#38c7e8",
      motion: { scale: 0.7, ringWidth: 0.2 },
    },
  },
  {
    label: "지식카드를 마무리하는 중",
    progress: 100,
    orb: {
      state: "idle",
      size: 256,
      speed: 1.2,
      particleCount: 960,
      colorFrom: "#18a89b",
      colorTo: "#90e3c2",
      motion: { drift: 0.45 },
    },
  },
] as const satisfies readonly ProcessingStep[];

function OrbStepGrid({ steps, labelPrefix }: { steps: readonly ProcessingStep[]; labelPrefix: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {steps.map((step, index) => (
        <section
          key={step.label}
          className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-[0_18px_40px_-34px_rgba(24,36,31,0.5)]"
        >
          <header className="flex items-start gap-3 border-b border-zinc-100 px-4 py-3.5">
            <span className="mt-0.5 font-mono text-xs tabular-nums text-zinc-400">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-sm font-semibold leading-5 text-zinc-900">{step.label}</h2>
          </header>

          <div className="grid min-h-56 place-items-center bg-zinc-50/65 px-5 py-5">
            <ParticlesOrb
              state={step.orb.state}
              size={step.orb.size ?? DEFAULT_ORB_SIZE}
              speed={step.orb.speed}
              colorFrom={step.orb.colorFrom}
              colorTo={step.orb.colorTo}
              accentColor={step.orb.accentColor}
              accentRatio={step.orb.accentRatio}
              particleCount={step.orb.particleCount}
              motion={step.orb.motion}
              label={`${labelPrefix} ${index + 1}단계: ${step.label}`}
            />
          </div>

          <footer className="flex items-center justify-between px-4 py-4 text-xs text-zinc-500">
            <span>{step.orb.state}</span>
            <span className="font-mono tabular-nums">{step.progress}%</span>
          </footer>
        </section>
      ))}
    </div>
  );
}

function ProcessingPreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const timer = window.setTimeout(() => {
      if (activeStep === measuredStepDurations.length - 1) {
        setIsComplete(true);
      } else {
        const nextStep = activeStep + 1;
        setActiveStep(nextStep);
      }
    }, measuredStepDurations[activeStep]);
    return () => window.clearTimeout(timer);
  }, [activeStep, isComplete]);

  const replay = () => {
    setActiveStep(0);
    setIsComplete(false);
  };

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-zinc-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">MEASURED PREVIEW</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-zinc-950">실측 시간 처리 화면</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            <code>chunk</code>와 저장 단계는 최소 1초로 표시하며 완료 오브는 완료 이벤트 뒤에만 나타납니다.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={replay} className="w-fit rounded-xl">
          다시 재생
        </Button>
      </div>
      <UploadProcessingState
        activeStep={activeStep}
        documentCount={1}
        isJobStarted
        createdCardCount={4}
        status={isComplete ? "complete" : "processing"}
        onReset={replay}
      />
    </section>
  );
}

export function DocumentProcessingOrbGallery() {
  return (
    <main className="app-page px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">ANIMATION LAB</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
              문서 처리 오브 애니메이션
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
              업로드 과정의 9개 단계에서 사용되는 오브 애니메이션을 한눈에 확인합니다.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950">
            <Link href="/upload">업로드 화면으로 돌아가기</Link>
          </Button>
        </header>

        <ProcessingPreview />

        <section className="mt-14 border-t border-zinc-200 pt-8">
          <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">CURRENT VERSION</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">현재 9단계 오브 매핑</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            목록은 9단계를 유지하고, 중앙 오브는 기존 6단계 애니메이션 패턴을 재사용합니다.
          </p>
          <div className="mt-6">
            <OrbStepGrid steps={processingSteps} labelPrefix="현재" />
          </div>
        </section>

        <section className="mt-14 border-t border-zinc-200 pt-8">
          <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">PREVIOUS VERSION</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">기존 6단계 오브 애니메이션</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            2026년 10월 13일 커밋의 처리 단계 설정입니다.
          </p>
          <div className="mt-6">
            <OrbStepGrid steps={legacyProcessingSteps} labelPrefix="기존" />
          </div>
        </section>
      </section>
    </main>
  );
}
