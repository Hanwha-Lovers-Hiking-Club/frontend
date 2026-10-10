"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { processingSteps } from "@/components/document-upload-processing-config";
import { Button } from "@/components/ui/button";
import { ParticlesOrb } from "@/components/voice-orbs/particles-orb";
import { cn } from "@/lib/utils";

const PROCESSING_STEP_QUEUE_CAPACITY = 6;
const DEFAULT_PROCESSING_ORB_SIZE = 240;

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
  const firstVisibleStep = isComplete ? 0 : activeStep;
  const visibleSteps = processingSteps.slice(
    firstVisibleStep,
    firstVisibleStep + PROCESSING_STEP_QUEUE_CAPACITY,
  );
  const currentStep = processingSteps[activeStep] ?? processingSteps[0];

  return (
    <main className="app-page grid place-items-center px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
      <section className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-zinc-200/90 bg-white shadow-[0_28px_64px_-54px_rgba(24,36,31,0.72)]">
        <header className="flex items-start justify-between gap-5 border-b border-zinc-100 px-6 py-6 sm:px-9">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">
              {isComplete ? "PROCESSING COMPLETE" : "DOCUMENT PROCESSING"}
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-2xl">
              {isComplete ? "문서 정리가 끝났습니다." : "문서를 지식으로 정리하고 있습니다."}
            </h1>
          </div>
          <p className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 font-mono text-xs tabular-nums text-zinc-500">
            {documentCount} files
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
              <p className="max-w-[22rem] text-sm leading-6 text-zinc-500">
                {isComplete
                  ? `${documentCount}개 문서의 내용을 지식카드로 정리했습니다.`
                  : "분석이 끝나면 문서에서 추출한 내용을 지식카드로 확인할 수 있습니다."}
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-200/80" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="문서 분석 진행률">
                <motion.div
                  className={cn("h-full rounded-full", isComplete ? "bg-violet-500" : "bg-emerald-500")}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </section>

          <section className="flex min-h-96 flex-col px-6 py-7 sm:px-9">
            <p className="text-sm font-medium text-zinc-700">처리 단계</p>

            <div className="relative mt-5 h-[21rem] overflow-hidden border-y border-zinc-100 py-3">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.ol
                  key={`${status}-${activeStep}`}
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -36 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-1"
                >
                  {visibleSteps.map((step, index) => {
                    const stepIndex = firstVisibleStep + index;
                    const isCurrentStep = stepIndex === activeStep;

                    return (
                      <li
                        key={step.label}
                        className={cn(
                          "flex h-12 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                          isCurrentStep
                            ? isComplete
                              ? "bg-violet-600 font-medium text-white shadow-[0_12px_20px_-18px_rgba(76,29,149,0.8)]"
                              : "bg-zinc-950 font-medium text-white shadow-[0_12px_20px_-18px_rgba(24,36,31,0.8)]"
                            : "text-zinc-400",
                        )}
                      >
                        <span className={cn("font-mono text-xs tabular-nums", isCurrentStep ? "text-emerald-300" : "text-zinc-400")}>
                          0{stepIndex + 1}
                        </span>
                        {step.label}
                      </li>
                    );
                  })}
                </motion.ol>
              </AnimatePresence>
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
              <Button asChild className="rounded-xl bg-zinc-950 text-white hover:bg-zinc-800">
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
