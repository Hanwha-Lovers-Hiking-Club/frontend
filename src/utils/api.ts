const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

/** 백엔드 오류 응답의 { detail } 문구. 문자열이 아니면(422 등) undefined. */
export async function readErrorDetail(response: Response) {
  try {
    const body = (await response.json()) as { detail?: unknown };
    return typeof body.detail === "string" ? body.detail : undefined;
  } catch {
    return undefined;
  }
}
