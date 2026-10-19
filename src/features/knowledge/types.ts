/**
 * 카드 유형은 DB 에 없다. 실제 추출 결과를 본 뒤 도입 여부를 정하기로 해서 보류 중이며,
 * 지금은 KnowledgeCard / KnowledgeCardQuery 어디에도 사용하지 않는다.
 */
export const KNOWLEDGE_CARD_TYPES = ["technical", "case-study", "lesson"] as const;
export type KnowledgeCardType = (typeof KNOWLEDGE_CARD_TYPES)[number];

export type KnowledgeSort = "recent" | "created" | "name";

/** knowledge_cards.status */
export type KnowledgeCardStatus = "draft" | "active" | "flagged" | "archived";

/**
 * 카드의 근거 하나 (card_documents 행 + documents 정보).
 * 한 문서에 근거가 여러 개일 수 있다. 확장자는 originalFilename 끝에서 잘라 쓴다.
 */
export type KnowledgeCardEvidence = {
  id: string;
  documentId: string;
  /** documents.title (LLM 이 뽑은 제목) */
  documentTitle: string;
  /** documents.original_filename (사용자가 올린 파일명) */
  originalFilename: string;
  /** 원문 내 위치. 예: "3장 · 통신 방식 선정" */
  location: string;
  /** 원문에서 그대로 가져온 발췌문 */
  excerpt: string;
  /** 백엔드가 내려주는 서명된 임시 URL */
  url: string | null;
};

/**
 * knowledge_cards 테이블 기준 형태. 필드명은 camelCase 로 두었다(백엔드 snake_case 변환 위치는 미정).
 * 날짜는 ISO 문자열이며 date 컬럼은 YYYY-MM-DD 로 받는다.
 * problem / cause / approach / rationale / outcome 은 최소 1개만 값이 있다.
 */
export type KnowledgeCard = {
  id: string;
  title: string;
  summary: string;
  context: string;
  problem: string | null;
  cause: string | null;
  approach: string | null;
  rationale: string | null;
  outcome: string | null;
  lesson: string;
  /** 기술 스택 (WebSocket, Supabase 등) */
  technologies: string[];
  /** 분야/주제어 (웹 개발, QA 등) */
  keywords: string[];
  projectName: string | null;
  department: string | null;
  projectDate: string | null;
  status: KnowledgeCardStatus;
  qualityScore: number | null;
  lastVerifiedAt: string | null;
  verificationVersion: string | null;
  createdAt: string;
  updatedAt: string;
  evidences: KnowledgeCardEvidence[];
};

export type KnowledgeCardQuery = {
  query: string;
  sort: KnowledgeSort;
  page: number;
  pageSize: number;
};

export type KnowledgeCardPage = {
  items: KnowledgeCard[];
  /** 검색 조건 적용 후 전체 개수 (페이지네이션 계산용) */
  total: number;
};
