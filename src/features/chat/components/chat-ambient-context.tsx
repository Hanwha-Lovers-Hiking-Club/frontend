"use client";

import { createContext, useContext } from "react";

export type ChatAmbientMode = "welcome" | "conversation";

const ChatAmbientContext = createContext<(mode: ChatAmbientMode) => void>(() => {});

export const ChatAmbientProvider = ChatAmbientContext.Provider;

export function useChatAmbientMode() {
  return useContext(ChatAmbientContext);
}
