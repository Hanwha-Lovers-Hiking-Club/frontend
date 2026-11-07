import type { KnowledgeCard, ProjectDomain } from "@/features/knowledge/types";

export type ProjectQuery = {
  query: string;
  sort: "created" | "name";
  page: number;
  pageSize: number;
};

export type ProjectPage = { items: ProjectSummary[]; total: number };

/**
 * GET /api/projects 의 항목. 같은 이름의 프로젝트도 별개이므로 이름이 아니라 id 로 구분한다.
 * cardCount 는 상세의 cards 와 같은 기준(active)으로 센다.
 * domain·team·period·description 은 문서에서 확인되지 않으면 null, stack 은 빈 배열이다.
 */
export type ProjectSummary = {
  id: string;
  name: string;
  domain: ProjectDomain | null;
  team: string | null;
  period: string | null;
  description: string | null;
  stack: string[];
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
export type ProjectDetail = Omit<ProjectSummary, "documentCount" | "cardCount"> & {
  documents: ProjectDocument[];
  cards: KnowledgeCard[];
};
