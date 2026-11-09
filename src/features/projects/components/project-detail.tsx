"use client";

import { ArrowLeft, ExternalLink, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { KnowledgeCardDetailPanel } from "@/features/knowledge/components/knowledge-card-detail-panel";
import { openDocument } from "@/features/knowledge/components/knowledge-card-evidences";
import { KnowledgeCardGrid } from "@/features/knowledge/components/knowledge-card-grid";
import type { KnowledgeCard } from "@/features/knowledge/types";
import { fetchProject } from "@/features/projects/api";
import { ProjectStack } from "@/features/projects/components/project-folder";
import { useRequest } from "@/features/projects/components/use-request";
import { getProjectDomainStyle } from "@/features/projects/project-domain";
import type { ProjectDocument } from "@/features/projects/types";
import { FileFormatIcon } from "@/utils/file-format";

function DocumentRow({ document }: { document: ProjectDocument }) {
  const [isOpening, setIsOpening] = useState(false);

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <FileFormatIcon filename={document.originalFilename} />
        <p className="min-w-0 break-words text-sm font-medium text-zinc-800">{document.originalFilename}</p>
      </div>
      <button
        type="button"
        disabled={isOpening}
        aria-label={`${document.originalFilename} 원본 열기`}
        onClick={async () => {
          setIsOpening(true);
          await openDocument({ documentId: document.id, originalFilename: document.originalFilename });
          setIsOpening(false);
        }}
        className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 disabled:cursor-wait disabled:opacity-60"
      >
        {isOpening ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ExternalLink className="size-4" aria-hidden />}
        열기
      </button>
    </li>
  );
}

function SectionHeader({ id, title, count }: { id: string; title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-zinc-50/65 px-5 py-4 sm:px-6">
      <h2 id={id} className="text-lg font-semibold tracking-[-0.03em] text-zinc-950">{title}</h2>
      {count !== undefined && <span className="font-mono text-xs tabular-nums text-zinc-500">{count}개</span>}
    </div>
  );
}

const sectionClassName =
  "mt-6 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 shadow-[0_24px_56px_-46px_rgba(35,33,30,0.24),0_1px_0_rgba(255,255,255,0.95)_inset]";

export function ProjectDetail({ projectId, listHref }: { projectId: string; listHref: string }) {
  const load = useCallback((signal: AbortSignal) => fetchProject(projectId, signal), [projectId]);
  const { data: project, error, isLoading, retry } = useRequest(projectId, load);
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);
  const closeDetailPanel = useCallback(() => setSelectedCard(null), []);
  const domain = getProjectDomainStyle(project?.domain ?? null);
  const DomainIcon = domain.icon;

  return (
    <main className="app-page px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div className="mx-auto w-full max-w-[90rem]">
        <Link
          href={listHref}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
        >
          <ArrowLeft className="size-4" aria-hidden />
          지식카드 · 프로젝트 목록
        </Link>

        <header className="mt-6 border-b border-zinc-200 pb-8">
          <div style={{ color: domain.ink }} className="flex items-center gap-2.5">
            <DomainIcon className="size-5" aria-hidden />
            <span className="text-sm font-semibold">{project ? domain.label : "프로젝트"}</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-5xl">
            {project?.name ?? (error ? "프로젝트" : "불러오는 중…")}
          </h1>
          {project?.description && (
            <p className="mt-3 max-w-2xl break-keep text-sm leading-6 text-zinc-600 sm:text-base">{project.description}</p>
          )}
          {project && (project.team || project.period || project.stack.length > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
              {project.team && <span className="font-medium text-zinc-700">{project.team}</span>}
              {project.period && <span className="font-mono text-xs tabular-nums">{project.period}</span>}
              <ProjectStack stack={project.stack} className="min-w-0" />
            </div>
          )}
        </header>

        {error ? (
          <div role="alert" className="mt-9 rounded-2xl border border-dashed border-zinc-200 px-5 py-12 text-center">
            <p className="text-sm text-zinc-500">{error.message}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm leading-none font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <section aria-labelledby="project-cards-title" className={sectionClassName}>
              <SectionHeader id="project-cards-title" title="지식카드" count={project?.cards.length} />
              <KnowledgeCardGrid
                cards={project?.cards ?? []}
                isLoading={isLoading}
                error={null}
                query=""
                emptyMessage="이 프로젝트에 공개된 지식카드가 없습니다."
                onRetry={retry}
                onOpenCard={setSelectedCard}
              />
            </section>

            <section aria-labelledby="project-documents-title" className={sectionClassName}>
              <SectionHeader id="project-documents-title" title="원본 문서" count={project?.documents.length} />
              <ul className="divide-y divide-zinc-200">
                {project?.documents.map((document) => (
                  <DocumentRow key={document.id} document={document} />
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
      <KnowledgeCardDetailPanel card={selectedCard} onClose={closeDetailPanel} />
      {project?.name.trim() === "조항지기" && <ProjectGreeting />}
    </main>
  );
}

function ProjectGreeting() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const audio = new Audio("/project-greeting.mp3");
    let hideTimer = 0;
    const showTimer = window.setTimeout(() => {
      setVisible(true);
      // 클릭 없이 직접 진입하면 브라우저가 재생을 막는다. 그때는 이미지만 보여준다.
      audio.play().catch(() => {});
      // 음원 길이(45초)에 맞춰 퇴장한다.
      hideTimer = window.setTimeout(() => setVisible(false), 45000);
    }, 1000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      audio.pause();
    };
  }, []);

  const hidden = reducedMotion ? { opacity: 0 } : { x: "120%" };
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          initial={hidden}
          // 등장은 아주 느리게(20초, 등속), 퇴장은 보통 속도
          animate={{ ...(reducedMotion ? { opacity: 1 } : { x: 0 }), transition: { duration: reducedMotion ? 0.4 : 20, ease: "linear" } }}
          exit={{ ...hidden, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
          className="pointer-events-none fixed bottom-0 right-6 z-50"
        >
          <Image src="/project-greeting.webp" alt="" width={1024} height={1536} className="h-[min(50dvh,28rem)] w-auto drop-shadow-xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
