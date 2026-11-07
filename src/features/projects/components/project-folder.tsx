import { ArrowUpRight, FileText, LibraryBig } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { formatKnowledgeDate } from "@/features/knowledge/formatters";
import {
  getProjectMeta,
  PROJECT_DOMAINS,
  PROJECT_STAGE_DOT,
  UNCLASSIFIED_DOMAIN,
} from "@/features/projects/project-meta";
import type { ProjectSummary } from "@/features/projects/types";

/** 폴더 탭 오른쪽의 곡선. 탭 높이(h-8)와 같은 비율로 그린다. */
function TabCurve() {
  return (
    <svg viewBox="0 0 24 32" aria-hidden className="-ml-px h-8 w-6 shrink-0 fill-(--folder-color)">
      <path d="M0 0h2c5 0 7 3 9 9l4 13c2 6 4 10 9 10H0z" />
    </svg>
  );
}

export function ProjectFolder({ project, listQuery }: { project: ProjectSummary; listQuery: string }) {
  const meta = getProjectMeta(project.name);
  const domain = meta ? PROJECT_DOMAINS[meta.domain] : UNCLASSIFIED_DOMAIN;
  const DomainIcon = domain.icon;

  return (
    <Link
      href={`/projects/${project.id}?${listQuery}`}
      style={{ "--folder-color": domain.color, "--folder-ink": domain.ink } as CSSProperties}
      className="group relative isolate flex min-w-0 flex-col rounded-xl pt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-50"
    >
      {/* 폴더 뒤판과 안에 든 문서 */}
      <span aria-hidden className="absolute inset-x-0 top-8 -z-20 h-8 rounded-tr-xl bg-(--folder-color)" />
      <span aria-hidden className="absolute left-[46%] right-5 top-3 -z-10 h-16 rounded-t-md border border-zinc-300/80 bg-stone-100 transition-transform duration-200 ease-out group-hover:-translate-y-1 motion-reduce:transition-none" />
      <span aria-hidden className="absolute left-[38%] right-2.5 top-[1.125rem] -z-10 h-16 rounded-t-md border border-zinc-300/80 bg-white transition-transform delay-[25ms] duration-200 ease-out group-hover:-translate-y-2 motion-reduce:transition-none" />

      <span className="absolute left-0 top-0 flex h-8 max-w-[calc(100%-3rem)] text-(--folder-ink)">
        <span className="flex min-w-0 items-center gap-1.5 rounded-tl-xl bg-(--folder-color) pl-3 pr-1 text-xs font-semibold tracking-[-0.01em]">
          <DomainIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{domain.label}</span>
        </span>
        <TabCurve />
      </span>

      <span className="mt-1.5 flex flex-1 flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-[border-color,box-shadow] duration-200 group-hover:border-brand/35 group-hover:shadow-[0_14px_28px_-22px_rgba(35,33,30,0.45)]">
        <span className="flex items-start justify-between gap-4">
          <span className="min-w-0 text-pretty break-keep text-lg font-semibold leading-7 tracking-[-0.025em] text-zinc-950">
            {project.name}
          </span>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-zinc-300 transition-[color,transform] duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-brand-strong motion-reduce:transition-none" aria-hidden />
        </span>

        {meta && (
          <>
            <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-zinc-700">
                <span aria-hidden className={`size-1.5 rounded-full ${PROJECT_STAGE_DOT[meta.stage]}`} />
                {meta.stage}
              </span>
              <span>{meta.team}</span>
              <span className="font-mono tabular-nums">{meta.period}</span>
            </span>
            <span className="mt-3.5 line-clamp-2 min-h-11 break-keep text-sm leading-[1.375rem] text-zinc-600">{meta.description}</span>
            <span className="mt-3.5 flex flex-wrap gap-1.5">
              {meta.stack.map((item) => (
                <span key={item} className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">{item}</span>
              ))}
            </span>
          </>
        )}

        <span className="mt-auto pt-5">
          <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
            <span className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-3.5" aria-hidden />
                문서 <span className="font-mono font-semibold tabular-nums text-zinc-700">{project.documentCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LibraryBig className="size-3.5" aria-hidden />
                지식카드 <span className="font-mono font-semibold tabular-nums text-zinc-700">{project.cardCount}</span>
              </span>
            </span>
            <time dateTime={project.createdAt} className="tabular-nums text-zinc-400">
              {formatKnowledgeDate(project.createdAt)} 등록
            </time>
          </span>
        </span>
      </span>
    </Link>
  );
}

export function ProjectFolderSkeleton() {
  return (
    <div aria-hidden className="relative animate-pulse pt-8">
      <span className="absolute left-0 top-0 h-9 w-32 rounded-t-xl bg-zinc-200" />
      <span className="relative mt-1.5 block h-[15rem] rounded-xl border border-zinc-200 bg-white" />
    </div>
  );
}
