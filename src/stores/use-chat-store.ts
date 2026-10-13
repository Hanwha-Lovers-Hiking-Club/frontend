import { create } from "zustand";

import type { ChatMessage, ChatReference } from "@/features/chat/types";

type ReferencePanelState = {
  references: ChatReference[];
  selectedReferenceId: string;
};

type ChatStore = {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  referencePanel: ReferencePanelState | null;
  addUserMessage: (content: string) => string;
  startAssistantMessage: (references?: ChatReference[]) => string;
  appendAssistantChunk: (messageId: string, content: string) => void;
  finishAssistantMessage: (messageId?: string) => void;
  failAssistantMessage: (messageId?: string) => void;
  openReference: (reference: ChatReference, references: ChatReference[]) => void;
  closeReferencePanel: () => void;
  selectReference: (referenceId: string) => void;
  resetConversation: () => void;
};

const createMessageId = () => crypto.randomUUID();

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  referencePanel: null,
  addUserMessage: (content) => {
    const id = createMessageId();
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role: "user", content, createdAt: new Date(), status: "complete" },
      ],
    }));
    return id;
  },
  startAssistantMessage: (references) => {
    const id = createMessageId();
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role: "assistant", content: "", createdAt: new Date(), status: "streaming", references },
      ],
      isStreaming: true,
      streamingMessageId: id,
    }));
    return id;
  },
  appendAssistantChunk: (messageId, content) => {
    set((state) => ({
      messages: state.messages.map((message) => (
        message.id === messageId && message.status === "streaming"
          ? { ...message, content }
          : message
      )),
    }));
  },
  finishAssistantMessage: (messageId) => {
    const targetId = messageId ?? get().streamingMessageId;
    if (!targetId) return;

    set((state) => ({
      messages: state.messages.map((message) => (
        message.id === targetId ? { ...message, status: "complete" } : message
      )),
      isStreaming: state.streamingMessageId === targetId ? false : state.isStreaming,
      streamingMessageId: state.streamingMessageId === targetId ? null : state.streamingMessageId,
    }));
  },
  failAssistantMessage: (messageId) => {
    const targetId = messageId ?? get().streamingMessageId;
    if (!targetId) return;

    set((state) => ({
      messages: state.messages.map((message) => (
        message.id === targetId ? { ...message, status: "error" } : message
      )),
      isStreaming: state.streamingMessageId === targetId ? false : state.isStreaming,
      streamingMessageId: state.streamingMessageId === targetId ? null : state.streamingMessageId,
    }));
  },
  openReference: (reference, references) => {
    set({ referencePanel: { references, selectedReferenceId: reference.id } });
  },
  closeReferencePanel: () => set({ referencePanel: null }),
  selectReference: (selectedReferenceId) => {
    set((state) => (
      state.referencePanel ? { referencePanel: { ...state.referencePanel, selectedReferenceId } } : state
    ));
  },
  resetConversation: () => set({
    messages: [],
    isStreaming: false,
    streamingMessageId: null,
    referencePanel: null,
  }),
}));
