"use client";

import { AlignLeft, Building2, CalendarDays, CheckCircle2, Clock3, ExternalLink, FileText, FolderKanban, HelpCircle, Lightbulb, ListChecks, Layers3, Scale, Search, Tag, type LucideIcon, Wrench, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { formatKnowledgeDate } from "@/features/knowledge/formatters";
import type { KnowledgeCard } from "@/features/knowledge/types";
import { cn } from "@/utils/cn";

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
    <div className="min-w-0">
      <dt className="flex items-center gap-2 text-xs font-medium text-zinc-500"><Icon className="size-3.5 shrink-0 text-zinc-400" aria-hidden />{label}</dt>
      <dd className="mt-1.5 truncate text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  );
}

export function KnowledgeCardDetailPanel({ card, onClose, relatedCards, onSelectCard, sourceContext }: { card: KnowledgeCard | null; onClose: () => void; relatedCards?: KnowledgeCard[]; onSelectCard?: (card: KnowledgeCard) => void; sourceContext?: { excerpt: string; location: string } }) {
  return (
    <Sheet open={Boolean(card)} onOpenChange={(open) => !open && onClose()}>
      {card && <DetailPanelContent card={card} relatedCards={relatedCards} onSelectCard={onSelectCard} sourceContext={sourceContext} />}
    </Sheet>
  );
}

