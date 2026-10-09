export type UploadPhase = "initial" | "review" | "processing" | "complete";

export type SelectedDocument = {
  id: string;
  file: File;
  previewUrl?: string;
  previewIsObjectUrl?: boolean;
  previewState?: "loading" | "ready";
};

export const acceptedDocumentFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md";

export const acceptedDocumentFileTypesLabel = "PDF, Word, Excel, PowerPoint, TXT, MD";

export function getDocumentId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function getDocumentFileType(file: File) {
  return file.name.split(".").pop()?.toUpperCase() || "FILE";
}

export const processingSteps = [
  { label: "파일을 안전하게 업로드하는 중", progress: 22 },
  { label: "문서 구조를 읽는 중", progress: 48 },
  { label: "핵심 내용을 추출하는 중", progress: 74 },
  { label: "지식카드를 준비하는 중", progress: 100 },
] as const;
