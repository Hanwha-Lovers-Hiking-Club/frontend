import { apiUrl, readErrorDetail } from "@/utils/api";

import type { KnowledgeCardPage, KnowledgeCardQuery } from "./types";

export async function getJson<T>(path: string, failureMessage: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), { signal });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (!response.ok) throw new Error((await readErrorDetail(response)) ?? failureMessage);
  return response.json() as Promise<T>;
}

/** 지식카드 목록 조회. 화면은 이 함수만 호출한다. */
export function fetchKnowledgeCards(
  { query, sort, page, pageSize }: KnowledgeCardQuery,
  signal?: AbortSignal,
): Promise<KnowledgeCardPage> {
  const params = new URLSearchParams({ q: query, sort, page: String(page), pageSize: String(pageSize) });
  return getJson(`/api/knowledge/cards?${params}`, "지식카드를 불러오지 못했습니다.", signal);
}

/** 원본 문서 서명 URL 발급. 10분 뒤 만료되므로 열기 직전에 호출한다. */
export async function fetchDocumentUrl(documentId: string): Promise<string> {
  const { url } = await getJson<{ url: string }>(
    `/api/documents/${encodeURIComponent(documentId)}/url`,
    "원본 문서 주소를 만들지 못했습니다.",
  );
  return url;
}
