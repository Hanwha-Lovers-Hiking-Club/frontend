"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";

import type { ChatAmbientMode } from "@/features/chat/components/chat-ambient-context";

export function ChatAmbientGlow({ mode = "welcome" }: { mode?: ChatAmbientMode }) {
  const reduceMotion = useReducedMotion();
  const pointerOffsetX = useMotionValue(0);
  const pointerOffsetY = useMotionValue(0);
  const glowOffsetX = useSpring(pointerOffsetX, { damping: 24, stiffness: 90 });
  const glowOffsetY = useSpring(pointerOffsetY, { damping: 24, stiffness: 90 });

  useEffect(() => {
    if (reduceMotion || mode !== "welcome") return;

    const followPointer = (event: PointerEvent) => {
      pointerOffsetX.set(event.clientX - window.innerWidth / 2);
      pointerOffsetY.set(event.clientY - window.innerHeight / 2);
    };
    const resetGlow = () => {
      pointerOffsetX.set(0);
      pointerOffsetY.set(0);
    };

    window.addEventListener("pointermove", followPointer, { passive: true });
    window.addEventListener("blur", resetGlow);
    return () => {
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("blur", resetGlow);
    };
  }, [mode, pointerOffsetX, pointerOffsetY, reduceMotion]);

  if (mode === "conversation") {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-36 -top-40 size-[34rem] rounded-full bg-brand/8 blur-[132px]" />
        <div className="absolute right-0 top-0 h-[30rem] w-[44rem] bg-[radial-gradient(ellipse_at_top_right,rgba(243,115,33,0.09),transparent_68%)]" />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%]">
        <motion.div className="relative size-[36rem]" style={{ x: glowOffsetX, y: glowOffsetY }}>
          <span className="absolute inset-0 rounded-full bg-brand/11 blur-[120px]" />
          <span className="absolute inset-[7.5rem] rounded-full bg-brand/28 blur-[72px]" />
        </motion.div>
      </div>
    </div>
  );
}
