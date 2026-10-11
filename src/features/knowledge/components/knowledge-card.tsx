import { cardTypeConfig } from "@/features/knowledge/config";
import { formatKnowledgeDate } from "@/features/knowledge/formatters";
import type { KnowledgeCard as KnowledgeCardData } from "@/features/knowledge/types";
import { cn } from "@/utils/cn";

export function KnowledgeCard({ card, onOpen }: { card: KnowledgeCardData; onOpen: (card: KnowledgeCardData) => void }) {
  const { label, icon: Icon, badgeClassName } = cardTypeConfig[card.type];

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${card.title} 상세 보기`}
      onClick={() => onOpen(card)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(card);
        }
      }}
      className="group flex min-w-0 cursor-pointer flex-col rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_12px_30px_-32px_rgba(24,36,31,0.36)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-soft hover:shadow-[0_18px_40px_-30px_rgba(24,36,31,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", badgeClassName)}>
            <Icon className="size-[18px]" aria-hidden />
          </span>
          <span className="text-xs font-semibold tracking-[-0.01em] text-zinc-700">{label}</span>
        </div>
        <time dateTime={card.updatedAt} className="shrink-0 text-xs font-medium tabular-nums text-zinc-500">
          {formatKnowledgeDate(card.updatedAt)}
        </time>
      </div>

      <h3 className="mt-5 text-pretty text-base font-semibold leading-6 tracking-[-0.03em] text-zinc-950">
        {card.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">{card.summary}</p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
        {card.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
            <span className="mr-0.5 text-zinc-400">#</span>{tag}
          </span>
        ))}
      </div>

      <footer className="mt-5 flex items-center gap-2 border-t border-zinc-200/70 pt-4 text-xs font-medium text-zinc-600">
        <span className="shrink-0 text-zinc-400">출처</span>
        <span className="min-w-0 truncate text-zinc-700">{card.source}</span>
      </footer>
    </article>
  );
}

export function KnowledgeCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-[15rem] animate-pulse flex-col gap-4 rounded-2xl border border-zinc-200/90 bg-white p-5"
    >
      <div className="flex items-center gap-2.5">
        <span className="size-10 rounded-xl bg-zinc-100" />
        <span className="h-3 w-10 rounded bg-zinc-100" />
      </div>
      <span className="h-4 w-4/5 rounded bg-zinc-100" />
      <span className="h-3 w-full rounded bg-zinc-100" />
      <span className="h-3 w-2/3 rounded bg-zinc-100" />
    </div>
  );
}
