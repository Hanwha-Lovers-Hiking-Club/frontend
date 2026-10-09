"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

import { processingSteps } from "@/components/document-upload-types";
import { cn } from "@/lib/utils";

export function UploadProcessingState({
  activeStep,
  documentCount,
  progress,
}: {
  activeStep: number;
  documentCount: number;
  progress: number;
}) {
  const visibleSteps = processingSteps.slice(activeStep, activeStep + 3);

  return (
    <main className="grid min-h-[calc(100dvh-1.5rem)] place-items-center px-5 py-7 sm:min-h-[calc(100dvh-2rem)] sm:px-8">
      <section className="w-full max-w-xl rounded-[2rem] border border-zinc-200/90 bg-white px-7 py-9 shadow-[0_28px_64px_-54px_rgba(24,36,31,0.72)] sm:px-12 sm:py-11">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
          <span className="font-mono text-xs tracking-[0.12em] text-zinc-400">PROCESSING</span>
          <span className="font-mono text-xs tabular-nums text-zinc-400">{progress}%</span>
        </div>
        <div className="grid h-28 place-items-center" aria-label="문서 분석 진행 중">
          <LoaderCircle className="size-7 animate-spin text-zinc-400" aria-hidden />
        </div>
        <p className="text-sm font-medium text-zinc-500">{documentCount}개 문서를 처리하고 있습니다.</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
          지식을 정리하는 중입니다.
        </h1>
        <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="relative mt-9 h-42 overflow-hidden border-y border-zinc-100 py-3 text-left">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.ol
              key={activeStep}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-1"
            >
              {visibleSteps.map((step, index) => (
                <li
                  key={step.label}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                    index === 0 ? "bg-zinc-100 font-medium text-zinc-950" : "text-zinc-400",
                  )}
                >
                  <span className="font-mono text-xs tabular-nums text-zinc-400">0{activeStep + index + 1}</span>
                  {step.label}
                </li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
