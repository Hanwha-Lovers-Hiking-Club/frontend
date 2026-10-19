import { queryMockCards } from "./mock";
import type { KnowledgeCardPage, KnowledgeCardQuery } from "./types";

/**
 * 지식카드 목록 조회. 화면은 이 함수만 호출한다.
 * 응답은 { items, total } 형태를 따른다. 백엔드가 준비되면 본문을 fetch 로 교체한다. 예:
 *
 *   const params = new URLSearchParams({ q: query.query, sort: query.sort, ... });
 *   const response = await fetch(`/api/knowledge/cards?${params}`, { signal });
 *   if (!response.ok) throw new Error("지식카드를 불러오지 못했습니다.");
 *   return response.json();
 */
export async function fetchKnowledgeCards(
  query: KnowledgeCardQuery,
  signal?: AbortSignal,
): Promise<KnowledgeCardPage> {
  signal?.throwIfAborted();
  return queryMockCards(query);
}
