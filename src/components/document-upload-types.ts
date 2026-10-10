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
  speed: number;
  colorFrom: string;
  colorTo: string;
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

export const processingSteps: readonly ProcessingStep[] = [
  {
    label: "파일을 업로드할 준비를 하는 중",
    progress: 16,
    orb: { state: "idle", speed: 2, colorFrom: "#34d399", colorTo: "#0f766e" },
  },
  {
    label: "문서 구조를 읽는 중",
    progress: 32,
    orb: { state: "listening", speed: 0.5, colorFrom: "#34d399", colorTo: "#0f766e" },
  },
  {
    label: "핵심 내용을 추출하는 중",
    progress: 48,
    orb: { state: "thinking", speed: 2, colorFrom: "#34d399", colorTo: "#0f766e" },
  },
  {
    label: "지식카드 초안을 구성하는 중",
    progress: 66,
    orb: { state: "speaking", speed: 0.5, colorFrom: "#34d399", colorTo: "#0f766e" },
  },
  {
    label: "문서 간 관계를 연결하는 중",
    progress: 84,
    orb: { state: "connecting", speed: 0.5, colorFrom: "#34d399", colorTo: "#0f766e" },
  },
  {
    label: "지식카드를 마무리하는 중",
    progress: 100,
    orb: { state: "idle", speed: 2, colorFrom: "#a78bfa", colorTo: "#4f46e5" },
  },
];
