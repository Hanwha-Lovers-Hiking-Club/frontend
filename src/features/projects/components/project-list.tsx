"use client";

import { FileText, Folder, LibraryBig } from "lucide-react";
import Link from "next/link";

import { fetchProjects } from "@/features/projects/api";
import { useRequest } from "@/features/projects/components/use-request";
import type { ProjectSummary } from "@/features/projects/types";
import { formatKnowledgeDate } from "@/features/knowledge/formatters";

function ProjectFolder({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex min-w-0 flex-col rounded-2xl border border-stone-200/90 bg-white/95 p-5 shadow-[0_24px_56px_-46px_rgba(35,33,30,0.24)] transition-[background-color,border-color] hover:border-zinc-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-emerald-100/80 text-emerald-700">
        <Folder className="size-[18px]" aria-hidden />
      </span>
      <h2 className="mt-4 text-pretty text-[15px] font-semibold leading-6 tracking-[-0.025em] text-zinc-950 group-hover:text-zinc-700">
        {project.name}
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-3.5" aria-hidden />
          문서 <span className="font-mono font-semibold tabular-nums text-zinc-700">{project.documentCount}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LibraryBig className="size-3.5" aria-hidden />
          지식카드 <span className="font-mono font-semibold tabular-nums text-zinc-700">{project.cardCount}</span>
        </span>
      </div>
      <time dateTime={project.createdAt} className="mt-3 text-xs font-medium tabular-nums text-zinc-500">
        {formatKnowledgeDate(project.createdAt)}
      </time>
    </Link>
  );
}

export function ProjectList() {
  const { data: projects, error, isLoading, retry } = useRequest("projects", fetchProjects);

  if (error) {
    return (
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
    );
  }

  if (isLoading || !projects) {
    return (
      <div aria-busy className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} aria-hidden className="h-44 animate-pulse rounded-2xl border border-stone-200/90 bg-zinc-50" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <p className="mt-9 rounded-2xl border border-dashed border-zinc-200 px-5 py-12 text-center text-sm text-zinc-500">
        아직 프로젝트가 없습니다. 문서를 업로드하면 프로젝트 폴더가 만들어집니다.
      </p>
    );
  }

  return (
    <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectFolder key={project.id} project={project} />
      ))}
    </div>
  );
}
