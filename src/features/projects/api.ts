import { getJson } from "@/features/knowledge/api";

import type { ProjectDetail, ProjectSummary } from "./types";

/** 프로젝트 폴더 목록 조회 */
export async function fetchProjects(signal?: AbortSignal): Promise<ProjectSummary[]> {
  const { items } = await getJson<{ items: ProjectSummary[] }>(
    "/api/projects",
    "프로젝트를 불러오지 못했습니다.",
    signal,
  );
  return items;
}

/** 프로젝트 폴더의 원본 문서와 지식카드 조회 */
export function fetchProject(projectId: string, signal?: AbortSignal): Promise<ProjectDetail> {
  return getJson(
    `/api/projects/${encodeURIComponent(projectId)}`,
    "프로젝트를 불러오지 못했습니다.",
    signal,
  );
}
