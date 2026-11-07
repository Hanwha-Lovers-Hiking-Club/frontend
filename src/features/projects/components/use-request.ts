"use client";

import { useEffect, useState } from "react";

type Result<T> = { key: string; data?: T; error?: Error };

/** 화면에 필요한 한 번의 조회와 재시도를 관리한다. key 가 바뀌면 이전 요청은 취소된다. */
export function useRequest<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const requestKey = JSON.stringify([key, retryCount]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((data) => setResult({ key: requestKey, data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ key: requestKey, error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => controller.abort();
  }, [load, requestKey]);

  const isCurrent = result?.key === requestKey;

  return {
    data: isCurrent ? result?.data : undefined,
    error: isCurrent ? (result?.error ?? null) : null,
    isLoading: !isCurrent,
    retry: () => setRetryCount((count) => count + 1),
  };
}
