"use client";

import { FileUp, Upload } from "lucide-react";
import { useRef } from "react";

import { acceptedDocumentFileTypes, acceptedDocumentFileTypesLabel } from "@/features/document-upload/file-utils";

export function UploadInitialState({
  onAddDocuments,
}: {
  onAddDocuments: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="app-page flex items-center px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
      <section className="mx-auto w-full max-w-xl">
        <header className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-4xl">
            문서를 추가하세요.
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500 sm:text-base">
            선택한 문서는 분석을 거쳐 지식카드의 기반이 됩니다.
          </p>
        </header>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          accept={acceptedDocumentFileTypes}
          onChange={(event) => {
            onAddDocuments(event.target.files);
            event.target.value = "";
          }}
        />
        <section className="group mt-8 rounded-[1.75rem] border border-stone-200/90 bg-white p-2 shadow-[0_26px_60px_-48px_rgba(35,33,30,0.24),0_1px_0_rgba(255,255,255,0.95)_inset] transition-[border-color,box-shadow] duration-200 hover:border-stone-300 hover:shadow-[0_30px_64px_-46px_rgba(35,33,30,0.3),0_1px_0_rgba(255,255,255,0.95)_inset]">
          <div className="flex min-h-80 flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-zinc-200 bg-zinc-50/55 px-6 py-10 text-center transition-[border-color,background-color] duration-200 group-hover:border-brand/55 group-hover:bg-white sm:min-h-96 sm:px-10">
            <span className="grid size-14 place-items-center rounded-2xl bg-white text-zinc-700 shadow-[0_12px_24px_-20px_rgba(24,36,31,0.65)] transition-[color,box-shadow,transform] duration-200 group-hover:-translate-y-0.5 group-hover:text-brand-strong group-hover:shadow-[0_16px_28px_-20px_rgba(35,33,30,0.46)]">
              <FileUp className="size-6" aria-hidden />
            </span>
            <h2 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-zinc-950">파일을 선택하세요</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
              여러 파일을 한 번에 선택하고, 업로드 전에 목록을 확인할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm leading-none font-semibold text-primary-foreground transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_12px_20px_-12px_rgba(243,115,33,0.62)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2"
            >
              파일 선택
              <Upload className="size-4" aria-hidden />
            </button>
          </div>
          <footer className="px-4 pb-3 pt-4 text-center">
            <p className="text-xs text-zinc-400">지원 형식: {acceptedDocumentFileTypesLabel} · 여러 파일 선택 가능</p>
          </footer>
        </section>
      </section>
    </main>
  );
}
