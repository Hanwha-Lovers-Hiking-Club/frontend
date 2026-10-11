export const acceptedDocumentFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md";

export const acceptedDocumentFileTypesLabel = "PDF, Word, Excel, PowerPoint, TXT, MD";

export function getDocumentId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function getDocumentFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase();
}

export function getDocumentFileType(file: File) {
  return getDocumentFileExtension(file)?.toUpperCase() || "FILE";
}

export function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
