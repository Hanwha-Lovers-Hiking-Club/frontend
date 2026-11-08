"use client";

import { ChevronDown, ExternalLink, LoaderCircle } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { fetchDocumentUrl } from "@/features/knowledge/api";
import type { KnowledgeCardEvidence } from "@/features/knowledge/types";
import { FileFormatIcon } from "@/utils/file-format";

const VISIBLE_EVIDENCE_COUNT = 3;
// 백엔드가 브라우저에서 열리게 서명하는 형식. 나머지는 내려받기로 응답한다.
const INLINE_FILE_PATTERN = /\.(pdf|txt)$/i;

export async function openDocument({
  documentId,
  originalFilename,
}: Pick<KnowledgeCardEvidence, "documentId" | "originalFilename">) {
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

export function EvidenceOpenButton({ evidence }: { evidence: KnowledgeCardEvidence }) {
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

function EvidenceItem({ evidence }: { evidence: KnowledgeCardEvidence }) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileFormatIcon filename={evidence.originalFilename} />
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-zinc-800">{evidence.documentTitle}</p>
            <p className="mt-0.5 break-words text-xs text-zinc-500">{evidence.location ?? evidence.originalFilename}</p>
          </div>
        </div>
        <EvidenceOpenButton evidence={evidence} />
      </div>
      {evidence.excerpt && (
        <blockquote className="mt-3 whitespace-pre-wrap break-words border-l-2 border-zinc-200 pl-4 text-sm leading-6 text-zinc-700">{evidence.excerpt}</blockquote>
      )}
    </li>
  );
}

export function KnowledgeCardEvidences({ evidences }: { evidences: KnowledgeCardEvidence[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const listId = useId();
  const visible = isExpanded ? evidences : evidences.slice(0, VISIBLE_EVIDENCE_COUNT);
  const hiddenCount = evidences.length - visible.length;

  return (
    <>
      <ul id={listId} className="mt-3 flex flex-col gap-2">
        {visible.map((evidence) => <EvidenceItem key={evidence.id} evidence={evidence} />)}
      </ul>
      {evidences.length > VISIBLE_EVIDENCE_COUNT && (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className="mt-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
        >
          <ChevronDown className={`size-4 ${isExpanded ? "rotate-180" : ""}`} aria-hidden />
          {isExpanded ? "근거 접기" : `근거 ${hiddenCount}개 더 보기`}
        </button>
      )}
    </>
  );
}
