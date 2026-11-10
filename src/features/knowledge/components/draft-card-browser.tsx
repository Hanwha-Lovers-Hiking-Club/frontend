"use client";

import { useCallback, useState } from "react";

import { fetchDraftCard, fetchDraftCards } from "@/features/knowledge/api";
import { KnowledgeCardDetailPanel } from "@/features/knowledge/components/knowledge-card-detail-panel";
import { KnowledgeCardGrid } from "@/features/knowledge/components/knowledge-card-grid";
import { KnowledgePagination } from "@/features/knowledge/components/knowledge-pagination";
import { KNOWLEDGE_PAGE_SIZE } from "@/features/knowledge/config";
import type { KnowledgeCard } from "@/features/knowledge/types";
import { useRequest } from "@/features/projects/components/use-request";

/** 관리자용 드래프트 카드 조회. 목록·상세 모두 드래프트 전용 API 를 쓰며, 조회만 한다. */
export function DraftCardBrowser() {
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);
  const closeDetailPanel = useCallback(() => setSelectedCard(null), []);
  const load = useCallback(
    (signal: AbortSignal) => fetchDraftCards({ page, pageSize: KNOWLEDGE_PAGE_SIZE }, signal),
    [page],
  );
  const { data, error, isLoading, retry } = useRequest(String(page), load);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / KNOWLEDGE_PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * KNOWLEDGE_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * KNOWLEDGE_PAGE_SIZE, total);

  return (
    <>
      <section aria-labelledby="draft-results-title" className="mt-8 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-[0_24px_56px_-46px_rgba(35,33,30,0.24),0_1px_0_rgba(255,255,255,0.95)_inset] sm:mt-10">
        <div className="flex flex-col items-start gap-2 border-b border-zinc-200 bg-zinc-50/65 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="draft-results-title" className="text-lg font-semibold tracking-[-0.03em] text-zinc-950">드래프트 카드</h2>
            <span className="text-sm text-zinc-500">최신 생성순</span>
          </div>
          <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-500">
            {isLoading ? "불러오는 중…" : error ? "조회 실패" : `${total}개 중 ${rangeStart} — ${rangeEnd}`}
          </span>
        </div>

        <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_minmax(12rem,0.9fr)_6.5rem] gap-x-5 border-b border-zinc-200 px-6 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-zinc-400 sm:grid">
          <span className="col-start-2">드래프트</span>
          <span className="col-start-3">키워드 · 기술스택</span>
          <span className="col-start-4 text-right">생성일</span>
        </div>

        <KnowledgeCardGrid
          cards={data?.items ?? []}
          isLoading={isLoading}
          error={error}
          query=""
          emptyMessage="보류 중인 드래프트 카드가 없습니다."
          dateField="createdAt"
          onRetry={retry}
          onOpenCard={setSelectedCard}
        />
        <KnowledgePagination page={page} totalPages={totalPages} onPageChange={setPage} label="드래프트 페이지 이동" />
      </section>
      <KnowledgeCardDetailPanel card={selectedCard} onClose={closeDetailPanel} loadDetail={fetchDraftCard} variant="draft" />
    </>
  );
}
