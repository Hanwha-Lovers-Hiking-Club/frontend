"use client";

import { useEffect, useState } from "react";

import { ChatComposer } from "@/features/chat/components/chat-composer";
import { Button } from "@/components/ui/button";

const welcomeMessages = [
  {
    title: "무엇을 함께 정리해볼까요?",
    description: "문서 속 맥락을 찾고, 필요한 답을 한 흐름으로 정리해드릴게요.",
  },
  {
    title: "프로젝트의 흐름을 한번에 살펴볼까요?",
    description: "업로드한 문서에서 핵심 내용을 찾아 다음 작업으로 이어갈 수 있어요.",
  },
  {
    title: "필요한 지식을 바로 찾아볼까요?",
    description: "프로젝트 문서를 바탕으로 질문에 맞는 맥락을 함께 정리합니다.",
  },
] as const;

const suggestions = [
  // 실제 데이터로 답변 검증한 질문. 프로젝트가 삭제·재업로드되면 함께 수정할 것.
  "센터 운영 대시보드 주요 이슈 정리해줘",
  "나루 배정 원장 기술 선택 이유 알려줘",
  "나루 배정 원장 문제 해결 사례 정리해줘",
  "새길 규정 대조 에이전트 교훈 알려줘",
  "WebSocket은 어떤 프로젝트에서 썼어?",
] as const;

const suggestionRows = Array.from(
  { length: Math.ceil(suggestions.length / 3) },
  (_, index) => suggestions.slice(index * 3, index * 3 + 3),
);

export function ChatWelcome({
  prompt,
  onPromptChange,
  onSubmit,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (text: string) => void;
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMessageIndex(Math.floor(Math.random() * welcomeMessages.length));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const welcome = welcomeMessages[messageIndex];

  return (
    <main className="app-scrollbar flex h-full min-h-0 overflow-y-auto px-5 py-7 sm:px-8 sm:py-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col justify-center">
        <div className="w-full text-center">
          <p className="text-xs font-semibold tracking-[0.14em] text-zinc-400">KNOWLEDGE ASSISTANT</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.06em] text-zinc-950 sm:whitespace-nowrap sm:text-5xl">
            {welcome.title}
          </h1>
          <p className="mx-auto mt-5 max-w-[34rem] text-pretty text-[15px] leading-7 text-zinc-500 sm:text-base">
            {welcome.description}
          </p>

          <div className="mx-auto mt-10 max-w-2xl">
            <ChatComposer value={prompt} onValueChange={onPromptChange} onSubmit={onSubmit} />
          </div>

          <div className="mt-5 space-y-2" aria-label="자주 쓰는 질문">
            {suggestionRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap justify-center gap-2">
                {row.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPromptChange(suggestion)}
                    className="h-9 rounded-xl border-stone-200 bg-white/75 px-3.5 text-zinc-600 shadow-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-stone-300 hover:bg-white hover:text-zinc-950 hover:shadow-[0_10px_18px_-16px_rgba(35,33,30,0.36)] active:translate-y-0"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
