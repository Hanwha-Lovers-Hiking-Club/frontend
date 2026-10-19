import { FileText } from "lucide-react";

import { formatKnowledgeDate } from "@/features/knowledge/formatters";
import type { KnowledgeCard as KnowledgeCardData } from "@/features/knowledge/types";

export function KnowledgeCard({ card, onOpen }: { card: KnowledgeCardData; onOpen: (card: KnowledgeCardData) => void }) {
  const sourceTitle = card.projectName ?? card.evidences[0]?.documentTitle ?? "";

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
      className="group relative grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-3 px-5 py-5 transition-[background-color,box-shadow] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/45 sm:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,0.65fr)_6.5rem] sm:items-center sm:gap-x-5 sm:px-6"
    >
      <span aria-hidden className="absolute inset-y-4 left-0 w-0.5 scale-y-0 bg-brand transition-transform duration-200 group-hover:scale-y-100" />
      <span className="row-span-2 grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100/80 text-emerald-700">
        <FileText className="size-[18px]" aria-hidden />
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs text-zinc-500">{sourceTitle}</span>
        </div>
        <h3 className="mt-1.5 text-pretty text-[15px] font-semibold leading-6 tracking-[-0.025em] text-zinc-950 group-hover:text-zinc-700">
          {card.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm leading-6 text-zinc-600">{card.summary}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
          {card.keywords.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-zinc-500">#{tag}</span>
          ))}
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-wrap gap-1.5 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:justify-self-start">
        {card.keywords.slice(0, 2).map((tag) => (
          <span key={tag} className="hidden items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 sm:inline-flex">#{tag}</span>
        ))}
      </div>

      <time dateTime={card.updatedAt} className="col-start-3 row-start-1 shrink-0 self-start text-right text-xs font-medium tabular-nums text-zinc-500 sm:col-start-4 sm:self-center">
        {formatKnowledgeDate(card.updatedAt)}
      </time>
    </article>
  );
}

export function KnowledgeCardSkeleton() {
  return (
    <div
      aria-hidden
      className="grid animate-pulse grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-3 px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,0.65fr)_6.5rem] sm:items-center sm:gap-x-5 sm:px-6"
    >
      <span className="row-span-2 size-10 rounded-xl bg-zinc-100" />
      <div className="min-w-0 space-y-2.5">
        <span className="block h-3 w-24 rounded bg-zinc-100" />
        <span className="block h-4 w-4/5 rounded bg-zinc-100" />
        <span className="block h-3 w-full rounded bg-zinc-100" />
      </div>
      <span className="col-span-2 row-start-2 h-6 w-28 rounded-md bg-zinc-100 sm:col-span-1 sm:col-start-3 sm:row-start-1" />
      <span className="col-start-3 row-start-1 h-3 w-14 justify-self-end rounded bg-zinc-100 sm:col-start-4" />
    </div>
  );
}
