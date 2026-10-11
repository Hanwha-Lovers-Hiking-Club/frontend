"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchKnowledgeCards } from "@/features/knowledge/api";
import { KNOWLEDGE_PAGE_SIZE } from "@/features/knowledge/config";
import type {
  KnowledgeCardPage,
  KnowledgeCardQuery,
  KnowledgeCardTypeFilter,
  KnowledgeSort,
} from "@/features/knowledge/types";

type Filters = Pick<KnowledgeCardQuery, "query" | "type" | "sort">;
type Result = { key: string; data?: KnowledgeCardPage; error?: Error };

/**
 * 필터/정렬/페이지 상태와 서버 조회를 한곳에서 관리한다.
 * 조건이 바뀌면 1페이지로 돌아가고, 이전 요청은 취소된다.
 */
export function useKnowledgeCards() {
  const [filters, setFilters] = useState<Filters>({ query: "", type: "all", sort: "recent" });
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const params = useMemo<KnowledgeCardQuery>(
    () => ({ ...filters, page, pageSize: KNOWLEDGE_PAGE_SIZE }),
    [filters, page],
  );
  const requestKey = JSON.stringify([params, retryCount]);

  useEffect(() => {
    const controller = new AbortController();
    fetchKnowledgeCards(params, controller.signal)
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ key: requestKey, error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => controller.abort();
  }, [params, requestKey]);

  const updateFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const isCurrent = result?.key === requestKey;
  // 새 조건을 불러오는 동안에는 직전 결과를 그대로 보여준다.
  const data = result?.data;

  return {
    filters,
    page,
    pageSize: KNOWLEDGE_PAGE_SIZE,
    items: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading: !isCurrent,
    error: isCurrent ? (result?.error ?? null) : null,
    setQuery: (query: string) => updateFilters({ query }),
    setType: (type: KnowledgeCardTypeFilter) => updateFilters({ type }),
    setSort: (sort: KnowledgeSort) => updateFilters({ sort }),
    setPage,
    retry: () => setRetryCount((count) => count + 1),
  };
}
