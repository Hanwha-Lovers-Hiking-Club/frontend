"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const [showBanner, setShowBanner] = useState(false);
  const reducedMotion = useReducedMotion();

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
    if (text === "등산") {
      setPrompt("");
      setShowBanner(true);
      return;
    }

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

  const banner = (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          aria-hidden
          // 가운데까지 빠르게 → 잠깐 멈춤 → 가속하며 왼쪽으로 퇴장
          initial={reducedMotion ? { opacity: 0 } : { x: "100vw" }}
          animate={reducedMotion ? { opacity: [0, 1, 1, 0] } : { x: ["100vw", "0vw", "0vw", "-100vw"] }}
          transition={{ duration: 2.6, times: [0, 0.3, 0.62, 1], ease: ["easeOut", "linear", "easeIn"] }}
          onAnimationComplete={() => setShowBanner(false)}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <Image src="/chat-banner.webp" alt="" width={1672} height={941} priority className="w-[min(80vw,64rem)] h-auto drop-shadow-2xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (messages.length === 0) {
    return (
      <>
        <ChatWelcome prompt={prompt} onPromptChange={setPrompt} onSubmit={submitPrompt} />
        {banner}
      </>
    );
  }

  return (
    <>
      {banner}
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
        isOpen={referencePanel !== null}
        references={referencePanel?.references ?? []}
        sources={referencePanel?.sources ?? []}
        selectedReferenceId={referencePanel?.selectedReferenceId ?? null}
        onClose={closeReferencePanel}
        onSelectReference={selectReference}
      />
    </>
  );
}
