"use client";

import { ChevronDown, ExternalLink, LoaderCircle } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { fetchDocumentUrl } from "@/features/knowledge/api";
import type { EvidenceDocument, EvidenceItem } from "@/features/knowledge/types";
import { FileFormatIcon } from "@/utils/file-format";

const VISIBLE_EVIDENCE_COUNT = 3;

/** 챗봇 답변에 직접 쓰인 문서와 발췌 (챗봇 참조의 document). */
export type AnswerSource = {
  documentId: string;
  documentTitle: string;
  location: string | null;
  excerpt: string | null;
};

const normalize = (text: string | null) => (text ?? "").replace(/\s+/g, " ").trim();

function isAnswerItem(item: EvidenceItem, source: AnswerSource) {
  const excerpt = normalize(source.excerpt);
  if (excerpt) {
    const itemExcerpt = normalize(item.excerpt);
    return itemExcerpt === excerpt || (itemExcerpt.length > 0 && (itemExcerpt.includes(excerpt) || excerpt.includes(itemExcerpt)));
  }
  return !!source.location && item.location === source.location;
}

/**
 * 답변에 쓰인 문서를 맨 앞에, 그 문서 안에서 답변에 쓰인 근거를 맨 앞에 둔다.
 * 나머지 순서는 백엔드가 정렬한 그대로 둔다. 근거가 카드 근거에 없으면 답변 발췌를 근거로 보탠다.
 */
function placeAnswerSource(documents: EvidenceDocument[], source: AnswerSource) {
  const index = documents.findIndex((document) => document.documentId === source.documentId);
  const answerDocument: EvidenceDocument = index >= 0
    ? documents[index]
    : { documentId: source.documentId, documentTitle: source.documentTitle, originalFilename: "", url: null, items: [] };
  const matched = answerDocument.items.filter((item) => isAnswerItem(item, source));
  const others = answerDocument.items.filter((item) => !matched.includes(item));
  const answerItems = matched.length > 0 || !source.excerpt
    ? matched
    : [{ id: `answer-${source.documentId}`, location: source.location, excerpt: source.excerpt }];

  return {
    documents: [{ ...answerDocument, items: [...answerItems, ...others] }, ...documents.filter((_, i) => i !== index)],
    answerItemIds: new Set(answerItems.map((item) => item.id)),
  };
}
// 백엔드가 브라우저에서 열리게 서명하는 형식. 나머지는 내려받기로 응답한다.
const INLINE_FILE_PATTERN = /\.(pdf|txt)$/i;

export async function openDocument({
  documentId,
  originalFilename,
}: Pick<EvidenceDocument, "documentId" | "originalFilename">) {
  const isInline = INLINE_FILE_PATTERN.test(originalFilename);
  // 팝업 차단을 피하려면 await 전, 클릭 처리 중에 탭을 열어야 한다.
  const tab = isInline ? window.open("", "_blank") : null;
  if (tab) tab.opener = null;

  try {
    const url = await fetchDocumentUrl(documentId);
    if (tab) tab.location.href = url;
    else window.location.assign(url); // 내려받기 응답이라 현재 페이지는 유지된다.
  } catch (error) {
    tab?.close();
    toast.error("원본 문서를 열지 못했습니다.", {
      description: error instanceof Error ? error.message : undefined,
    });
  }
}

export function EvidenceOpenButton({ evidence }: { evidence: EvidenceDocument }) {
  const [isOpening, setIsOpening] = useState(false);

  return (
    <button
      type="button"
      disabled={isOpening}
      aria-label={`${evidence.documentTitle} 원본 열기`}
      onClick={async () => {
        setIsOpening(true);
        await openDocument(evidence);
        setIsOpening(false);
      }}
      className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 disabled:cursor-wait disabled:opacity-60"
    >
      {isOpening ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ExternalLink className="size-4" aria-hidden />}
      열기
    </button>
  );
}

function EvidenceDocumentBox({
  document,
  isAnswerDocument = false,
  answerItemIds,
}: {
  document: EvidenceDocument;
  isAnswerDocument?: boolean;
  answerItemIds?: Set<string>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const listId = useId();
  const items = document.items;
  const visible = isExpanded ? items : items.slice(0, VISIBLE_EVIDENCE_COUNT);
  const hiddenCount = items.length - visible.length;

  return (
    <li className={`rounded-xl border bg-zinc-50/70 p-3.5 ${isAnswerDocument ? "border-brand/30" : "border-zinc-200"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileFormatIcon filename={document.originalFilename} />
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-zinc-800">{document.documentTitle}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
              {isAnswerDocument && <span className="rounded-md bg-brand-soft px-1.5 py-0.5 font-semibold text-brand">답변에 쓰인 문서</span>}
              근거 {items.length}개
            </p>
          </div>
        </div>
        <EvidenceOpenButton evidence={document} />
      </div>
      <ol id={listId} className="mt-3 space-y-2">
        {visible.map((item) => {
          const isAnswerItem = answerItemIds?.has(item.id) ?? false;
          return (
            <li key={item.id} className={`rounded-lg bg-white px-3.5 py-3 ring-1 ${isAnswerItem ? "ring-brand/35" : "ring-zinc-200/70"}`}>
              {(isAnswerItem || item.location) && (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-zinc-500">
                  {isAnswerItem && <span className="font-semibold text-brand">답변에 쓰인 근거</span>}
                  {item.location}
                </p>
              )}
              {item.excerpt && (
                <blockquote className={`whitespace-pre-wrap break-words border-l-2 pl-3 text-sm leading-6 text-zinc-700 ${isAnswerItem ? "border-brand/60" : "border-zinc-200"} ${isAnswerItem || item.location ? "mt-1.5" : ""}`}>{item.excerpt}</blockquote>
              )}
            </li>
          );
        })}
      </ol>
      {items.length > VISIBLE_EVIDENCE_COUNT && (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className="mt-2.5 inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white pl-2.5 pr-2 text-xs font-medium text-zinc-600 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-[background-color,border-color,color] hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
        >
          {isExpanded ? "근거 접기" : `근거 ${hiddenCount}개 더 보기`}
          <ChevronDown className={`size-3.5 text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} aria-hidden />
        </button>
      )}
    </li>
  );
}

/**
 * 카드 근거를 문서마다 상자 하나로 보여준다. 근거가 없는 문서는 그리지 않는다.
 * answerSource 가 있으면(챗봇에서 연 경우) 답변에 쓰인 문서와 근거를 맨 위에 강조한다.
 */
export function KnowledgeCardEvidences({ evidences, answerSource }: { evidences: EvidenceDocument[]; answerSource?: AnswerSource }) {
  const placed = answerSource ? placeAnswerSource(evidences, answerSource) : null;
  const documents = (placed?.documents ?? evidences).filter((document) => document.items.length > 0);
  if (documents.length === 0) return <p className="mt-3 text-sm text-zinc-500">연결된 원본 문서가 없습니다.</p>;

  return (
    <ul className="mt-3 flex flex-col gap-2">
      {documents.map((document) => {
        const isAnswerDocument = document.documentId === answerSource?.documentId;
        return (
          <EvidenceDocumentBox
            key={document.documentId}
            document={document}
            isAnswerDocument={isAnswerDocument}
            answerItemIds={isAnswerDocument ? placed?.answerItemIds : undefined}
          />
        );
      })}
    </ul>
  );
}
