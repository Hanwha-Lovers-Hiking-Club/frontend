import type { KnowledgeCard } from "@/features/knowledge/types";

/** 답변 근거가 된 원문. 필드는 DB 의 documents / card_documents 컬럼과 대응한다. */
export type ChatSourceDocument = {
  /** documents.id */
  id: string;
  /** documents.title */
  documentTitle: string;
  /** card_documents.location */
  location: string;
  /** card_documents.excerpt */
  excerpt: string;
};

export type ChatReference = {
  id: string;
  type: "knowledge-card";
  label: string;
  card: KnowledgeCard;
  /** 이 카드를 고른 이유. 답변 생성 시 AI 가 만드는 값이라 DB 에 저장하지 않고 챗봇 응답에 포함된다. */
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
