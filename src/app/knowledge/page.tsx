"use client";

import Link from "next/link";
import { FileUp, LibraryBig } from "lucide-react";

import { KnowledgeCardGrid } from "@/features/knowledge/components/knowledge-card-grid";
import { KnowledgeCardDetailPanel } from "@/features/knowledge/components/knowledge-card-detail-panel";
import { KnowledgePagination } from "@/features/knowledge/components/knowledge-pagination";
import { KnowledgeToolbar } from "@/features/knowledge/components/knowledge-toolbar";
import { useKnowledgeCards } from "@/features/knowledge/components/use-knowledge-cards";
import { sortOptions } from "@/features/knowledge/config";
import type { KnowledgeCard } from "@/features/knowledge/types";
import { useCallback, useState } from "react";

export default function KnowledgePage() {
  const knowledge = useKnowledgeCards();
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);
  const closeDetailPanel = useCallback(() => setSelectedCard(null), []);
  const { filters, page, pageSize, total } = knowledge;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const sortLabel = sortOptions.find((option) => option.value === filters.sort)?.label;

  return (
    <main className="app-page px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div className="mx-auto w-full max-w-[90rem]">
        <header className="border-b border-zinc-200 pb-8 sm:pb-10">
          <div className="grid gap-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <div className="flex items-center gap-2.5 text-zinc-500">
                <LibraryBig className="size-5 text-brand-strong" aria-hidden />
                <span className="text-sm font-semibold">지식 라이브러리</span>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-5xl">지식카드</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                프로젝트 문서에서 정리된 핵심 지식을 찾아보고 연결하세요.
              </p>
            </div>

            <div className="flex items-center gap-5 sm:justify-end">
              <p className="text-sm text-zinc-500">
                전체 지식 <span className="ml-1 font-mono font-semibold tabular-nums text-zinc-950">{total}</span>
              </p>
              <Link
                href="/upload"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm leading-none font-semibold text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
              >
                <FileUp className="size-4" aria-hidden />
                문서 업로드
              </Link>
            </div>
          </div>
        </header>

        <KnowledgeToolbar
          type={filters.type}
          sort={filters.sort}
          onSearch={knowledge.setQuery}
          onTypeChange={knowledge.setType}
          onSortChange={knowledge.setSort}
        />

        <section aria-labelledby="knowledge-results-title" className="mt-9 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-[0_24px_56px_-46px_rgba(35,33,30,0.24),0_1px_0_rgba(255,255,255,0.95)_inset]">
          <div className="flex flex-col items-start gap-2 border-b border-zinc-200 bg-zinc-50/65 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h2 id="knowledge-results-title" className="text-lg font-semibold tracking-[-0.03em] text-zinc-950">
                전체 지식카드
              </h2>
              <span className="text-sm text-zinc-500">{sortLabel}</span>
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-500">
              {total}개 중 {rangeStart} — {rangeEnd}
            </span>
          </div>

          <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_minmax(8rem,0.65fr)_6.5rem] gap-x-5 border-b border-zinc-200 px-6 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-zinc-400 sm:grid">
            <span className="col-start-2">지식카드</span>
            <span className="col-start-3">키워드</span>
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
      </div>
      <KnowledgeCardDetailPanel card={selectedCard} onClose={closeDetailPanel} />
    </main>
  );
}
