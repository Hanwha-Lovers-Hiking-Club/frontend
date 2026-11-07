import { getJson } from "@/features/knowledge/api";

import type { ProjectDetail, ProjectPage, ProjectQuery } from "./types";

/** 프로젝트 폴더 목록 조회 */
export function fetchProjects(
  { query, sort, page, pageSize }: ProjectQuery,
  signal?: AbortSignal,
): Promise<ProjectPage> {
  const params = new URLSearchParams({ q: query, sort, page: String(page), pageSize: String(pageSize) });
  return getJson(
    `/api/projects?${params}`,
    "프로젝트를 불러오지 못했습니다.",
    signal,
  );
}

/** 프로젝트 폴더의 원본 문서와 지식카드 조회 */
export function fetchProject(projectId: string, signal?: AbortSignal): Promise<ProjectDetail> {
  return getJson(
    `/api/projects/${encodeURIComponent(projectId)}`,
    "프로젝트를 불러오지 못했습니다.",
    signal,
  );
}
