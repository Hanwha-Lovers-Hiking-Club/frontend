"use client";

import { ArrowUp, Plus, Square } from "lucide-react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

export function ChatComposer({
  value,
  onValueChange,
  onSubmit,
  isStreaming = false,
  onStop,
  onNewConversation,
  compact = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (text: string) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  onNewConversation?: () => void;
  compact?: boolean;
}) {
  return (
    <PromptInput
      className="[&_[data-slot=input-group]]:rounded-[1.45rem] [&_[data-slot=input-group]]:border-stone-200 [&_[data-slot=input-group]]:bg-white [&_[data-slot=input-group]]:shadow-[0_22px_52px_-34px_rgba(35,33,30,0.22),0_1px_0_rgba(255,255,255,0.95)_inset] [&_[data-slot=input-group]]:transition-[border-color,box-shadow] [&_[data-slot=input-group]]:focus-within:border-stone-300 [&_[data-slot=input-group]]:focus-within:shadow-[0_28px_60px_-32px_rgba(35,33,30,0.3),0_1px_0_rgba(255,255,255,0.95)_inset]"
      onSubmit={({ text }) => onSubmit(text)}
    >
      <PromptInputBody>
        <PromptInputTextarea
          disabled={isStreaming}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="문서와 프로젝트에 대해 무엇이든 물어보세요"
          className={
            compact
              ? "min-h-[3.25rem] px-5 py-3.5 text-[14px] leading-6"
              : "min-h-[7.5rem] px-5 pt-5 text-[15px] leading-7 sm:text-base"
          }
        />
      </PromptInputBody>
      <PromptInputFooter className={compact ? "border-t border-zinc-100 px-3.5 py-2" : "border-t border-zinc-100 px-3.5 pb-3.5 pt-3"}>
        <div className="flex min-w-0 items-center gap-3">
          {onNewConversation && (
            <button
              type="button"
              onClick={onNewConversation}
              className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-600 shadow-[0_5px_12px_-10px_rgba(24,36,31,0.5)] transition-[background-color,border-color,color,transform] hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
            >
              <Plus className="size-3.5" aria-hidden />
              새 대화
            </button>
          )}
          <p className="truncate text-xs text-zinc-400">Enter로 전송 · Shift + Enter로 줄바꿈</p>
        </div>
        <PromptInputSubmit
          disabled={!isStreaming && !value.trim()}
          status={isStreaming ? "streaming" : undefined}
          onStop={onStop}
          aria-label={isStreaming ? "응답 중지" : "질문 전송"}
          className={compact ? "size-9 rounded-xl bg-primary text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.96] disabled:bg-zinc-200 disabled:text-zinc-400" : "size-10 rounded-xl bg-primary text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.96] disabled:bg-zinc-200 disabled:text-zinc-400"}
        >
          {isStreaming ? <Square className="size-3.5" aria-hidden /> : <ArrowUp className="size-[18px]" aria-hidden />}
        </PromptInputSubmit>
      </PromptInputFooter>
    </PromptInput>
  );
}
