"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";

export function ChatAmbientGlow() {
  const reduceMotion = useReducedMotion();
  const pointerOffsetX = useMotionValue(0);
  const pointerOffsetY = useMotionValue(0);
  const glowOffsetX = useSpring(pointerOffsetX, { damping: 24, stiffness: 90 });
  const glowOffsetY = useSpring(pointerOffsetY, { damping: 24, stiffness: 90 });

  useEffect(() => {
    if (reduceMotion) return;

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
  }, [pointerOffsetX, pointerOffsetY, reduceMotion]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%]">
        <motion.div
          className="size-[38rem] rounded-full bg-[rgb(226_216_205_/_0.55)] blur-[104px]"
          style={{ x: glowOffsetX, y: glowOffsetY }}
        />
      </div>
    </div>
  );
}
