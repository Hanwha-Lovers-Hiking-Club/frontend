import type { OrbMotionOverrides } from "@/features/document-upload/components/voice-orbs/orb-state";

export type UploadPhase = "initial" | "review" | "processing" | "complete";

export type SelectedDocument = {
  id: string;
  file: File;
  previewUrl?: string;
  previewIsObjectUrl?: boolean;
  previewState?: "loading" | "ready";
};

export type ProcessingOrbScenario = {
  state: "idle" | "connecting" | "listening" | "thinking" | "speaking";
  size?: number;
  speed: number;
  colorFrom: string;
  colorTo: string;
  accentColor?: string;
  accentRatio?: number;
  particleCount?: number;
  motion?: OrbMotionOverrides;
};

export type ProcessingStep = {
  label: string;
  progress: number;
  orb: ProcessingOrbScenario;
};
