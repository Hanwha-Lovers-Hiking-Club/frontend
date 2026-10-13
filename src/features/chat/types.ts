import type { KnowledgeCard } from "@/features/knowledge/types";

export type ChatSourceDocument = {
  id: string;
  documentName: string;
  location: string;
  excerpt: string;
};

export type ChatReference = {
  id: string;
  type: "knowledge-card";
  label: string;
  card: KnowledgeCard;
  reason: string;
  document: ChatSourceDocument;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  status: "streaming" | "complete" | "error";
  references?: ChatReference[];
};
