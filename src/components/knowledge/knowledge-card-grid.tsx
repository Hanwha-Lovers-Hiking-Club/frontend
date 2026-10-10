import { KNOWLEDGE_PAGE_SIZE } from "@/lib/knowledge/config";
import type { KnowledgeCard as KnowledgeCardData } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

import { KnowledgeCard, KnowledgeCardSkeleton } from "./knowledge-card";

const gridClassName = "mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

export function KnowledgeCardGrid({
  cards,
  isLoading,
  error,
  query,
  onRetry,
  onOpenCard,
}: {
  cards: KnowledgeCardData[];
  isLoading: boolean;
  error: Error | null;
  query: string;
  onRetry: () => void;
  onOpenCard: (card: KnowledgeCardData) => void;
}) {
  if (error) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-zinc-200 px-5 py-12 text-center">
        <p className="text-sm text-zinc-500">지식카드를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 첫 로딩에만 스켈레톤, 이후에는 이전 목록을 유지한 채 살짝 흐리게 표시한다.
  if (isLoading && cards.length === 0) {
    return (
      <div className={gridClassName} aria-busy>
        {Array.from({ length: KNOWLEDGE_PAGE_SIZE }, (_, index) => (
          <KnowledgeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <p className="mt-5 rounded-2xl border border-dashed border-zinc-200 px-5 py-12 text-center text-sm text-zinc-500">
        {query ? <>&ldquo;{query}&rdquo;와 일치하는 지식카드가 없습니다.</> : "조건에 맞는 지식카드가 없습니다."}
      </p>
    );
  }

  return (
    <div className={cn(gridClassName, "transition-opacity", isLoading && "opacity-60")} aria-busy={isLoading}>
      {cards.map((card) => (
        <KnowledgeCard key={card.id} card={card} onOpen={onOpenCard} />
      ))}
    </div>
  );
}
