import { ArrowUpRight, FileText, LibraryBig } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { formatKnowledgeDate } from "@/features/knowledge/formatters";
import { getProjectDomainStyle } from "@/features/projects/project-domain";
import type { ProjectSummary } from "@/features/projects/types";
import { cn } from "@/utils/cn";

const VISIBLE_STACK_COUNT = 3;
const stackClassName = "rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600";

/** 대표 기술 뱃지. 긴 이름은 말줄임하고 나머지는 개수와 툴팁으로 알린다. */
export function ProjectStack({ stack, className }: { stack: string[]; className?: string }) {
  const hidden = stack.slice(VISIBLE_STACK_COUNT);
  if (stack.length === 0) return null;

  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {stack.slice(0, VISIBLE_STACK_COUNT).map((item) => (
        <span key={item} title={item} className={`inline-block max-w-full truncate ${stackClassName}`}>{item}</span>
      ))}
      {hidden.length > 0 && (
        <span title={hidden.join(", ")} aria-label={`외 ${hidden.length}개: ${hidden.join(", ")}`} className={`inline-block font-mono tabular-nums ${stackClassName}`}>
          +{hidden.length}
        </span>
      )}
    </span>
  );
}

export function ProjectFolder({ project, listQuery }: { project: ProjectSummary; listQuery: string }) {
  const domain = getProjectDomainStyle(project.domain);
  const DomainIcon = domain.icon;

  return (
    <Link
      href={`/projects/${project.id}?${listQuery}`}
      className="group relative flex min-w-0 flex-col pt-[1.875rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-4 focus-visible:ring-offset-stone-50"
    >
      {/*
        폴더 탭. 분야 색 면으로 본문 윗선을 덮어 본문과 한 덩어리로 이어 보이게 한다.
        색 면은 ::before 를 아래쪽 기준으로 눕혀 윗변이 좁은 사다리꼴로 만든다(모서리 둥글기 유지).
      */}
      <span
        style={{ "--tab-color": domain.color, color: domain.ink } as CSSProperties}
        className="absolute left-0 top-0 z-10 isolate flex h-8 max-w-[calc(100%-3rem)] items-center gap-1.5 px-3.5 pb-0.5 text-xs font-semibold leading-none before:absolute before:inset-0 before:-z-10 before:origin-bottom before:rounded-t-lg before:bg-(--tab-color) before:[transform:perspective(12px)_rotateX(3.4deg)]"
      >
        <DomainIcon className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{domain.label}</span>
      </span>

      <span className="flex flex-1 flex-col rounded-xl rounded-tl-none border border-zinc-200 bg-white p-5 transition-[border-color,box-shadow] duration-200 group-hover:border-brand/35 group-hover:shadow-[0_14px_28px_-22px_rgba(35,33,30,0.45)]">
        <span className="flex items-start justify-between gap-4">
          <span className="min-w-0 text-pretty break-keep text-lg font-semibold leading-7 tracking-[-0.025em] text-zinc-950">
            {project.name}
          </span>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-zinc-300 transition-[color,transform] duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-brand-strong motion-reduce:transition-none" aria-hidden />
        </span>

        {(project.team || project.period) && (
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-500">
            {project.team && <span className="font-medium text-zinc-700">{project.team}</span>}
            {project.period && <span className="font-mono tabular-nums">{project.period}</span>}
          </span>
        )}
        {project.description && (
          <span className="mt-3.5 line-clamp-2 min-h-11 break-keep text-sm leading-[1.375rem] text-zinc-600">{project.description}</span>
        )}
        {/* 기술 뱃지가 없는 카드도 줄 위치가 같도록 한 줄 높이를 비워 둔다. */}
        <span className="mt-3.5 block min-h-6">
          <ProjectStack stack={project.stack} />
        </span>

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
      <span className="absolute left-0 top-0 z-10 h-8 w-28 rounded-t-lg border border-b-0 border-zinc-200 bg-white" />
      <span className="-mt-0.5 block h-[15rem] rounded-xl rounded-tl-none border border-zinc-200 bg-white" />
    </div>
  );
}
