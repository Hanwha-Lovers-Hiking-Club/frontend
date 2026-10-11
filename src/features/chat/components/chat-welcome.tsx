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
  "문서 핵심 내용 요약해줘",
  "프로젝트 주요 이슈를 정리해줘",
  "관련 지식카드를 찾아줘",
  "다음 액션을 제안해줘",
  "문서 간 차이점을 비교해줘",
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
                    className="h-9 rounded-xl border-zinc-200 bg-white/75 px-3.5 text-zinc-600 shadow-none transition-[background-color,border-color,color,transform] hover:-translate-y-px hover:border-zinc-300 hover:bg-white hover:text-zinc-950 active:translate-y-0"
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
