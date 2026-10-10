"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlignLeft, Building2, CalendarDays, CheckCircle2, Clock3, ExternalLink, FileText, FolderKanban, Lightbulb, ListChecks, Layers3, Tag, type LucideIcon, Wrench, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { cardTypeConfig, formatKnowledgeDate } from "@/lib/knowledge/config";
import type { KnowledgeCard } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

function DetailRow({
  title,
  description,
  icon: Icon,
  className,
  isLast = false,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  className: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative flex gap-3.5">
      {!isLast && <span aria-hidden className="absolute -bottom-6 left-[1.125rem] top-9 w-px bg-zinc-200" />}
      <span className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-xl", className)}>
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-7 text-zinc-700">{description}</p>
      </div>
    </li>
  );
}

function DetailPanelSection({
  title,
  icon: Icon,
  labelledBy,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-7", className)} aria-labelledby={labelledBy}>
      <h3 id={labelledBy} className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
        <Icon className="size-4 text-zinc-400" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

function RecordMetaRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-3">
      <dt className="flex min-w-0 items-center gap-2 text-sm text-zinc-500"><Icon className="size-4 shrink-0 text-zinc-400" aria-hidden />{label}</dt>
      <dd className="min-w-0 max-w-[60%] text-right text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  );
}

export function KnowledgeCardDetailPanel({ card, onClose }: { card: KnowledgeCard | null; onClose: () => void }) {
  useEffect(() => {
    if (!card) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", closeOnEscape);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [card, onClose]);

  return (
    <AnimatePresence>
      {card && <DetailPanelContent card={card} onClose={onClose} />}
    </AnimatePresence>
  );
}

function DetailPanelContent({ card, onClose }: { card: KnowledgeCard; onClose: () => void }) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { label, icon: Icon, badgeClassName } = cardTypeConfig[card.type];
  const detail = card.detail ?? {
    situation: card.summary,
    resolution: `${card.source}에 정리한 기준을 바탕으로 ${card.tags.join(", ")} 관련 판단과 실행 순서를 맞춥니다.`,
    outcome: "팀이 같은 기준으로 판단하고 후속 작업을 이어갈 수 있도록 정리했습니다.",
    lesson: "같은 문제가 반복되지 않도록 판단 기준과 후속 확인 항목을 함께 남깁니다.",
  };
  const metadataRows = [
    { icon: Layers3, label: "카드 유형", value: label },
    { icon: Building2, label: "담당 부서", value: card.department ?? "미지정" },
    { icon: FolderKanban, label: "출처 프로젝트", value: card.source },
    { icon: CalendarDays, label: "프로젝트 날짜", value: formatKnowledgeDate(card.projectDate ?? card.createdAt) },
    { icon: Clock3, label: "카드 업데이트", value: formatKnowledgeDate(card.updatedAt) },
  ];
  const recordRows = [
    { title: "상황", description: detail.situation, icon: FileText, className: "bg-orange-50 text-orange-600" },
    { title: "대응 방법", description: detail.resolution, icon: Wrench, className: "bg-sky-50 text-sky-600" },
    { title: "결과", description: detail.outcome, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
    { title: "재사용 포인트", description: detail.lesson, icon: Lightbulb, className: "bg-violet-50 text-violet-600" },
  ];

  useEffect(() => {
    closeButtonRef.current?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial="closed"
      animate="open"
      exit="closed"
    >
      <motion.button
        type="button"
        aria-label="지식카드 상세 닫기"
        className="absolute inset-0 bg-zinc-950/25 backdrop-blur-[1px]"
        variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="knowledge-card-detail-title"
        className="relative m-3 flex h-[calc(100%-1.5rem)] w-full max-w-[39rem] flex-col overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-[-24px_24px_70px_-32px_rgba(24,36,31,0.5)] sm:m-4 sm:h-[calc(100%-2rem)]"
        variants={{ closed: { x: "100%" }, open: { x: 0 } }}
        transition={{ type: "spring", stiffness: 330, damping: 34, mass: 0.9 }}
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.1em] text-zinc-500">KNOWLEDGE CARD DETAILS</p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid size-10 place-items-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-6 sm:px-8 sm:pb-9 sm:pt-7">
          <div className="flex items-start gap-3">
            <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl", badgeClassName)}>
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <h2 id="knowledge-card-detail-title" className="min-w-0 text-[1.7rem] font-semibold leading-[1.22] tracking-[-0.045em] text-zinc-950">
              {card.title}
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 pr-0.5 text-xs font-semibold text-zinc-400"><Tag className="size-3.5" aria-hidden />키워드</span>
            {card.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"><span className="mr-0.5 text-zinc-400">#</span>{tag}</span>
            ))}
          </div>

          <dl className="mt-6 border-y border-zinc-200">
            {metadataRows.map((row) => <RecordMetaRow key={row.label} {...row} />)}
          </dl>

          <DetailPanelSection title="지식 카드 요약" icon={AlignLeft} labelledBy="knowledge-card-summary-title">
            <aside className="mt-4 rounded-2xl border border-brand/20 bg-brand/[0.08] px-5 py-4">
              <p className="text-[15px] font-medium leading-7 tracking-[-0.01em] text-zinc-800">{card.summary}</p>
            </aside>
          </DetailPanelSection>

          <DetailPanelSection title="처리 기록" icon={ListChecks} labelledBy="knowledge-card-records-title">
            <ol className="mt-4 space-y-6" aria-label="처리 기록">
              {recordRows.map((row, index) => <DetailRow key={row.title} {...row} isLast={index === recordRows.length - 1} />)}
            </ol>
          </DetailPanelSection>

          <DetailPanelSection title="원본 문서" icon={FileText} labelledBy="knowledge-card-source-title" className="mt-9 border-t border-zinc-200 pt-6">
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600"><FileText className="size-4" aria-hidden /></span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-800">{card.source}</p><p className="mt-0.5 text-xs text-zinc-500">연결된 원본 문서</p></div>
              </div>
              {card.sourceUrl ? (
                <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"><ExternalLink className="size-4" aria-hidden />열기</a>
              ) : null}
            </div>
          </DetailPanelSection>
        </div>
      </motion.aside>
    </motion.div>
  );
}
