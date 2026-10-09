"use client";

import { Upload } from "lucide-react";
import { useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { acceptedDocumentFileTypes, acceptedDocumentFileTypesLabel } from "@/components/document-upload-types";

export function UploadInitialState({
  onAddDocuments,
}: {
  onAddDocuments: (files: FileList | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="grid min-h-[calc(100dvh-1.5rem)] place-items-center px-5 py-7 sm:min-h-[calc(100dvh-2rem)] sm:px-8">
      <section className="w-full max-w-xl rounded-[2rem] border border-zinc-200/90 bg-white px-7 py-10 text-center shadow-[0_28px_64px_-54px_rgba(24,36,31,0.72)] sm:px-12 sm:py-12">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-700">
          <Upload className="size-5" aria-hidden />
        </div>
        <p className="mt-6 text-xs font-medium tracking-[0.14em] text-zinc-400">DOCUMENT UPLOAD</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-4xl">
          문서를 추가하세요.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
          선택한 문서는 분석을 거쳐 지식카드의 기반이 됩니다.
        </p>
        <div className="mt-8 rounded-2xl bg-zinc-50 p-3">
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
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            size="lg"
            className="h-12 w-full rounded-xl bg-zinc-950 text-base text-white hover:bg-zinc-800"
          >
            파일 선택
            <Upload className="size-4" aria-hidden />
          </Button>
        </div>
        <p className="mt-4 text-xs text-zinc-400">{acceptedDocumentFileTypesLabel} · 여러 파일 선택 가능</p>
      </section>
    </main>
  );
}
