"use client";

import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { ChatComposer } from "@/features/chat/components/chat-composer";
import type { ChatMessage, ChatReference } from "@/features/chat/types";
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
  onOpenReference,
}: {
  messages: ChatMessage[];
  prompt: string;
  isStreaming: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop: () => void;
  onReset: () => void;
  onOpenReference: (reference: ChatReference, references: ChatReference[]) => void;
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
          <section className="mx-auto w-full max-w-[44rem]">
            <div role="log" aria-label="대화 내용" className="space-y-5 py-10 sm:py-12">
              {messages.map((message) => (
                <Message key={message.id} from={message.role} className="max-w-full">
                  {message.role === "user" ? (
                    <div className="flex flex-col items-end">
                      <MessageContent className="max-w-[78%] rounded-2xl !border !border-zinc-800 !bg-zinc-900 px-4 py-3 text-sm leading-6 !text-white shadow-[0_14px_24px_-22px_rgba(24,36,31,0.8)] sm:max-w-[64%]">
                        <p>{message.content}</p>
                      </MessageContent>
                      <MessageActions className="mt-1.5 justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
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
                    <div className="min-w-0 border-l-2 border-zinc-200/90 py-0.5 pl-5 sm:pl-6">
                      <MessageContent className="w-full max-w-none !bg-transparent !p-0 text-[14px] leading-[1.8] text-zinc-700 shadow-none [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:my-0 [&_p:not(:first-child)]:mt-4 [&_strong]:font-semibold [&_strong]:text-zinc-950">
                        <MessageResponse isAnimating={message.status === "streaming" && message.id === latestMessageId}>
                          {message.content || " "}
                        </MessageResponse>
                      </MessageContent>
                      {message.content && message.status !== "streaming" && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {message.references?.map((reference) => (
                            <button
                              key={reference.id}
                              type="button"
                              onClick={() => onOpenReference(reference, message.references ?? [])}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/70 px-2.5 text-xs font-medium text-zinc-600 transition-[background-color,border-color,color] hover:border-zinc-300 hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
                            >
                              지식카드
                              <span className="max-w-44 truncate text-zinc-500">{reference.label}</span>
                            </button>
                          ))}
                          <MessageActions className="ml-0.5">
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
                        </div>
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
        <div className="mx-auto w-full max-w-[44rem]">
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