function DetailPanelContent({ card, relatedCards, onSelectCard, sourceContext }: { card: KnowledgeCard; relatedCards?: KnowledgeCard[]; onSelectCard?: (card: KnowledgeCard) => void; sourceContext?: { excerpt: string; location: string } }) {
  const shouldReduceMotion = useReducedMotion();
  const evidence = card.evidences[0];
  const sourceTitle = evidence?.documentTitle ?? "";
  const keywordText = card.keywords.join(", ");
  // 값이 없는 항목은 임시 문장으로 채운다. (실제 필드만 표시하도록 바꾸기 전까지 유지)
  const detail = {
    context: card.context || card.summary,
    problem: card.problem ?? `${keywordText} 영역에서 기존 방식으로는 일관된 판단과 대응이 어려웠습니다.`,
    cause: card.cause ?? "기준이 문서화되어 있지 않아 담당자마다 판단이 달랐던 점이 원인으로 확인됐습니다.",
    approach: card.approach ?? `${sourceTitle}에 정리한 기준을 바탕으로 ${keywordText} 관련 판단과 실행 순서를 맞춥니다.`,
    rationale: card.rationale ?? "팀이 같은 기준으로 반복 적용할 수 있고 변경 비용이 낮은 방법을 우선했습니다.",
    outcome: card.outcome ?? "팀이 같은 기준으로 판단하고 후속 작업을 이어갈 수 있도록 정리했습니다.",
    lesson: card.lesson || "같은 문제가 반복되지 않도록 판단 기준과 후속 확인 항목을 함께 남깁니다.",
  };
  const metadataRows = [
    { icon: Building2, label: "담당 부서", value: card.department ?? "미지정" },
    { icon: FolderKanban, label: "출처 프로젝트", value: card.projectName ?? sourceTitle },
    { icon: CalendarDays, label: "프로젝트 날짜", value: formatKnowledgeDate(card.projectDate ?? card.createdAt) },
    { icon: Clock3, label: "카드 업데이트", value: formatKnowledgeDate(card.updatedAt) },
  ];
  const recordRows = [
    { title: "배경", description: detail.context, icon: FileText, className: "bg-stone-100 text-stone-600" },
    { title: "문제", description: detail.problem, icon: HelpCircle, className: "bg-rose-50 text-rose-600" },
    { title: "원인", description: detail.cause, icon: Search, className: "bg-amber-50 text-amber-600" },
    { title: "접근 방법", description: detail.approach, icon: Wrench, className: "bg-sky-50 text-sky-600" },
    { title: "선택 이유", description: detail.rationale, icon: Scale, className: "bg-indigo-50 text-indigo-600" },
    { title: "결과", description: detail.outcome, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
    { title: "재사용 포인트", description: detail.lesson, icon: Lightbulb, className: "bg-violet-50 text-violet-600" },
  ];

  return (
    <SheetContent
      side="right"
      overlayClassName="bg-zinc-950/25 backdrop-blur-[1px]"
      className="inset-y-3 right-3 h-[calc(100dvh-1.5rem)] w-[min(44rem,calc(100vw-1.5rem))] max-w-none overflow-visible border-0 bg-transparent p-0 shadow-none data-[state=closed]:animate-none data-[state=open]:animate-none sm:inset-y-4 sm:right-4 sm:h-[calc(100dvh-2rem)] sm:w-[min(44rem,calc(100vw-2rem))] sm:max-w-none"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 80, scale: 0.975 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 28, mass: 0.82 }}
        className="flex size-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-[-20px_28px_80px_-34px_rgba(35,33,30,0.26),0_1px_0_rgba(255,255,255,0.95)_inset]"
      >
      <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 sm:px-7">
        <p className="text-sm font-semibold text-zinc-700">지식 상세</p>
        <SheetClose asChild>
          <button
            type="button"
            aria-label="닫기"
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
          >
            <X className="size-5" aria-hidden />
          </button>
        </SheetClose>
      </header>

      <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-7 sm:px-9 sm:pt-9">
        <SheetDescription className="sr-only">{card.title} 지식카드의 상세 정보입니다.</SheetDescription>
          <div className="flex items-start gap-3">
            <SheetTitle asChild>
              <h2 className="min-w-0 text-[1.7rem] font-semibold leading-[1.22] tracking-[-0.045em] text-zinc-950">{card.title}</h2>
            </SheetTitle>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 pr-0.5 text-xs font-semibold text-zinc-400"><Tag className="size-3.5" aria-hidden />키워드</span>
            {card.keywords.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"><span className="mr-0.5 text-zinc-400">#</span>{tag}</span>
            ))}
          </div>
          {card.technologies.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 pr-0.5 text-xs font-semibold text-zinc-400"><Wrench className="size-3.5" aria-hidden />기술</span>
              {card.technologies.map((tech) => (
                <span key={tech} className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">{tech}</span>
              ))}
            </div>
          )}

          <DetailPanelSection title="지식 카드 요약" icon={AlignLeft} labelledBy="knowledge-card-summary-title">
            <aside className="mt-4 border-l-2 border-brand bg-slate-50 px-4 py-3.5">
              <p className="text-[15px] font-medium leading-7 tracking-[-0.01em] text-zinc-800">{card.summary}</p>
            </aside>
          </DetailPanelSection>

          <DetailPanelSection title="처리 기록" icon={ListChecks} labelledBy="knowledge-card-records-title" className="mt-9">
            <ol className="mt-5 space-y-6" aria-label="처리 기록">
              {recordRows.map((row, index) => <DetailRow key={row.title} {...row} isLast={index === recordRows.length - 1} />)}
            </ol>
          </DetailPanelSection>

          <DetailPanelSection title="원본 문서" icon={FileText} labelledBy="knowledge-card-source-title" className="mt-9 border-t border-zinc-200 pt-6">
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600"><FileText className="size-4" aria-hidden /></span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-800">{sourceTitle}</p><p className="mt-0.5 text-xs text-zinc-500">연결된 원본 문서</p></div>
              </div>
              {evidence?.url ? (
                <a href={evidence.url} target="_blank" rel="noreferrer" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"><ExternalLink className="size-4" aria-hidden />열기</a>
              ) : null}
            </div>
            {sourceContext && <blockquote className="mt-4 border-l-2 border-zinc-200 px-4 text-[15px] leading-7 text-zinc-700">{sourceContext.excerpt}<footer className="mt-2 text-xs font-medium text-zinc-500">{sourceContext.location}</footer></blockquote>}
          </DetailPanelSection>

          {relatedCards && relatedCards.length > 1 && onSelectCard && <DetailPanelSection title="이 문서에서 생성된 지식카드" icon={Layers3} labelledBy="knowledge-card-related-title" className="mt-9 border-t border-zinc-200 pt-6"><div className="mt-3 flex flex-col gap-1">{relatedCards.map((relatedCard) => { const selected = relatedCard.id === card.id; return <button key={relatedCard.id} type="button" onClick={() => onSelectCard(relatedCard)} aria-pressed={selected} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45", selected ? "bg-zinc-100 text-zinc-950" : "text-zinc-600 hover:bg-zinc-50")}><span className="min-w-0 truncate font-medium">{relatedCard.title}</span></button>; })}</div></DetailPanelSection>}

          <DetailPanelSection title="카드 정보" icon={Layers3} labelledBy="knowledge-card-metadata-title" className="mt-9 border-t border-zinc-200 pt-6">
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 sm:grid-cols-2 sm:p-5">
              {metadataRows.map((row) => <RecordMetaRow key={row.label} {...row} />)}
            </dl>
          </DetailPanelSection>
      </div>
      </motion.div>
    </SheetContent>
  );
}
