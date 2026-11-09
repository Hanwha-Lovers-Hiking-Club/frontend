import type { Metadata } from "next";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";

export const metadata: Metadata = {
  title: { absolute: "챗봇 | Job지식" },
  description: "프로젝트 문서와 지식카드를 근거로 질문에 답합니다.",
};

export default function Home() {
  return <ChatWorkspace />;
}
