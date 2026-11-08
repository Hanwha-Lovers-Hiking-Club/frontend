"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = ["관련 지식카드를 찾고 있어요", "근거 원문을 읽고 있어요", "답변을 정리하고 있어요"];
const STEP_INTERVAL_MS = 2000;
/** 바로 답이 오는 경우 문구가 번쩍였다 사라지지 않도록 살짝 늦게 나타난다. */
const APPEAR_DELAY_S = 0.2;

/**
 * 첫 토큰이 오기 전까지 보이는 답변 준비 표시.
 * 단계는 시간 기준으로 넘어가고 마지막 문구에서 멈춘다. 답이 오면 기다리지 않고 바로 사라진다.
 */
export function ChatPendingIndicator() {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.slice(1).map((_, index) =>
      setTimeout(() => setStep(index + 1), STEP_INTERVAL_MS * (index + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: APPEAR_DELAY_S, duration: 0.25 }}
      className="flex min-h-[1.8em] items-center gap-1.5 text-[14px] leading-[1.8] text-zinc-500"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={step}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -3 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {STEPS[step]}
        </motion.span>
      </AnimatePresence>
      <span aria-hidden className="inline-flex items-center gap-[3px] pt-0.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="size-1 rounded-full bg-zinc-400"
            animate={shouldReduceMotion ? undefined : { y: [0, -3, 0, 0], opacity: [0.35, 1, 0.35, 0.35] }}
            transition={{ duration: 1.2, times: [0, 0.25, 0.5, 1], repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
          />
        ))}
      </span>
    </motion.div>
  );
}
