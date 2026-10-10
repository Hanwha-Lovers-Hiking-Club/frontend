export const KNOWLEDGE_CARD_TYPES = ["technical", "case-study", "lesson"] as const;
export type KnowledgeCardType = (typeof KNOWLEDGE_CARD_TYPES)[number];

export type KnowledgeCardTypeFilter = KnowledgeCardType | "all";
export type KnowledgeSort = "recent" | "created" | "name";

/** 서버 응답과 1:1 로 대응하는 형태. 날짜는 ISO(YYYY-MM-DD) 문자열로 받는다. */
export type KnowledgeCard = {
  id: string;
  type: KnowledgeCardType;
  title: string;
  summary: string;
  tags: string[];
  source: string;
  sourceUrl?: string;
  department?: string;
  projectDate?: string;
  detail?: {
    situation: string;
    resolution: string;
    outcome: string;
    lesson: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeCardQuery = {
  query: string;
  type: KnowledgeCardTypeFilter;
  sort: KnowledgeSort;
  page: number;
  pageSize: number;
};

export type KnowledgeCardPage = {
  items: KnowledgeCard[];
  /** 필터 적용 후 전체 개수 (페이지네이션 계산용) */
  total: number;
};
