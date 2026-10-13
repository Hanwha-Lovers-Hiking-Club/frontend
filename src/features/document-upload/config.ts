import { DEFAULT_PARTICLE_COUNT } from "@/features/document-upload/components/voice-orbs/orb-motion";
import type { ProcessingOrbScenario, ProcessingStep } from "@/features/document-upload/types";

const PROCESSING_ORB_COLORS = { colorFrom: "#7766f8", colorTo: "#38c7e8" } as const;
const COMPLETE_ORB_COLORS = {
  colorFrom: "#18a89b",
  colorTo: "#90e3c2",
} as const;

type ProcessingOrbOptions = Omit<ProcessingOrbScenario, "state" | "particleCount"> & {
  particleCount?: number;
};

function processingOrb(
  state: ProcessingOrbScenario["state"],
  options: ProcessingOrbOptions,
): ProcessingOrbScenario {
  return { state, particleCount: DEFAULT_PARTICLE_COUNT, ...options };
}

export const processingSteps = [
  {
    label: "파일을 업로드할 준비를 하는 중",
    progress: 16,
    orb: processingOrb("idle", {
      speed: 0.8,
      ...PROCESSING_ORB_COLORS,
      motion: { spin: 0.55, breathe: 0.15, breatheRate: 1.8, drift: 0.45 },
    }),
  },
  {
    label: "문서 구조를 읽는 중",
    progress: 32,
    orb: processingOrb("listening", { speed: 0.5, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "핵심 내용을 추출하는 중",
    progress: 48,
    orb: processingOrb("thinking", { speed: 1, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "지식카드 초안을 구성하는 중",
    progress: 66,
    orb: processingOrb("speaking", { speed: 0.8, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "문서 간 관계를 연결하는 중",
    progress: 84,
    orb: processingOrb("connecting", {
      speed: 0.5,
      ...PROCESSING_ORB_COLORS,
      motion: { scale: 0.7, ringWidth: 0.2 },
    }),
  },
  {
    label: "지식카드를 마무리하는 중",
    progress: 100,
    orb: processingOrb("idle", {
      size: 256,
      speed: 1.2,
      particleCount: 960,
      ...COMPLETE_ORB_COLORS,
      motion: { drift: 0.45 },
    }),
  },
] as const satisfies readonly ProcessingStep[];
