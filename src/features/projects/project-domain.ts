import { AppWindow, Bot, Database, Folder, MonitorSmartphone, Server, type LucideIcon } from "lucide-react";

import type { ProjectDomain } from "@/features/knowledge/types";

type DomainStyle = { label: string; icon: LucideIcon; color: string; ink: string };

/** 프로젝트 유형별 표시. 폴더 탭과 지식카드 행이 같은 값을 쓴다. */
const PROJECT_DOMAINS: Record<ProjectDomain, DomainStyle> = {
  ai: { label: "AI", icon: Bot, color: "#e0e5ff", ink: "#3a43c9" },
  frontend: { label: "프론트엔드", icon: AppWindow, color: "#ffe3c9", ink: "#b04003" },
  backend: { label: "백엔드", icon: Server, color: "#cdeefc", ink: "#056a94" },
  data: { label: "데이터", icon: Database, color: "#c9f4dd", ink: "#04704c" },
  app: { label: "앱", icon: MonitorSmartphone, color: "#ffdfe7", ink: "#c21a4e" },
};

/** 문서에서 유형을 판단하지 못한 프로젝트 */
const UNCLASSIFIED_DOMAIN: DomainStyle = { label: "미분류", icon: Folder, color: "#f1f0ee", ink: "#6b6660" };

export function getProjectDomainStyle(domain: ProjectDomain | null): DomainStyle {
  return (domain && PROJECT_DOMAINS[domain]) ?? UNCLASSIFIED_DOMAIN;
}
