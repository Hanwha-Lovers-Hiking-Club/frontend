"use client";

import { Activity, AlignLeft, ArrowLeft, Bot, Building2, CalendarDays, CalendarPlus, CheckCircle2, Clock3, Eye, FileText, FolderKanban, HelpCircle, History, Lightbulb, ListChecks, Layers3, MessageSquareQuote, Scale, Search, Tag, TriangleAlert, type LucideIcon, Wrench, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useCallback } from "react";

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { type AnswerSource, KnowledgeCardEvidences } from "@/features/knowledge/components/knowledge-card-evidences";
import { fetchKnowledgeCard } from "@/features/knowledge/api";
import { formatKnowledgeCount, formatKnowledgeDate, formatKnowledgeDateTime } from "@/features/knowledge/formatters";
import type { KnowledgeCard } from "@/features/knowledge/types";
import { useRequest } from "@/features/projects/components/use-request";
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
      <dd className="mt-1.5 break-words text-sm font-semibold text-zinc-800">{value}</dd>
    </div>
  );
}

type DetailBodyProps = {
  card: KnowledgeCard;
  relatedCards?: KnowledgeCard[];
  onSelectCard?: (card: KnowledgeCard) => void;
  /** 챗봇 답변에 쓰인 문서와 발췌. 있으면 원본 문서 목록에서 맨 위로 올려 강조한다. */
  sourceContext?: AnswerSource;
  /** 챗봇이 이 카드를 답변 근거로 고른 이유. 챗봇에서 열었을 때만 있다. */
  selectionReason?: string;
  /** draft 면 이용 통계 대신 보류 사유를 보여준다. */
  variant?: "active" | "draft";
};

type LoadCardDetail = (cardId: string, signal: AbortSignal) => Promise<KnowledgeCard>;

/**
 * 목록에서 고른 카드를 열면 상세 API 를 한 번 호출하고, 응답이 오면 그 값으로 바꿔 그린다.
 * 응답 전이나 실패 시에는 목록에 있던 카드 값을 그대로 쓴다. 통계 수치는 보정하지 않는다.
 */
export function KnowledgeCardDetailPanel({
  card,
  onClose,
  loadDetail = fetchKnowledgeCard,
  ...props
}: Omit<DetailBodyProps, "card"> & { card: KnowledgeCard | null; onClose: () => void; loadDetail?: LoadCardDetail }) {
  return (
    <Sheet open={Boolean(card)} onOpenChange={(open) => !open && onClose()}>
      {card && (
        <SidePanelContent heading={props.variant === "draft" ? "드래프트 상세" : "지식 상세"} contentKey={card.id}>
          <FetchedDetailBody key={card.id} card={card} loadDetail={loadDetail} {...props} />
        </SidePanelContent>
      )}
    </Sheet>
  );
}

function FetchedDetailBody({ card, loadDetail, ...props }: DetailBodyProps & { loadDetail: LoadCardDetail }) {
  const load = useCallback((signal: AbortSignal) => loadDetail(card.id, signal), [card.id, loadDetail]);
  const { data, error, isLoading } = useRequest(card.id, load);

  return (
    <>
      {error && (
        <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          최신 상세 정보를 불러오지 못해 목록의 정보로 표시합니다. ({error.message})
        </p>
      )}
      <KnowledgeCardDetailBody card={data ?? card} isRefreshing={isLoading} {...props} />
    </>
  );
}

/** 오른쪽에서 열리는 상세 패널의 공통 틀. 안의 내용만 바뀔 때는 다시 미끄러져 들어오지 않는다. */
export function SidePanelContent({
  heading,
  contentKey,
  onBack,
  backLabel = "뒤로",
  children,
}: {
  heading: string;
  /** 바뀌면 본문 스크롤을 맨 위로 되돌린다. */
  contentKey: string;
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

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
        <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label={backLabel}
                className="-ml-2 grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
              >
                <ArrowLeft className="size-[18px]" aria-hidden />
              </button>
            )}
            <p className="truncate text-sm font-semibold text-zinc-700">{heading}</p>
          </div>
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

        <div key={contentKey} className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-7 sm:px-9 sm:pt-9">
          {children}
        </div>
      </motion.div>
    </SheetContent>
  );
}

