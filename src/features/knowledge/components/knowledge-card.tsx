import { formatKnowledgeDate } from "@/features/knowledge/formatters";
import type { KnowledgeCard as KnowledgeCardData } from "@/features/knowledge/types";
import { getProjectDomainStyle } from "@/features/projects/project-meta";
import { cn } from "@/utils/cn";

const tagClassName = "items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600";

/** 한 줄을 넘지 않도록 앞의 태그만 보이고, 나머지는 개수와 툴팁으로 알린다. */
function CardTags({ card, visibleCount, className }: { card: KnowledgeCardData; visibleCount: number; className?: string }) {
  const tags = [...new Set([...card.keywords.map((tag) => `#${tag}`), ...card.technologies])];
  const hidden = tags.slice(visibleCount);

  return (
    <div aria-label="키워드 및 기술스택" className={cn("flex min-w-0 gap-1.5", className)}>
      {tags.slice(0, visibleCount).map((tag) => (
        <span key={tag} className={cn("inline-block min-w-0 truncate first:max-w-[65%] first:shrink-0", tagClassName)}>{tag}</span>
      ))}
      {hidden.length > 0 && (
        <span title={hidden.join(", ")} aria-label={`외 ${hidden.length}개: ${hidden.join(", ")}`} className={cn("inline-flex shrink-0 font-mono tabular-nums", tagClassName)}>
          +{hidden.length}
        </span>
      )}
    </div>
  );
}

export function KnowledgeCard({ card, onOpen }: { card: KnowledgeCardData; onOpen: (card: KnowledgeCardData) => void }) {
  const sourceTitle = card.projectName ?? card.evidences[0]?.documentTitle ?? "";
  const domain = getProjectDomainStyle(card.projectName);
  const DomainIcon = domain.icon;

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
      className="group relative grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 px-5 py-5 transition-[background-color,box-shadow] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/45 sm:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,0.65fr)_6.5rem] sm:items-center sm:gap-x-5 sm:px-6"
    >
      <span aria-hidden className="absolute inset-y-4 left-0 w-0.5 scale-y-0 bg-brand transition-transform duration-200 group-hover:scale-y-100" />
      <span
        title={domain.label}
        style={{ backgroundColor: domain.color, color: domain.ink }}
        className="row-span-2 grid size-10 shrink-0 place-items-center rounded-xl"
      >
        <DomainIcon className="size-[18px]" aria-hidden />
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ color: domain.ink }} className="truncate text-xs font-semibold">{sourceTitle}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-pretty break-keep text-[15px] font-semibold leading-6 tracking-[-0.025em] text-zinc-950 group-hover:text-zinc-700">
          {card.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm leading-6 text-zinc-600">{card.summary}</p>
        <CardTags card={card} visibleCount={1} className="mt-2.5 sm:hidden" />
      </div>

      <CardTags card={card} visibleCount={2} className="hidden sm:col-start-3 sm:row-start-1 sm:flex" />

      <time dateTime={card.updatedAt} className="col-start-2 row-start-2 shrink-0 self-start text-xs tabular-nums text-zinc-500 sm:col-start-4 sm:row-start-1 sm:self-center sm:text-right">
        {formatKnowledgeDate(card.updatedAt)}
      </time>
    </article>
  );
}

export function KnowledgeCardSkeleton() {
  return (
    <div
      aria-hidden
      className="grid animate-pulse grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)_minmax(8rem,0.65fr)_6.5rem] sm:items-center sm:gap-x-5 sm:px-6"
    >
      <span className="row-span-2 size-10 rounded-xl bg-zinc-100" />
      <div className="min-w-0 space-y-2.5">
        <span className="block h-3 w-24 rounded bg-zinc-100" />
        <span className="block h-4 w-4/5 rounded bg-zinc-100" />
        <span className="block h-3 w-full rounded bg-zinc-100" />
      </div>
      <span className="col-span-2 row-start-2 h-6 w-28 rounded-md bg-zinc-100 sm:col-span-1 sm:col-start-3 sm:row-start-1" />
      <span className="col-start-2 row-start-2 h-3 w-14 rounded bg-zinc-100 sm:col-start-4 sm:row-start-1 sm:justify-self-end" />
    </div>
  );
}
