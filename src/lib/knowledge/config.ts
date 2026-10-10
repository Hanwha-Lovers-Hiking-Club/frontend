import { FileText, FolderKanban, Layers3, type LucideIcon } from "lucide-react";

import type { KnowledgeCardType, KnowledgeSort } from "./types";

export const KNOWLEDGE_PAGE_SIZE = 12;

/** 카드 유형별 표시 정보. 유형을 추가·변경할 때 이 객체와 types.ts 의 목록만 고치면 된다. */
export const cardTypeConfig: Record<
  KnowledgeCardType,
  { label: string; icon: LucideIcon; badgeClassName: string }
> = {
  technical: { label: "기술", icon: Layers3, badgeClassName: "bg-emerald-100/80 text-emerald-700" },
  "case-study": { label: "사례", icon: FolderKanban, badgeClassName: "bg-orange-100/80 text-orange-700" },
  lesson: { label: "교훈", icon: FileText, badgeClassName: "bg-sky-100/80 text-sky-700" },
};

export const sortOptions: { value: KnowledgeSort; label: string }[] = [
  { value: "recent", label: "최근 업데이트순" },
  { value: "created", label: "최신 생성순" },
  { value: "name", label: "이름순" },
];

/** "2026-10-08" -> "2026. 10. 8." */
export function formatKnowledgeDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${year}. ${month}. ${day}.`;
}
