import type { OrbMotionOverrides } from "@/components/voice-orbs/orb-state";

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
  particleCount?: number;
  motion?: OrbMotionOverrides;
};

export type ProcessingStep = {
  label: string;
  progress: number;
  orb: ProcessingOrbScenario;
};

export const acceptedDocumentFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md";

export const acceptedDocumentFileTypesLabel = "PDF, Word, Excel, PowerPoint, TXT, MD";

export function getDocumentId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function getDocumentFileType(file: File) {
  return file.name.split(".").pop()?.toUpperCase() || "FILE";
}
