import { File, FileCode, FileSpreadsheet, FileText, type LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

type FileFormat = {
  label: string;
  icon: LucideIcon;
  /** 테두리 색·배경·글자색. 테두리 두께는 쓰는 쪽에서 `border`로 켠다. */
  tone: string;
};

const pdf: FileFormat = { label: "PDF", icon: FileText, tone: "border-red-200/80 bg-red-50 text-red-600" };
const word: FileFormat = { label: "DOCX", icon: FileText, tone: "border-blue-200/80 bg-blue-50 text-blue-600" };
const sheet: FileFormat = { label: "XLSX", icon: FileSpreadsheet, tone: "border-emerald-200/80 bg-emerald-50 text-emerald-600" };
const slide: FileFormat = { label: "PPTX", icon: FileText, tone: "border-orange-200/80 bg-orange-50 text-orange-600" };
const text: FileFormat = { label: "TXT", icon: FileText, tone: "border-slate-200 bg-slate-100 text-slate-600" };
const markdown: FileFormat = { label: "MD", icon: FileCode, tone: "border-violet-200/80 bg-violet-50 text-violet-600" };
const unknown: FileFormat = { label: "FILE", icon: File, tone: "border-zinc-200 bg-zinc-100 text-zinc-500" };

const FILE_FORMATS: Record<string, FileFormat> = {
  pdf,
  doc: { ...word, label: "DOC" },
  docx: word,
  xls: { ...sheet, label: "XLS" },
  xlsx: sheet,
  ppt: { ...slide, label: "PPT" },
  pptx: slide,
  txt: text,
  md: markdown,
};

export function getFileFormat(filename: string): FileFormat {
  const extension = filename.includes(".") ? filename.split(".").pop()?.toLowerCase() : undefined;
  return (extension && FILE_FORMATS[extension]) || unknown;
}

/** 원본 문서 목록에서 쓰는 형식별 색상 아이콘 타일. */
export function FileFormatIcon({ filename, className }: { filename: string; className?: string }) {
  const { label, icon: Icon, tone } = getFileFormat(filename);
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", tone, className)} title={label}>
      <Icon className="size-4" aria-hidden />
    </span>
  );
}
