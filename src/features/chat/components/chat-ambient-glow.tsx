"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";

import type { ChatAmbientMode } from "@/features/chat/components/chat-ambient-context";

// blur 필터 대신 가우시안 모양으로 감쇠하는 정지점을 촘촘히 둬서, 옅은 색이 퍼질 때 생기는 색 띠(나이테)를 줄인다.
// alpha = 0.30 * exp(-4.5 * t^2), t 는 중심(0)에서 가장자리(1)까지의 비율. 색은 brand(#f37321).
const GLOW_GRADIENT =
  "radial-gradient(closest-side, rgba(243,115,33,0.300) 0%, rgba(243,115,33,0.291) 8%, rgba(243,115,33,0.265) 16%, rgba(243,115,33,0.226) 25%, rgba(243,115,33,0.182) 33%, rgba(243,115,33,0.137) 41%, rgba(243,115,33,0.097) 50%, rgba(243,115,33,0.065) 58%, rgba(243,115,33,0.041) 66%, rgba(243,115,33,0.024) 75%, rgba(243,115,33,0.013) 83%, rgba(243,115,33,0.007) 91%, rgba(243,115,33,0) 100%)";

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

  // 대화가 시작되면 배경 글로우를 보여주지 않는다. (포인터를 따라다니는 글로우는 첫 화면에서만)
  if (mode === "conversation") return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%]">
        <motion.div className="relative size-[48rem]" style={{ x: glowOffsetX, y: glowOffsetY }}>
          <span className="absolute inset-0 rounded-full" style={{ backgroundImage: GLOW_GRADIENT }} />
        </motion.div>
      </div>
    </div>
  );
}
