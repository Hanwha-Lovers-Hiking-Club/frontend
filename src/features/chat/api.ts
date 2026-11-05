import type { ChatMessage, ChatReference, ChatSource } from "./types";

type ChatRequest = {
  message: string;
  history: Pick<ChatMessage, "role" | "content">[];
};

type ChatHandlers = {
  onToken: (content: string) => void;
  onReferences: (references: ChatReference[], sources: ChatSource[]) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReference(value: unknown): value is ChatReference {
  if (!isRecord(value) || !isRecord(value.card) || !isRecord(value.document)) return false;
  const { card, document } = value;
  return value.type === "knowledge-card"
    && [value.id, value.label, value.reason, document.id, document.documentTitle].every((v) => typeof v === "string")
    && [document.location, document.excerpt].every((v) => v === null || typeof v === "string")
    && ["id", "title", "summary", "context", "lesson", "createdAt", "updatedAt"].every((key) => typeof card[key] === "string")
    && ["problem", "cause", "approach", "rationale", "outcome", "projectName", "department", "projectDate"].every((key) => card[key] === null || typeof card[key] === "string")
    && [card.keywords, card.technologies].every((v) => Array.isArray(v) && v.every((item) => typeof item === "string"))
    && Array.isArray(card.evidences) && card.evidences.every((evidence) => isRecord(evidence)
      && ["id", "documentId", "documentTitle", "originalFilename"].every((key) => typeof evidence[key] === "string")
      && ["location", "excerpt", "url"].every((key) => evidence[key] === null || typeof evidence[key] === "string"));
}

function isSource(value: unknown): value is ChatSource {
  return isRecord(value)
    && [value.chunkId, value.documentId, value.documentTitle, value.excerpt].every((v) => typeof v === "string")
    && (value.location === null || typeof value.location === "string");
}

/** POST SSE: token.content는 누적 답변이 아닌 새로 추가할 문자열이다. */
export async function streamChat(
  url: string,
  request: ChatRequest,
  handlers: ChatHandlers,
  signal: AbortSignal,
) {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(isRecord(body) && typeof body.detail === "string" ? body.detail : "답변 요청에 실패했습니다.");
  }
  if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
    throw new Error("챗봇 응답 형식이 올바르지 않습니다.");
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      signal.throwIfAborted();
      if (done) throw new Error("답변 연결이 완료 전에 끊겼습니다. 다시 질문해 주세요.");
      buffer += value;
      // FastAPI SSE의 LF/CRLF 구분자를 청크 경계에 걸쳐서도 보존한다.
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        signal.throwIfAborted();
        const block = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        let event = "";
        const data: string[] = [];
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith("event:")) event = line.slice(6).replace(/^ /, "");
          if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
        }
        if (!["token", "references", "completed", "error"].includes(event)) continue;
        const payload: unknown = JSON.parse(data.join("\n"));
        if (!isRecord(payload)) throw new Error("챗봇 이벤트 형식이 올바르지 않습니다.");
        if (event === "completed") return;
        if (event === "error") throw new Error(typeof payload.message === "string" ? payload.message : "답변 생성에 실패했습니다.");
        if (event === "token") {
          if (typeof payload.content !== "string") throw new Error("답변 토큰 형식이 올바르지 않습니다.");
          handlers.onToken(payload.content);
        } else if (event === "references") {
          if (!Array.isArray(payload.items) || !payload.items.every(isReference)
            || !Array.isArray(payload.sources) || !payload.sources.every(isSource)) {
            throw new Error("답변 근거 형식이 올바르지 않습니다.");
          }
          handlers.onReferences(payload.items, payload.sources);
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
