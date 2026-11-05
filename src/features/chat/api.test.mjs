import assert from "node:assert/strict";
import test from "node:test";
import { streamChat } from "./api.ts";

const event = (name, payload) => `event: ${name}\r\ndata: ${JSON.stringify(payload)}\r\n\r\n`;
const request = { message: "질문", history: [{ role: "user", content: "이전 질문" }] };

function mockStream(t, text) {
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), request);
    const bytes = new TextEncoder().encode(text);
    return new Response(new ReadableStream({
      start(controller) {
        // 한글 UTF-8 바이트와 CRLF 경계가 각각 나뉘는 최악의 청크 분할.
        for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
        controller.close();
      },
    }), { headers: { "Content-Type": "text/event-stream; charset=utf-8" } });
  });
}

const handlers = { onToken() {}, onReferences() {} };

test("POST history, fragmented Korean tokens, heartbeats and references", async (t) => {
  mockStream(t, ': ping\r\n\r\n' + event("token", { content: "한글 " })
    + event("token", { content: "답변" }) + event("references", { items: [], sources: [] }) + event("completed", { messageId: "id" }));
  let answer = "";
  let references;
  await streamChat("http://test/chat", request, {
    onToken: (token) => { answer += token; },
    onReferences: (items) => { references = items; },
  }, new AbortController().signal);
  assert.equal(answer, "한글 답변");
  assert.deepEqual(references, []);
});

test("delivers sources when an answer has no knowledge cards", async (t) => {
  const source = { chunkId: "chunk", documentId: "document", documentTitle: "문서", location: null, excerpt: "원문" };
  mockStream(t, event("references", { items: [], sources: [source] }) + event("completed", {}));
  let received;
  await streamChat("http://test/chat", request, { ...handlers, onReferences: (_, sources) => { received = sources; } }, new AbortController().signal);
  assert.deepEqual(received, [source]);
});

test("accepts nullable document fields with a complete reference", async (t) => {
  const card = {
    id: "card", title: "제목", summary: "요약", context: "배경", lesson: "교훈",
    createdAt: "2026-11-04T00:00:00Z", updatedAt: "2026-11-04T00:00:00Z",
    problem: null, cause: null, approach: null, rationale: null, outcome: null,
    projectName: null, department: null, projectDate: null,
    keywords: [], technologies: [], evidences: [],
  };
  const reference = { id: "evidence", type: "knowledge-card", label: "제목", reason: "이유", card,
    document: { id: "document", documentTitle: "문서", location: null, excerpt: null } };
  mockStream(t, event("references", { items: [reference], sources: [] }) + event("completed", {}));
  let received;
  await streamChat("http://test/chat", request, { ...handlers, onReferences: (items) => { received = items; } }, new AbortController().signal);
  assert.deepEqual(received, [reference]);
});

for (const [name, text, error] of [
  ["server error", event("error", { message: "생성 실패" }), /생성 실패/],
  ["missing completed", event("token", { content: "일부 답변" }), /완료 전에/],
  ["invalid token", event("token", { content: 42 }), /토큰 형식/],
  ["invalid reference", event("references", { items: [{ card: null }], sources: [] }), /근거 형식/],
  ["invalid source", event("references", { items: [], sources: [{ chunkId: 1 }] }), /근거 형식/],
  ["invalid JSON", "event: token\ndata: broken\n\n", /JSON|Unexpected/],
]) {
  test(name, async (t) => {
    mockStream(t, text);
    await assert.rejects(streamChat("http://test/chat", request, handlers, new AbortController().signal), error);
  });
}

test("HTTP errors retain the server detail", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ detail: "서버 점검 중" }, { status: 503 }));
  await assert.rejects(streamChat("http://test/chat", request, handlers, new AbortController().signal), /서버 점검 중/);
});

test("rejects non-SSE responses", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({}));
  await assert.rejects(streamChat("http://test/chat", request, handlers, new AbortController().signal), /응답 형식/);
});

test("abort stops callbacks without reporting success", async (t) => {
  mockStream(t, event("token", { content: "중지" }) + event("token", { content: "무시" }) + event("completed", {}));
  const controller = new AbortController();
  let count = 0;
  await assert.rejects(streamChat("http://test/chat", request, {
    ...handlers, onToken: () => { count += 1; controller.abort(); },
  }, controller.signal), { name: "AbortError" });
  assert.equal(count, 1);
});

test("abort also stops events bundled in the same network chunk", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(
    event("token", { content: "중지" }) + event("token", { content: "무시" }) + event("completed", {}),
    { headers: { "Content-Type": "text/event-stream" } },
  ));
  const controller = new AbortController();
  let count = 0;
  await assert.rejects(streamChat("http://test/chat", request, {
    ...handlers, onToken: () => { count += 1; controller.abort(); },
  }, controller.signal), { name: "AbortError" });
  assert.equal(count, 1);
});
