"use client";

import Link from "next/link";
import { FileUp } from "lucide-react";

import { KnowledgeCardGrid } from "@/components/knowledge/knowledge-card-grid";
import { KnowledgeCardDetailPanel } from "@/components/knowledge/knowledge-card-detail-panel";
import { KnowledgePagination } from "@/components/knowledge/knowledge-pagination";
import { KnowledgeToolbar } from "@/components/knowledge/knowledge-toolbar";
import { useKnowledgeCards } from "@/components/knowledge/use-knowledge-cards";
import { sortOptions } from "@/lib/knowledge/config";
import type { KnowledgeCard } from "@/lib/knowledge/types";
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
        <header className="flex flex-col gap-6 border-b border-zinc-200 pb-9 sm:flex-row sm:items-end sm:justify-between">
          <div className="border-l-[3px] border-brand py-1 pl-5 sm:pl-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-zinc-500">KNOWLEDGE BASE</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em] text-zinc-950 sm:text-5xl">지식카드</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
              프로젝트 문서에서 정리된 핵심 지식을 찾아보고 연결하세요.
            </p>
          </div>

          <Link
            href="/upload"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-zinc-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 sm:self-auto"
          >
            <FileUp className="size-4" aria-hidden />
            문서 업로드
          </Link>
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
