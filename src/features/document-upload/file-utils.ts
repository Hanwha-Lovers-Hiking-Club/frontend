const ACCEPTED_DOCUMENT_EXTENSIONS = new Set(["pdf", "docx", "xlsx", "txt", "md"]);

export const MAX_DOCUMENT_FILE_SIZE = 50 * 1024 * 1024;

export const acceptedDocumentFileTypes = ".pdf,.docx,.xlsx,.txt,.md";

export const acceptedDocumentFileTypesLabel = "PDF, DOCX, XLSX, TXT, MD · 파일당 최대 50MB";

export function getDocumentId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function getDocumentFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase();
}

export function getDocumentFileType(file: File) {
  return getDocumentFileExtension(file)?.toUpperCase() || "FILE";
}

export function getDocumentSelectionError(files: File[]) {
  const unsupported = files.find(
    (file) => !ACCEPTED_DOCUMENT_EXTENSIONS.has(getDocumentFileExtension(file) ?? ""),
  );
  if (unsupported) {
    return `${unsupported.name}: 지원하지 않는 파일 형식입니다. PDF, DOCX, XLSX, TXT, MD만 추가할 수 있습니다.`;
  }

  const oversized = files.find((file) => file.size > MAX_DOCUMENT_FILE_SIZE);
  if (oversized) {
    return `${oversized.name}: 파일 크기가 50MB를 초과합니다.`;
  }

  return null;
}

export function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
