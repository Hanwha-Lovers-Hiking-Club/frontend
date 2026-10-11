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
      <div className="mx-auto w-full max-w-7xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-zinc-200/90 bg-white px-6 py-7 shadow-[0_28px_64px_-54px_rgba(24,36,31,0.72)] sm:px-8 sm:py-9 lg:px-10">
          <div
            className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full bg-emerald-100/70 blur-3xl"
            aria-hidden
          />
          <div className="relative grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <LibraryBig className="size-[18px]" aria-hidden />
                </span>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">KNOWLEDGE BASE</p>
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-5xl">지식카드</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
                프로젝트 문서에서 정리된 핵심 지식을 찾아보고 연결하세요.
              </p>
            </div>

            <div className="flex items-end justify-between gap-6 sm:flex-col sm:items-end sm:justify-end">
              <div className="text-left sm:text-right">
                <p className="text-[11px] font-medium tracking-[0.08em] text-zinc-400">쌓인 지식</p>
                <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-[-0.04em] text-zinc-900">
                  {total}<span className="ml-1 text-sm font-normal text-zinc-400">개</span>
                </p>
              </div>
              <Link
                href="/upload"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-zinc-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
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

        <section aria-labelledby="knowledge-results-title" className="mt-9">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h2 id="knowledge-results-title" className="text-lg font-semibold tracking-[-0.03em] text-zinc-950">
                전체 지식카드
              </h2>
              <span className="text-sm text-zinc-400">{sortLabel}</span>
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-400">
              {rangeStart} — {rangeEnd}
            </span>
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