export function KnowledgeCardDetailBody({ card, relatedCards, onSelectCard, sourceContext, selectionReason, variant = "active", isRefreshing = false }: DetailBodyProps & { isRefreshing?: boolean }) {
  const isDraft = variant === "draft";
  const usageRows = [
    { icon: Eye, label: "열람 횟수", value: formatKnowledgeCount(card.viewCount) },
    { icon: Bot, label: "챗봇 참조 횟수", value: formatKnowledgeCount(card.referenceCount) },
    { icon: History, label: "마지막 열람", value: formatKnowledgeDateTime(card.lastViewedAt) },
    { icon: MessageSquareQuote, label: "마지막 챗봇 참조", value: formatKnowledgeDateTime(card.lastReferencedAt) },
  ];
  const draftReasons = (card.draftReasons ?? []).filter((reason) => reason.trim().length > 0);
  const metadataRows = [
    { icon: Building2, label: "담당 부서", value: card.department ?? "미지정" },
    { icon: FolderKanban, label: "출처 프로젝트", value: card.projectName ?? "미지정" },
    { icon: CalendarDays, label: "프로젝트 날짜", value: card.projectDate ? formatKnowledgeDate(card.projectDate) : "미지정" },
    { icon: CalendarPlus, label: "카드 생성일", value: formatKnowledgeDate(card.createdAt) },
    { icon: Clock3, label: "카드 업데이트", value: formatKnowledgeDate(card.updatedAt) },
  ];
  const recordRows = [
    { title: "배경", description: card.context, icon: FileText, className: "bg-stone-100 text-stone-600" },
    { title: "문제", description: card.problem, icon: HelpCircle, className: "bg-rose-50 text-rose-600" },
    { title: "원인", description: card.cause, icon: Search, className: "bg-amber-50 text-amber-600" },
    { title: "접근 방법", description: card.approach, icon: Wrench, className: "bg-sky-50 text-sky-600" },
    { title: "선택 이유", description: card.rationale, icon: Scale, className: "bg-indigo-50 text-indigo-600" },
    { title: "결과", description: card.outcome, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
    { title: "재사용 포인트", description: card.lesson, icon: Lightbulb, className: "bg-violet-50 text-violet-600" },
  ].flatMap((row) => (row.description ? [{ ...row, description: row.description }] : []));

  return (
    <>
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

          {isDraft && (
            <DetailPanelSection title="보류 사유" icon={TriangleAlert} labelledBy="knowledge-card-draft-reasons-title">
              {draftReasons.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {draftReasons.map((reason, index) => (
                    <li key={`${index}-${reason}`} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] leading-7 text-amber-900">{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-sm text-zinc-500">사유 기록 없음</p>
              )}
            </DetailPanelSection>
          )}

          {selectionReason && (
            <DetailPanelSection title="이 답변에 쓰인 이유" icon={MessageSquareQuote} labelledBy="knowledge-card-reason-title">
              <p className="mt-3 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-[15px] leading-7 text-zinc-800">{selectionReason}</p>
            </DetailPanelSection>
          )}

          <DetailPanelSection title="처리 기록" icon={ListChecks} labelledBy="knowledge-card-records-title" className="mt-9">
            <ol className="mt-5 space-y-6" aria-label="처리 기록">
              {recordRows.map((row, index) => <DetailRow key={row.title} {...row} isLast={index === recordRows.length - 1} />)}
            </ol>
          </DetailPanelSection>

          <DetailPanelSection title="원본 문서" icon={FileText} labelledBy="knowledge-card-source-title" className="mt-9 border-t border-zinc-200 pt-6">
            <KnowledgeCardEvidences key={card.id} evidences={card.evidences} answerSource={sourceContext} />
          </DetailPanelSection>

          {relatedCards && relatedCards.length > 1 && onSelectCard && <DetailPanelSection title="이 문서에서 생성된 지식카드" icon={Layers3} labelledBy="knowledge-card-related-title" className="mt-9 border-t border-zinc-200 pt-6"><div className="mt-3 flex flex-col gap-1">{relatedCards.map((relatedCard) => { const selected = relatedCard.id === card.id; return <button key={relatedCard.id} type="button" onClick={() => onSelectCard(relatedCard)} aria-pressed={selected} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45", selected ? "bg-zinc-100 text-zinc-950" : "text-zinc-600 hover:bg-zinc-50")}><span className="min-w-0 truncate font-medium">{relatedCard.title}</span></button>; })}</div></DetailPanelSection>}

          {!isDraft && (
            <DetailPanelSection title="이용 통계" icon={Activity} labelledBy="knowledge-card-usage-title" className="mt-9 border-t border-zinc-200 pt-6">
              <dl aria-busy={isRefreshing} className={cn("mt-3 grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 transition-opacity sm:grid-cols-2 sm:p-5", isRefreshing && "opacity-60")}>
                {usageRows.map((row) => <RecordMetaRow key={row.label} {...row} />)}
              </dl>
            </DetailPanelSection>
          )}

          <DetailPanelSection title="카드 정보" icon={Layers3} labelledBy="knowledge-card-metadata-title" className="mt-9 border-t border-zinc-200 pt-6">
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 sm:grid-cols-2 sm:p-5">
              {metadataRows.map((row) => <RecordMetaRow key={row.label} {...row} />)}
            </dl>
          </DetailPanelSection>
    </>
  );
}
