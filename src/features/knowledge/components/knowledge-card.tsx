"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { formatKnowledgeDate } from "@/features/knowledge/formatters";
import type { KnowledgeCard as KnowledgeCardData } from "@/features/knowledge/types";
import { getProjectDomainStyle } from "@/features/projects/project-domain";
import { cn } from "@/utils/cn";

const TAG_GAP = 6;
const MORE_TAG_WIDTH = 36;
const tagClassName = "inline-block shrink-0 rounded-md px-2 py-1 text-xs font-medium leading-4 text-zinc-600";
const tagVariants = {
  keyword: "bg-zinc-100",
  technology: "bg-white shadow-[inset_0_0_0_1px_var(--color-zinc-200)]",
};

/** 행 폭에 들어가는 만큼 태그를 보여주고, 나머지는 개수와 툴팁으로 알린다. */
function TagRow({ label, tags, variant }: { label: string; tags: string[]; variant: keyof typeof tagVariants }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);
  const hidden = tags.slice(visibleCount);
  const format = (tag: string) => (variant === "keyword" ? `#${tag}` : tag);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const fit = () => {
      const widths = Array.from(measure.children, (tag) => (tag as HTMLElement).offsetWidth);
      let used = 0;
      let count = 0;
      for (const [index, width] of widths.entries()) {
        used += width + (index > 0 ? TAG_GAP : 0);
        const reserved = index < widths.length - 1 ? TAG_GAP + MORE_TAG_WIDTH : 0;
        if (used + reserved > row.clientWidth) break;
        count += 1;
      }
      setVisibleCount(Math.max(count, 1));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    return () => observer.disconnect();
  }, [tags]);

  if (tags.length === 0) return null;

  return (
    <div ref={rowRef} aria-label={label} className="relative flex h-6 min-w-0 gap-1.5 overflow-hidden">
      <div ref={measureRef} aria-hidden className="invisible absolute flex w-max gap-1.5">
        {tags.map((tag) => <span key={tag} className={tagClassName}>{format(tag)}</span>)}
      </div>
      {tags.slice(0, visibleCount).map((tag) => (
        <span key={tag} title={format(tag)} className={cn(tagClassName, "min-w-0 shrink truncate", tagVariants[variant])}>{format(tag)}</span>
      ))}
      {hidden.length > 0 && (
        <span title={hidden.map(format).join(", ")} aria-label={`외 ${hidden.length}개: ${hidden.map(format).join(", ")}`} className={cn(tagClassName, "font-mono tabular-nums", tagVariants[variant])}>
          +{hidden.length}
        </span>
      )}
    </div>
  );
}

export function KnowledgeCard({
  card,
  onOpen,
  dateField = "updatedAt",
}: {
  card: KnowledgeCardData;
  onOpen: (card: KnowledgeCardData) => void;
  /** 오른쪽 날짜 칸에 보여줄 값. 드래프트 목록은 생성일을 쓴다. */
  dateField?: "updatedAt" | "createdAt";
}) {
  const sourceTitle = card.projectName ?? card.evidences[0]?.documentTitle ?? "";
  const domain = getProjectDomainStyle(card.projectDomain);
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
      className="group relative grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 px-5 py-5 transition-[background-color,box-shadow] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/45 sm:grid-cols-[auto_minmax(0,1fr)_minmax(12rem,0.9fr)_6.5rem] sm:items-center sm:gap-x-5 sm:gap-y-0 sm:px-6"
    >
      <span aria-hidden className="absolute inset-y-4 left-0 w-0.5 scale-y-0 bg-brand transition-transform duration-200 group-hover:scale-y-100" />
      <span
        style={{ backgroundColor: domain.color, color: domain.ink }}
        className="row-span-2 grid size-10 shrink-0 place-items-center rounded-xl sm:row-span-1"
      >
        <DomainIcon className="size-[18px]" aria-hidden />
      </span>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <span style={{ backgroundColor: domain.color, color: domain.ink }} className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold leading-4">{domain.label}</span>
          <span className="truncate text-xs font-medium text-zinc-500">{sourceTitle}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-pretty break-keep text-[15px] font-semibold leading-6 tracking-[-0.025em] text-zinc-950 group-hover:text-zinc-700">
          {card.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm leading-6 text-zinc-600">{card.summary}</p>
      </div>

      <div className="col-start-2 row-start-2 min-w-0 space-y-1.5 sm:col-start-3 sm:row-start-1">
        <TagRow label="키워드" tags={card.keywords} variant="keyword" />
        <TagRow label="기술스택" tags={card.technologies} variant="technology" />
      </div>

      <time dateTime={card[dateField]} className="col-start-2 row-start-3 shrink-0 self-start text-xs tabular-nums text-zinc-500 sm:col-start-4 sm:row-start-1 sm:self-center sm:text-right">
        {formatKnowledgeDate(card[dateField])}
      </time>
    </article>
  );
}

export function KnowledgeCardSkeleton() {
  return (
    <div
      aria-hidden
      className="grid animate-pulse grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 px-5 py-5 sm:grid-cols-[auto_minmax(0,1fr)_minmax(12rem,0.9fr)_6.5rem] sm:items-center sm:gap-x-5 sm:gap-y-0 sm:px-6"
    >
      <span className="row-span-2 size-10 rounded-xl bg-zinc-100 sm:row-span-1" />
      <div className="min-w-0 space-y-2.5">
        <span className="block h-3 w-24 rounded bg-zinc-100" />
        <span className="block h-4 w-4/5 rounded bg-zinc-100" />
        <span className="block h-3 w-full rounded bg-zinc-100" />
      </div>
      <span className="col-span-2 row-start-2 h-6 w-28 rounded-md bg-zinc-100 sm:col-span-1 sm:col-start-3 sm:row-start-1" />
      <span className="col-start-2 row-start-3 h-3 w-14 rounded bg-zinc-100 sm:col-start-4 sm:row-start-1 sm:justify-self-end" />
    </div>
  );
}
