"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

import { processingSteps } from "@/features/document-upload/config";
import { Button } from "@/components/ui/button";
import { ParticlesOrb } from "@/features/document-upload/components/voice-orbs/particles-orb";
import { cn } from "@/utils/cn";

const PROCESSING_STEP_QUEUE_CAPACITY = 6;
const PREFERRED_ACTIVE_STEP_POSITION = 2;
const DEFAULT_PROCESSING_ORB_SIZE = 240;

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
  status = "processing",
  onReset,
}: {
  activeStep: number;
  documentCount: number;
  progress: number;
  status?: "processing" | "complete";
  onReset?: () => void;
}) {
  const isComplete = status === "complete";
  const reducedMotion = useReducedMotion();
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
              {isComplete ? "문서 정리가 끝났습니다." : "문서를 지식으로 정리하고 있습니다."}
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
                    ? `${documentCount}개 문서의 내용을 지식카드로 정리했습니다.`
                    : currentStep.label}
                </motion.p>
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
                  className={cn("h-full rounded-full", isComplete ? "bg-violet-500" : "bg-primary")}
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
                    const isCompletedStep = stepIndex < activeStep;
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
                          "relative flex h-12 items-center gap-3 rounded-xl border border-transparent px-3 text-sm transition-[background-color,border-color,color] duration-300",
                          isCurrentStep
                            ? isFinalStep
                              ? "border-violet-200/90 bg-violet-50 font-medium text-violet-950"
                              : "border-brand/35 bg-white font-medium text-zinc-950"
                            : isCompletedStep
                              ? "text-zinc-500"
                              : "text-zinc-400",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full font-mono text-[0.625rem] tabular-nums",
                            isFinalStep
                              ? "bg-violet-100 text-violet-700"
                              : isCurrentStep
                                ? "bg-slate-100 text-brand-strong"
                                : isCompletedStep
                                  ? "bg-zinc-100 text-zinc-500"
                                  : "text-zinc-400",
                          )}
                        >
                          {isCompletedStep ? (
                            <Check className="size-3" aria-hidden />
                          ) : (
                            String(stepIndex + 1).padStart(2, "0")
                          )}
                        </span>
                        <span className="min-w-0 truncate">{step.label}</span>
                        {isCurrentStep && (
                          <span
                            className={cn(
                              "ml-auto size-1.5 shrink-0 rounded-full",
                              isFinalStep ? "bg-violet-500" : "bg-primary",
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
              생성된 지식카드를 확인하거나 새 문서를 추가할 수 있습니다.
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/knowledge">지식카드 보러가기</Link>
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
