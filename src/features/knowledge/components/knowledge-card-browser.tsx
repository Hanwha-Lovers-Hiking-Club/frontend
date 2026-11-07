"use client";

import { KnowledgeCardGrid } from "@/features/knowledge/components/knowledge-card-grid";
import { KnowledgeCardDetailPanel } from "@/features/knowledge/components/knowledge-card-detail-panel";
import { KnowledgePagination } from "@/features/knowledge/components/knowledge-pagination";
import { KnowledgeToolbar } from "@/features/knowledge/components/knowledge-toolbar";
import { useKnowledgeCards } from "@/features/knowledge/components/use-knowledge-cards";
import { sortOptions } from "@/features/knowledge/config";
import type { KnowledgeCard } from "@/features/knowledge/types";
import { useCallback, useState } from "react";

export function KnowledgeCardBrowser() {
  const knowledge = useKnowledgeCards();
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);
  const closeDetailPanel = useCallback(() => setSelectedCard(null), []);
  const { filters, page, pageSize, total } = knowledge;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const sortLabel = sortOptions.find((option) => option.value === filters.sort)?.label;

  return (
    <>
        <KnowledgeToolbar
          sort={filters.sort}
          onSearch={knowledge.setQuery}
          onSortChange={knowledge.setSort}
        />

        <section aria-labelledby="knowledge-results-title" className="mt-6 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-[0_24px_56px_-46px_rgba(35,33,30,0.24),0_1px_0_rgba(255,255,255,0.95)_inset]">
          <div className="flex flex-col items-start gap-2 border-b border-zinc-200 bg-zinc-50/65 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h2 id="knowledge-results-title" className="text-lg font-semibold tracking-[-0.03em] text-zinc-950">
                {filters.query ? "검색된 지식카드" : "전체 지식카드"}
              </h2>
              <span className="text-sm text-zinc-500">{sortLabel}</span>
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-500">
              {knowledge.isLoading ? "불러오는 중…" : knowledge.error ? "조회 실패" : `${total}개 중 ${rangeStart} — ${rangeEnd}`}
            </span>
          </div>

          <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_minmax(12rem,0.9fr)_6.5rem] gap-x-5 border-b border-zinc-200 px-6 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-zinc-400 sm:grid">
            <span className="col-start-2">지식카드</span>
            <span className="col-start-3">키워드 · 기술스택</span>
            <span className="col-start-4 text-right">업데이트</span>
          </div>

          <KnowledgeCardGrid
            cards={knowledge.items}
            isLoading={knowledge.isLoading}
            error={knowledge.error}
            query={filters.query}
            onRetry={knowledge.retry}
            onOpenCard={setSelectedCard}
          />
          <KnowledgePagination page={page} totalPages={totalPages} onPageChange={knowledge.setPage} />
        </section>
      <KnowledgeCardDetailPanel card={selectedCard} onClose={closeDetailPanel} />
    </>
  );
}
