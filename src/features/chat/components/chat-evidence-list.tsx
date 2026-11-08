"use client";

import { ChevronRight, FileText, Layers3 } from "lucide-react";
import { useState } from "react";

import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { toReadableExcerpt } from "@/features/chat/excerpt";
import type { ChatReference, ChatSource } from "@/features/chat/types";
import { EvidenceOpenButton } from "@/features/knowledge/components/knowledge-card-evidences";
import type { KnowledgeCardEvidence } from "@/features/knowledge/types";
import { FileFormatIcon } from "@/utils/file-format";

const COLLAPSED_EXCERPT_LENGTH = 220;

function SectionHeading({ icon: Icon, title, count }: { icon: typeof FileText; title: string; count: number }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
      <Icon className="size-4 text-zinc-400" aria-hidden />
      {title}
      <span className="font-mono text-xs font-medium tabular-nums text-zinc-400">{count}</span>
    </h3>
  );
}

function Excerpt({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const readable = toReadableExcerpt(text);
  const isLong = readable.length > COLLAPSED_EXCERPT_LENGTH;

  return (
    <div>
      <p className={`whitespace-pre-line break-words text-sm leading-6 text-zinc-700 ${isLong && !isExpanded ? "line-clamp-4" : ""}`}>
        {readable}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="mt-1.5 cursor-pointer rounded text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
        >
          {isExpanded ? "접기" : "더 보기"}
        </button>
      )}
    </div>
  );
}

export function ChatEvidenceList({
  references,
  sources,
  onSelectReference,
}: {
  references: ChatReference[];
  sources: ChatSource[];
  onSelectReference: (referenceId: string) => void;
}) {
  // 원문 청크에는 파일명이 없어서 카드 근거에서 같은 문서의 파일 정보를 찾아 쓴다.
  const evidenceByDocument = new Map<string, KnowledgeCardEvidence>();
  for (const reference of references) {
    for (const evidence of reference.card.evidences) evidenceByDocument.set(evidence.documentId, evidence);
  }

  const documents: { id: string; title: string; chunks: ChatSource[] }[] = [];
  for (const source of sources) {
    const group = documents.find((item) => item.id === source.documentId);
    if (group) group.chunks.push(source);
    else documents.push({ id: source.documentId, title: source.documentTitle, chunks: [source] });
  }

  return (
    <>
      <SheetTitle asChild>
        <h2 className="text-[1.7rem] font-semibold leading-[1.22] tracking-[-0.045em] text-zinc-950">답변 근거</h2>
      </SheetTitle>
      <SheetDescription className="mt-2 text-sm leading-6 text-zinc-500">
        이 답변을 만들 때 참고한 지식카드와 원문입니다.
      </SheetDescription>

      {references.length > 0 && (
        <section className="mt-8" aria-label="참고한 지식카드">
          <SectionHeading icon={Layers3} title="참고한 지식카드" count={references.length} />
          <ul className="mt-3 space-y-2">
            {references.map((reference) => (
              <li key={reference.id}>
                <button
                  type="button"
                  onClick={() => onSelectReference(reference.id)}
                  className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-[background-color,border-color] hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-zinc-900">{reference.card.title}</p>
                    {reference.card.projectName && <p className="mt-0.5 text-xs text-zinc-500">{reference.card.projectName}</p>}
                    {reference.reason && (
                      <p className="mt-2.5 border-l-2 border-brand/50 pl-3 text-sm leading-6 text-zinc-700">
                        <span className="mr-1.5 text-xs font-semibold text-brand">고른 이유</span>
                        {reference.reason}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {documents.length > 0 && (
        <section className={references.length > 0 ? "mt-9 border-t border-zinc-200 pt-6" : "mt-8"} aria-label="근거 원문">
          <SectionHeading icon={FileText} title="근거 원문" count={sources.length} />
          <ul className="mt-3 space-y-3">
            {documents.map((document) => {
              const evidence = evidenceByDocument.get(document.id);
              return (
                <li key={document.id} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileFormatIcon filename={evidence?.originalFilename ?? ""} />
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-zinc-800">{document.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">인용 {document.chunks.length}곳</p>
                      </div>
                    </div>
                    {evidence && <EvidenceOpenButton evidence={evidence} />}
                  </div>
                  <ol className="mt-3 space-y-3">
                    {document.chunks.map((chunk) => (
                      <li key={chunk.chunkId} className="rounded-lg bg-white px-3.5 py-3 ring-1 ring-zinc-200/70">
                        {chunk.location && <p className="mb-1.5 text-xs font-medium text-zinc-500">{chunk.location}</p>}
                        <Excerpt text={chunk.excerpt} />
                      </li>
                    ))}
                  </ol>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
