"use client";

import { useEffect, useRef, useState } from "react";

import { ChatConversation } from "@/features/chat/components/chat-conversation";
import { useChatAmbientMode } from "@/features/chat/components/chat-ambient-context";
import { ChatReferencePanel } from "@/features/chat/components/chat-reference-panel";
import { ChatWelcome } from "@/features/chat/components/chat-welcome";
import { streamChat } from "@/features/chat/api";
import { demoReply, demoReferences } from "@/features/chat/mock";
import { apiUrl } from "@/utils/api";
import { useChatStore } from "@/stores/use-chat-store";

const USE_CHAT_API = process.env.NEXT_PUBLIC_CHAT_MODE === "api";
const STREAM_CHUNK_SIZE = 12;

export function ChatWorkspace() {
  const [prompt, setPrompt] = useState("");
  const messages = useChatStore((state) => state.messages);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const referencePanel = useChatStore((state) => state.referencePanel);
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const startAssistantMessage = useChatStore((state) => state.startAssistantMessage);
  const appendAssistantChunk = useChatStore((state) => state.appendAssistantChunk);
  const finishAssistantMessage = useChatStore((state) => state.finishAssistantMessage);
  const failAssistantMessage = useChatStore((state) => state.failAssistantMessage);
  const setAssistantReferences = useChatStore((state) => state.setAssistantReferences);
  const openReference = useChatStore((state) => state.openReference);
  const closeReferencePanel = useChatStore((state) => state.closeReferencePanel);
  const selectReference = useChatStore((state) => state.selectReference);
  const resetStoredConversation = useChatStore((state) => state.resetConversation);
  const streamTimer = useRef<number | null>(null);
  const streamController = useRef<AbortController | null>(null);
  const setAmbientMode = useChatAmbientMode();

  useEffect(() => () => {
    streamController.current?.abort();
    if (streamTimer.current) window.clearInterval(streamTimer.current);
    useChatStore.getState().finishAssistantMessage();
  }, []);

  useEffect(() => {
    setAmbientMode(messages.length === 0 ? "welcome" : "conversation");
  }, [messages.length, setAmbientMode]);

  function stopStreaming() {
    streamController.current?.abort();
    streamController.current = null;
    if (streamTimer.current) window.clearInterval(streamTimer.current);
    streamTimer.current = null;
    finishAssistantMessage();
  }

  async function submitPrompt(rawText: string) {
    const text = rawText.trim();
    if (!text || useChatStore.getState().isStreaming) return;

    const history = useChatStore.getState().messages
      .filter((message) => message.status === "complete" && message.content)
      .map(({ role, content }) => ({ role, content }));

    addUserMessage(text);
    const replyId = startAssistantMessage(USE_CHAT_API ? undefined : demoReferences);
    setPrompt("");

    if (USE_CHAT_API) {
      const controller = new AbortController();
      streamController.current = controller;
      let content = "";
      try {
        await streamChat(apiUrl("/api/chat/stream"), { message: text, history }, {
          onToken: (token) => {
            if (controller.signal.aborted) return;
            content += token;
            appendAssistantChunk(replyId, content);
          },
          onReferences: (references) => {
            if (!controller.signal.aborted) setAssistantReferences(replyId, references);
          },
        }, controller.signal);
        if (!controller.signal.aborted) finishAssistantMessage(replyId);
      } catch (error) {
        if (!controller.signal.aborted) {
          failAssistantMessage(replyId, error instanceof Error ? error.message : "답변을 생성하지 못했습니다.");
        }
      } finally {
        if (streamController.current === controller) streamController.current = null;
      }
      return;
    }

    let cursor = 0;
    streamTimer.current = window.setInterval(() => {
      cursor = Math.min(cursor + STREAM_CHUNK_SIZE, demoReply.length);
      const content = demoReply.slice(0, cursor);
      appendAssistantChunk(replyId, content);

      if (cursor === demoReply.length) stopStreaming();
    }, 36);
  }

  function resetConversation() {
    stopStreaming();
    setPrompt("");
    resetStoredConversation();
  }

  if (messages.length === 0) {
    return <ChatWelcome prompt={prompt} onPromptChange={setPrompt} onSubmit={submitPrompt} />;
  }

  return (
    <>
      <ChatConversation
        messages={messages}
        prompt={prompt}
        isStreaming={isStreaming}
        onPromptChange={setPrompt}
        onSubmit={submitPrompt}
        onStop={stopStreaming}
        onReset={resetConversation}
        onOpenReference={openReference}
      />
      <ChatReferencePanel
        references={referencePanel?.references ?? []}
        selectedReferenceId={referencePanel?.selectedReferenceId ?? null}
        onClose={closeReferencePanel}
        onSelectReference={selectReference}
      />
    </>
  );
}
