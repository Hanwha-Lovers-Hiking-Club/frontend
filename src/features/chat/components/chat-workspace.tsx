"use client";

import { useEffect, useRef, useState } from "react";

import { ChatConversation } from "@/features/chat/components/chat-conversation";
import { ChatWelcome } from "@/features/chat/components/chat-welcome";
import type { ChatMessage } from "@/features/chat/types";

const demoReply = `업로드된 문서를 기준으로 보면, 현재 흐름은 **문서 수집 → 분석 처리 → 지식카드 생성**으로 정리할 수 있어요.

1. **문서 수집**
   파일을 추가한 뒤 미리보기로 내용을 확인합니다.

2. **분석 처리**
   문서 구조와 핵심 내용을 읽고, 지식으로 연결할 수 있는 단위를 추출합니다.

3. **지식카드 생성**
   추출한 내용을 상황·대응 방법·결과·재사용 포인트로 정리합니다.

다음으로는 처리 단계별 진행 메시지를 실제 서버 응답과 연결하면 사용자가 기다리는 흐름을 더 자연스럽게 만들 수 있습니다.`;

const STREAM_CHUNK_SIZE = 12;

export function ChatWorkspace() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (streamTimer.current) window.clearInterval(streamTimer.current);
  }, []);

  function stopStreaming() {
    if (streamTimer.current) window.clearInterval(streamTimer.current);
    streamTimer.current = null;
    setIsStreaming(false);
  }

  function submitPrompt(rawText: string) {
    const text = rawText.trim();
    if (!text || streamTimer.current) return;

    const replyId = crypto.randomUUID();
    const createdAt = new Date();
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: text, createdAt },
      { id: replyId, role: "assistant", content: "", createdAt },
    ]);
    setPrompt("");
    setIsStreaming(true);

    let cursor = 0;
    streamTimer.current = window.setInterval(() => {
      cursor = Math.min(cursor + STREAM_CHUNK_SIZE, demoReply.length);
      const content = demoReply.slice(0, cursor);
      setMessages((current) => current.map((message) => (message.id === replyId ? { ...message, content } : message)));

      if (cursor === demoReply.length) stopStreaming();
    }, 36);
  }

  function resetConversation() {
    stopStreaming();
    setPrompt("");
    setMessages([]);
  }

  if (messages.length === 0) {
    return <ChatWelcome prompt={prompt} onPromptChange={setPrompt} onSubmit={submitPrompt} />;
  }

  return (
    <ChatConversation
      messages={messages}
      prompt={prompt}
      isStreaming={isStreaming}
      onPromptChange={setPrompt}
      onSubmit={submitPrompt}
      onStop={stopStreaming}
      onReset={resetConversation}
    />
  );
}
