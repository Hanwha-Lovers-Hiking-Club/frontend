"use client";

import { Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { KnowledgePagination } from "@/features/knowledge/components/knowledge-pagination";
import { KnowledgeToolbar } from "@/features/knowledge/components/knowledge-toolbar";
import { KNOWLEDGE_PAGE_SIZE } from "@/features/knowledge/config";
import { fetchProjects } from "@/features/projects/api";
import { ProjectFolder, ProjectFolderSkeleton } from "@/features/projects/components/project-folder";
import { useRequest } from "@/features/projects/components/use-request";

export function ProjectList({ query, sort, page }: { query: string; sort: "created" | "name"; page: number }) {
  const router = useRouter();
  const load = useCallback((signal: AbortSignal) => fetchProjects(
    { query, sort, page, pageSize: KNOWLEDGE_PAGE_SIZE }, signal,
  ), [query, sort, page]);
  const { data, error, isLoading, retry } = useRequest(JSON.stringify([query, sort, page]), load);
  const params = new URLSearchParams({ q: query, sort, page: String(page) });
  const navigate = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => next.set(key, value));
    router.push(`/knowledge?${next}`, { scroll: false });
  };
  const projects = data?.items ?? [];
  const total = data?.total ?? 0;
  const start = total === 0 ? 0 : (page - 1) * KNOWLEDGE_PAGE_SIZE + 1;

  return (
    <>
      <KnowledgeToolbar
        key={query}
        scope="projects"
        query={query}
        sort={sort}
        onSearch={(q) => navigate({ q, page: "1" })}
        onSortChange={(value) => navigate({ sort: value, page: "1" })}
      />
      <section aria-labelledby="project-results-title" className="mt-9 overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/65 px-5 py-4 sm:px-6">
          <h2 id="project-results-title" className="text-lg font-semibold tracking-[-0.03em] text-zinc-950">
            {query ? "검색된 프로젝트" : "프로젝트 폴더"}
          </h2>
          <span aria-live="polite" className="font-mono text-xs tabular-nums text-zinc-500">
            {isLoading ? "불러오는 중…" : error ? "조회 실패" : projects.length === 0 ? `${total}개` : `${total}개 중 ${start} — ${Math.min(page * KNOWLEDGE_PAGE_SIZE, total)}`}
          </span>
        </div>
        {error ? (
          <div role="alert" className="px-5 py-12 text-center">
            <p className="text-sm text-zinc-500">{error.message}</p>
            <button type="button" onClick={retry} className="mt-4 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45">다시 시도</button>
          </div>
        ) : isLoading ? (
          <div aria-busy className="grid gap-x-5 gap-y-6 bg-stone-50/70 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => <ProjectFolderSkeleton key={index} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Folder className="mx-auto mb-4 size-8 text-zinc-300" aria-hidden />
            <p className="text-sm text-zinc-500">
              {page > 1 ? "이 페이지에 프로젝트가 없습니다." : query ? `“${query}”와 일치하는 프로젝트가 없습니다.` : "아직 프로젝트가 없습니다. 문서를 업로드하면 폴더가 만들어집니다."}
            </p>
            {(query || page > 1) && (
              <button type="button" onClick={() => navigate({ q: "", page: "1" })} className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-brand-strong underline underline-offset-4 transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45">전체 프로젝트 보기</button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-x-5 gap-y-6 bg-stone-50/70 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
              {projects.map((project) => <ProjectFolder key={project.id} project={project} listQuery={params.toString()} />)}
            </div>
            <KnowledgePagination label="프로젝트 페이지 이동" page={page} totalPages={Math.ceil(total / KNOWLEDGE_PAGE_SIZE)} onPageChange={(next) => navigate({ page: String(next) })} />
          </>
        )}
      </section>
    </>
  );
}
