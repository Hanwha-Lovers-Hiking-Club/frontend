import type { KnowledgeCard } from "@/features/knowledge/types";

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
 */
export type ProjectSummary = {
  id: string;
  name: string;
  documentCount: number;
  cardCount: number;
  createdAt: string;
};

export type ProjectDomain = "ai" | "web" | "data" | "platform" | "client";
export type ProjectStage = "운영 중" | "파일럿" | "개선 중" | "종료";

/** 프로젝트를 구분하는 표시 정보. API 필드가 생기기 전까지 project-meta.ts 의 고정값을 쓴다. */
export type ProjectMeta = {
  domain: ProjectDomain;
  team: string;
  stage: ProjectStage;
  period: string;
  description: string;
  stack: string[];
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
