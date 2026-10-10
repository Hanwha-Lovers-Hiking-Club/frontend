"use client";

import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { ChatComposer } from "@/components/chat/chat-composer";
import type { ChatMessage } from "@/components/chat/chat-types";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

const messageTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function ChatConversation({
  messages,
  prompt,
  isStreaming,
  onPromptChange,
  onSubmit,
  onStop,
  onReset,
}: {
  messages: ChatMessage[];
  prompt: string;
  isStreaming: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop: () => void;
  onReset: () => void;
}) {
  const latestMessageId = messages.at(-1)?.id;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const composerAreaRef = useRef<HTMLDivElement>(null);
  const [composerHeight, setComposerHeight] = useState(0);
  const messageFadeStart = composerHeight + 32;

  useEffect(() => {
    const composerArea = composerAreaRef.current;
    if (!composerArea) return;

    const updateHeight = () => setComposerHeight(composerArea.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(composerArea);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const frame = window.requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: isStreaming ? "auto" : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isStreaming, messages]);

  return (
    <main className="relative h-full min-h-0">
      <ScrollAreaPrimitive.Root className="h-full">
        <ScrollAreaPrimitive.Viewport
          ref={scrollContainerRef}
          className="h-full w-full px-5 pb-40 pt-7 sm:px-8 sm:pt-8"
          style={
            composerHeight
              ? {
                  paddingBottom: composerHeight + 28,
                  maskImage: `linear-gradient(to bottom, black 0, black calc(100% - ${messageFadeStart}px), transparent calc(100% - ${composerHeight}px), transparent 100%)`,
                  WebkitMaskImage: `linear-gradient(to bottom, black 0, black calc(100% - ${messageFadeStart}px), transparent calc(100% - ${composerHeight}px), transparent 100%)`,
                }
              : undefined
          }
        >
          <section className="mx-auto w-full max-w-3xl">
            <div role="log" aria-label="대화 내용" className="space-y-6 py-7 sm:py-9">
              {messages.map((message) => (
              <Message key={message.id} from={message.role} className="max-w-full">
                {message.role === "user" ? (
                  <div className="flex flex-col items-end">
                    <MessageContent className="max-w-[82%] rounded-2xl !border !border-zinc-800 !bg-zinc-900 px-4 py-3 text-[15px] leading-7 !text-white shadow-[0_16px_28px_-22px_rgba(24,36,31,0.8)] sm:max-w-[70%]">
                      <p>{message.content}</p>
                    </MessageContent>
                    <MessageActions className="mt-2 justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                      <time
                        dateTime={message.createdAt.toISOString()}
                        className="pointer-events-none mr-1 text-xs text-zinc-400"
                      >
                        {messageTimeFormatter.format(message.createdAt)}
                      </time>
                      <MessageAction
                        tooltip="메시지 복사"
                        label="메시지 복사"
                        onClick={() => void navigator.clipboard.writeText(message.content)}
                        className="rounded-lg text-zinc-400 hover:bg-white hover:text-zinc-800"
                      >
                        <Copy className="size-4" aria-hidden />
                      </MessageAction>
                    </MessageActions>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <MessageContent className="w-full max-w-none rounded-[1.4rem] border border-zinc-200/90 bg-white/90 px-5 py-5 text-[15px] leading-7 text-zinc-800 shadow-[0_20px_44px_-38px_rgba(24,36,31,0.6)] sm:px-6 sm:text-base">
                      <MessageResponse isAnimating={isStreaming && message.id === latestMessageId}>
                        {message.content || " "}
                      </MessageResponse>
                    </MessageContent>
                    {message.content && !(isStreaming && message.id === latestMessageId) && (
                      <MessageActions className="mt-2">
                        <MessageAction
                          tooltip="답변 복사"
                          label="답변 복사"
                          onClick={() => void navigator.clipboard.writeText(message.content)}
                          className="rounded-lg text-zinc-400 hover:bg-white hover:text-zinc-800"
                        >
                          <Copy className="size-4" aria-hidden />
                        </MessageAction>
                        <time
                          dateTime={message.createdAt.toISOString()}
                          className="pointer-events-none ml-1 text-xs text-zinc-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        >
                          {messageTimeFormatter.format(message.createdAt)}
                        </time>
                      </MessageActions>
                    )}
                  </div>
                )}
              </Message>
              ))}
            </div>
          </section>
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          className="app-scrollbar-rail flex touch-none select-none"
        >
          <ScrollAreaPrimitive.Thumb className="app-scrollbar-thumb relative flex-1 rounded-full" />
        </ScrollAreaPrimitive.Scrollbar>
      </ScrollAreaPrimitive.Root>
      <div ref={composerAreaRef} className="absolute inset-x-0 bottom-0 z-20 px-5 pb-3 pt-4 sm:px-8 sm:pb-4">
        <div className="mx-auto w-full max-w-3xl">
          <ChatComposer
            compact
            value={prompt}
            onValueChange={onPromptChange}
            onSubmit={onSubmit}
            isStreaming={isStreaming}
            onStop={onStop}
            onNewConversation={onReset}
          />
        </div>
      </div>
    </main>
  );
}
