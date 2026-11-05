"use client";

import { useEffect, useRef, useState } from "react";

import { ChatConversation } from "@/features/chat/components/chat-conversation";
import { useChatAmbientMode } from "@/features/chat/components/chat-ambient-context";
import { ChatReferencePanel } from "@/features/chat/components/chat-reference-panel";
import { ChatWelcome } from "@/features/chat/components/chat-welcome";
import { streamChat } from "@/features/chat/api";
import { apiUrl } from "@/utils/api";
import { useChatStore } from "@/stores/use-chat-store";

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
  const streamController = useRef<AbortController | null>(null);
  const setAmbientMode = useChatAmbientMode();

  useEffect(() => () => {
    streamController.current?.abort();
    useChatStore.getState().finishAssistantMessage();
  }, []);

  useEffect(() => {
    setAmbientMode(messages.length === 0 ? "welcome" : "conversation");
  }, [messages.length, setAmbientMode]);

  function stopStreaming() {
    streamController.current?.abort();
    streamController.current = null;
    finishAssistantMessage();
  }

  async function submitPrompt(rawText: string) {
    const text = rawText.trim();
    if (!text || useChatStore.getState().isStreaming) return;

    const history = useChatStore.getState().messages
      .filter((message) => message.status === "complete" && message.content)
      .map(({ role, content }) => ({ role, content }));

    addUserMessage(text);
    const replyId = startAssistantMessage();
    setPrompt("");

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
        onReferences: (references, sources) => {
          if (!controller.signal.aborted) setAssistantReferences(replyId, references, sources);
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
