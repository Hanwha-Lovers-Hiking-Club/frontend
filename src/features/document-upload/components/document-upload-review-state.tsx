"use client";

import { ChevronRight, LoaderCircle, Plus, X } from "lucide-react";
import { useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  acceptedDocumentFileTypes,
  formatFileSize,
  getDocumentFileType,
} from "@/features/document-upload/file-utils";
import type { SelectedDocument } from "@/features/document-upload/types";
import { cn } from "@/utils/cn";

const fileVisuals = {
  PDF: {
    badge: "border-red-200/80 bg-red-50 text-red-600",
  },
  DOC: {
    badge: "border-blue-200/80 bg-blue-50 text-blue-600",
  },
  DOCX: {
    badge: "border-blue-200/80 bg-blue-50 text-blue-600",
  },
  XLS: {
    badge: "border-emerald-200/80 bg-emerald-50 text-emerald-600",
  },
  XLSX: {
    badge: "border-emerald-200/80 bg-emerald-50 text-emerald-600",
  },
  PPT: {
    badge: "border-orange-200/80 bg-orange-50 text-orange-600",
  },
  PPTX: {
    badge: "border-orange-200/80 bg-orange-50 text-orange-600",
  },
  FILE: {
    badge: "border-zinc-200 bg-zinc-100 text-zinc-500",
  },
} as const;

export function UploadReviewState({
  documents,
  onAddDocuments,
  onRemoveDocument,
  onStartProcessing,
}: {
  documents: SelectedDocument[];
  onAddDocuments: (files: FileList | null) => void;
  onRemoveDocument: (id: string) => void;
  onStartProcessing: () => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="app-page px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
      <section className="mx-auto w-full max-w-6xl rounded-[2rem] border border-zinc-200/90 bg-white px-6 py-7 shadow-[0_28px_64px_-54px_rgba(24,36,31,0.72)] sm:px-9 sm:py-9">
        <header className="flex flex-col justify-between gap-5 border-b border-zinc-100 pb-7 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">DOCUMENTS</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
              업로드할 문서를 확인하세요.
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500 sm:text-base">
              선택한 문서는 분석을 거쳐 지식카드의 기반이 됩니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
            >
              <Plus className="size-4" aria-hidden />
              문서 추가
            </Button>
            <Button
              onClick={onStartProcessing}
              size="lg"
              className="rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800"
            >
              업로드 시작
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </header>

        <section className="pt-7" aria-label="선택한 문서">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700">선택한 문서 {documents.length}개</p>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              multiple
              className="sr-only"
              accept={acceptedDocumentFileTypes}
              onChange={(event) => {
                onAddDocuments(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          <div className="flex flex-wrap items-stretch gap-3 sm:gap-4">
            {documents.map((document) => {
              const fileType = getDocumentFileType(document.file);
              const visual = fileVisuals[fileType as keyof typeof fileVisuals] ?? fileVisuals.FILE;

              return (
                <article
                  key={document.id}
                  className="group flex min-h-52 min-w-0 shrink-0 basis-full flex-col overflow-hidden rounded-[1.25rem] border border-zinc-200/80 bg-zinc-50/70 p-4 transition-[background-color,transform,box-shadow] duration-200 sm:basis-[calc((100%-1rem)/2)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_32px_-28px_rgba(24,36,31,0.42)] lg:basis-[calc((100%-2rem)/3)] xl:basis-[calc((100%-3rem)/4)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn("grid size-10 place-items-center rounded-xl border font-mono text-[0.65rem] font-medium tracking-[0.08em] shadow-[0_10px_18px_-16px_rgba(24,36,31,0.5)]", visual.badge)}>
                      {fileType}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveDocument(document.id)}
                      className="grid size-8 cursor-pointer place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45"
                      aria-label={`${document.file.name} 제거`}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>

                  <div className="mt-4 h-28 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50">
                    {document.previewUrl && (
                      // previewUrl is a runtime-generated document thumbnail, not a statically optimizable image.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={document.previewUrl}
                        alt={`${document.file.name} 첫 페이지 미리보기`}
                        className="size-full object-contain"
                      />
                    )}
                    {!document.previewUrl && document.previewState === "loading" && (
                      <div className="grid size-full place-items-center" aria-label="문서 미리보기 생성 중">
                        <LoaderCircle className="size-4 animate-spin text-zinc-400" aria-hidden />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900" title={document.file.name}>
                      {document.file.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400">
                      <span>{formatFileSize(document.file.size)}</span>
                      <span aria-hidden>·</span>
                      <span>준비됨</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
