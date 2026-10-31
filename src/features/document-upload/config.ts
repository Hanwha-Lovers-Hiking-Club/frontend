import { DEFAULT_PARTICLE_COUNT } from "@/features/document-upload/components/voice-orbs/orb-motion";
import type { ProcessingOrbScenario, ProcessingStep } from "@/features/document-upload/types";

const PROCESSING_ORB_COLORS = { colorFrom: "#7766f8", colorTo: "#38c7e8" } as const;
const COMPLETE_ORB_COLORS = { colorFrom: "#18a89b", colorTo: "#90e3c2" } as const;

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
    label: "잠든 문서의 첫 장을 깨우는 중",
    progress: 11,
    orb: processingOrb("listening", {
      speed: 0.45,
      ...PROCESSING_ORB_COLORS,
      motion: { spin: 0.45, breathe: 0.2, breatheRate: 1.6, drift: 0.35 },
    }),
  },
  {
    label: "긴 이야기를 의미의 조각으로 나누는 중",
    progress: 22,
    orb: processingOrb("connecting", { speed: 0.55, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "문서 속 경험과 통찰을 발견하는 중",
    progress: 33,
    orb: processingOrb("thinking", { speed: 0.8, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "발견한 지식을 카드의 형태로 빚는 중",
    progress: 44,
    orb: processingOrb("speaking", { speed: 0.7, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "지식의 맥락과 정확성을 살피는 중",
    progress: 56,
    orb: processingOrb("listening", { speed: 0.5, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "지식카드에 의미의 좌표를 새기는 중",
    progress: 67,
    orb: processingOrb("connecting", {
      speed: 0.65,
      ...PROCESSING_ORB_COLORS,
      motion: { scale: 0.72, ringWidth: 0.18 },
    }),
  },
  {
    label: "완성된 지식카드를 안전하게 보관하는 중",
    progress: 78,
    orb: processingOrb("speaking", { speed: 0.75, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "문서의 모든 조각에 검색의 길을 내는 중",
    progress: 89,
    orb: processingOrb("thinking", { speed: 0.85, ...PROCESSING_ORB_COLORS }),
  },
  {
    label: "언제든 다시 찾을 수 있도록 연결하는 중",
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
