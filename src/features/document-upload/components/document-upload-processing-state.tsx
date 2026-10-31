"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { processingSteps } from "@/features/document-upload/config";
import { Button } from "@/components/ui/button";
import { ParticlesOrb } from "@/features/document-upload/components/voice-orbs/particles-orb";
import { cn } from "@/utils/cn";

const PROCESSING_STEP_QUEUE_CAPACITY = 6;
const PREFERRED_ACTIVE_STEP_POSITION = 2;
const DEFAULT_PROCESSING_ORB_SIZE = 240;
const LONG_WAIT_NOTICE_DELAY = 25_000;

function getVisibleStepRange(activeStep: number, totalSteps: number) {
  const visibleStepCount = Math.min(PROCESSING_STEP_QUEUE_CAPACITY, totalSteps);
  const latestPossibleStart = Math.max(0, totalSteps - visibleStepCount);
  const start = Math.min(
    Math.max(0, activeStep - PREFERRED_ACTIVE_STEP_POSITION),
    latestPossibleStart,
  );

  return { start, end: start + visibleStepCount };
}

export function UploadProcessingState({
  activeStep,
  documentCount,
  progress,
  isJobStarted = true,
  createdCardCount = null,
  status = "processing",
  onReset,
}: {
  activeStep: number;
  documentCount: number;
  progress: number;
  isJobStarted?: boolean;
  createdCardCount?: number | null;
  status?: "processing" | "complete";
  onReset?: () => void;
}) {
  const isComplete = status === "complete";
  const hasCreatedCards = (createdCardCount ?? 0) > 0;
  const reducedMotion = useReducedMotion();
  const [delayedStep, setDelayedStep] = useState<number | null>(null);
  const showLongWaitNotice =
    !isComplete && isJobStarted && activeStep === 0 && delayedStep === activeStep;

  useEffect(() => {
    if (isComplete || !isJobStarted || activeStep !== 0) return;

    const timer = window.setTimeout(() => setDelayedStep(activeStep), LONG_WAIT_NOTICE_DELAY);
    return () => window.clearTimeout(timer);
  }, [activeStep, isComplete, isJobStarted]);
  const { start: firstVisibleStep, end: lastVisibleStep } = getVisibleStepRange(
    activeStep,
    processingSteps.length,
  );
  const visibleSteps = processingSteps.slice(firstVisibleStep, lastVisibleStep);
  const currentStep = processingSteps[activeStep] ?? processingSteps[0];

  return (
    <main className="app-page grid place-items-center px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
      <section className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white shadow-[0_30px_68px_-54px_rgba(35,33,30,0.3),0_1px_0_rgba(255,255,255,0.95)_inset]">
        <header className="flex items-start justify-between gap-5 border-b border-zinc-100 px-6 py-6 sm:px-9">
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-2xl">
              {isComplete
                ? hasCreatedCards
                  ? "새로운 지식카드가 완성되었습니다."
                  : "문서가 검색할 준비를 마쳤습니다."
                : "문서를 지식으로 정리하고 있습니다."}
            </h1>
          </div>
          <p className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 font-mono text-xs tabular-nums text-zinc-500">
            {documentCount}개 문서
          </p>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="grid min-h-72 grid-rows-[auto_minmax(0,1fr)_auto] border-b border-zinc-100 bg-zinc-50/70 px-6 py-7 sm:px-9 lg:border-r lg:border-b-0">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  {isComplete ? "처리 완료" : "전체 진행률"}
                </p>
                <span className="font-mono text-lg font-semibold tabular-nums text-zinc-700">{progress}%</span>
              </div>
            </div>

            <div className="grid min-h-0 items-end justify-items-center">
              <ParticlesOrb
                state={currentStep.orb.state}
                size={currentStep.orb.size ?? DEFAULT_PROCESSING_ORB_SIZE}
                speed={currentStep.orb.speed}
                colorFrom={currentStep.orb.colorFrom}
                colorTo={currentStep.orb.colorTo}
                accentColor={currentStep.orb.accentColor}
                accentRatio={currentStep.orb.accentRatio}
                particleCount={currentStep.orb.particleCount}
                motion={currentStep.orb.motion}
                label={isComplete ? "문서 처리 완료" : "문서 분석 진행 중"}
              />
            </div>

            <div className="pt-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={isComplete ? "complete" : currentStep.label}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="max-w-[22rem] text-sm leading-6 text-zinc-500"
                >
                  {isComplete
                    ? hasCreatedCards
                      ? `${documentCount}개 문서에서 ${createdCardCount}개의 지식카드를 발견했습니다.`
                      : `${documentCount}개 문서에서 카드로 만들 핵심 내용은 없었지만, 검색할 수 있도록 정리했습니다.`
                    : currentStep.label}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {showLongWaitNotice ? (
                  <motion.p
                    initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                    className="mt-2 text-xs leading-5 text-zinc-400"
                  >
                    분석 환경을 깨우고 있어요. 첫 준비에는 조금 더 시간이 걸릴 수 있습니다.
                  </motion.p>
                ) : null}
              </AnimatePresence>
              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-200/80"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="문서 분석 진행률"
              >
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    isComplete
                      ? "bg-[linear-gradient(90deg,#18a89b,#90e3c2)]"
                      : "bg-[linear-gradient(90deg,#7766f8,#38c7e8)]",
                  )}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </section>

          <section className="flex min-h-96 flex-col px-6 py-7 sm:px-9">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-zinc-700">처리 단계</p>
              <p className="font-mono text-xs tabular-nums text-zinc-400">
                {Math.min(activeStep + 1, processingSteps.length)} / {processingSteps.length}
              </p>
            </div>

            <div
              className="relative mt-5 h-[21rem] overflow-hidden border-y border-zinc-100 py-3"
              aria-live="polite"
            >
              <motion.ol layout className="space-y-1.5">
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleSteps.map((step, index) => {
                    const stepIndex = firstVisibleStep + index;
                    const isCurrentStep = stepIndex === activeStep;
                    const isCompletedStep = isComplete || stepIndex < activeStep;
                    const isFinalStep = isComplete && isCurrentStep;

                    return (
                      <motion.li
                        key={step.label}
                        layout="position"
                        initial={reducedMotion ? false : { opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, y: -28 }}
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : {
                                layout: { type: "spring", stiffness: 420, damping: 34 },
                                opacity: { duration: 0.2 },
                                y: { type: "spring", stiffness: 420, damping: 34 },
                              }
                        }
                        className={cn(
                          "relative flex h-12 items-center gap-3 rounded-xl border px-3 text-sm transition-[background-color,border-color,color,box-shadow] duration-300",
                          isCurrentStep
                            ? isFinalStep
                              ? "border-brand/35 bg-brand-soft font-medium text-zinc-950"
                              : "border-foreground bg-foreground font-semibold text-white shadow-[0_12px_24px_-20px_rgba(28,25,23,0.65)]"
                            : isCompletedStep
                              ? "border-brand/20 bg-brand-soft text-zinc-700"
                              : "border-transparent text-zinc-400",
                        )}
                      >
                        <motion.span
                          layout
                          className={cn(
                            "inline-flex w-5 shrink-0 items-center justify-center font-mono text-[0.625rem] tabular-nums",
                            isFinalStep
                              ? "text-brand-strong"
                              : isCurrentStep
                                ? "text-brand"
                                : isCompletedStep
                                  ? "text-brand-strong"
                                  : "text-zinc-400",
                          )}
                        >
                          <AnimatePresence initial={false} mode="wait">
                            <motion.span
                              key={isCompletedStep ? "complete" : "pending"}
                              initial={reducedMotion ? false : { opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.7 }}
                              transition={{ duration: reducedMotion ? 0 : 0.18 }}
                            >
                              {isCompletedStep ? (
                                <Check className="size-3" aria-hidden />
                              ) : (
                                String(stepIndex + 1).padStart(2, "0")
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </motion.span>
                        <span className="min-w-0 truncate">{step.label}</span>
                        {isCurrentStep && (
                          <span
                            className={cn(
                              "ml-auto size-1.5 shrink-0 rounded-full",
                              isFinalStep ? "bg-primary" : "bg-primary shadow-[0_0_0_3px_rgba(243,115,33,0.16)]",
                            )}
                          />
                        )}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ol>
              {firstVisibleStep > 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-white via-white/80 to-transparent" />
              )}
              {lastVisibleStep < processingSteps.length && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white via-white/80 to-transparent" />
              )}
            </div>
          </section>
        </div>

        {isComplete && (
          <motion.footer
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 border-t border-zinc-100 bg-zinc-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9"
          >
            <p className="text-sm leading-6 text-zinc-500">
              {hasCreatedCards
                ? "생성된 지식카드를 확인하거나 새 문서를 추가할 수 있습니다."
                : "카드는 없지만 문서 내용은 검색과 질문에 활용할 수 있습니다."}
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={hasCreatedCards ? "/knowledge" : "/"}>
                  {hasCreatedCards ? "지식카드 보러가기" : "문서로 질문하기"}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
              >
                새 문서 업로드
              </Button>
            </div>
          </motion.footer>
        )}
      </section>
    </main>
  );
}
