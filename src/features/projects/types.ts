import type { KnowledgeCard } from "@/features/knowledge/types";

/**
 * GET /api/projects 의 항목. 같은 이름의 프로젝트도 별개이므로 이름이 아니라 id 로 구분한다.
 * cardCount 는 상세의 cards 와 같은 기준(active)으로 센다.
 */
export type ProjectSummary = {
  id: string;
  name: string;
  documentCount: number;
  cardCount: number;
  createdAt: string;
};

export type ProjectDocument = {
  id: string;
  title: string;
  originalFilename: string;
  sizeBytes: number;
  createdAt: string;
};

/** GET /api/projects/{id} 응답 */
export type ProjectDetail = {
  id: string;
  name: string;
  createdAt: string;
  documents: ProjectDocument[];
  cards: KnowledgeCard[];
};
