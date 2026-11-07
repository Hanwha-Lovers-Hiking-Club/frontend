import { AppWindow, Bot, Database, Folder, MonitorSmartphone, Server, type LucideIcon } from "lucide-react";

import type { ProjectDomain, ProjectMeta, ProjectStage } from "./types";

type DomainStyle = { label: string; icon: LucideIcon; color: string; ink: string };

/** 사이드바·문서·지식카드 아이콘에 쓰는 연한 면색 + 진한 글자색 조합을 따른다. */
const PROJECT_DOMAINS: Record<ProjectDomain, DomainStyle> = {
  ai: { label: "AI 에이전트", icon: Bot, color: "#e0e5ff", ink: "#3a43c9" },
  web: { label: "웹 서비스", icon: AppWindow, color: "#ffe3c9", ink: "#b04003" },
  data: { label: "데이터·정산", icon: Database, color: "#c9f4dd", ink: "#04704c" },
  platform: { label: "백엔드 플랫폼", icon: Server, color: "#cdeefc", ink: "#056a94" },
  client: { label: "데스크톱·모바일", icon: MonitorSmartphone, color: "#ffdfe7", ink: "#c21a4e" },
};

/** 메타 정보가 없는 프로젝트(새로 업로드한 폴더 등)의 탭 */
const UNCLASSIFIED_DOMAIN: DomainStyle = { label: "미분류", icon: Folder, color: "#f1f0ee", ink: "#6b6660" };

export const PROJECT_STAGE_DOT: Record<ProjectStage, string> = {
  "운영 중": "bg-emerald-500",
  "파일럿": "bg-brand",
  "개선 중": "bg-trust",
  "종료": "bg-zinc-400",
};

/**
 * 시연용 고정값. 백엔드가 같은 필드를 내려주면 이 표를 지우고 ProjectSummary 로 옮긴다.
 * 시드를 다시 넣으면 일부 id 가 바뀌므로 고정값에 한해 이름을 키로 쓴다.
 */
const PROJECT_META: Record<string, ProjectMeta> = {
  "헬프데스크 에이전트": { domain: "ai", team: "IT운영팀", stage: "파일럿", period: "2026.05 – 07", description: "사내 IT 문의를 먼저 응대하고 필요한 건은 담당자에게 넘기는 에이전트", stack: ["LLM", "ITSM", "규칙 엔진"] },
  "IT 도우미 에이전트": { domain: "ai", team: "자동화파트", stage: "운영 중", period: "2026.03 – 06", description: "시행일 기준으로 최신 사내 규정을 찾아 답변하는 IT 문의 도우미", stack: ["RAG", "검색 색인"] },
  "고객지원 챗봇": { domain: "ai", team: "AI파트", stage: "운영 중", period: "2026.02 – 05", description: "요금표와 안내 문서를 근거로 인용해 답변하는 고객 상담 챗봇", stack: ["RAG", "PDF 파싱"] },
  "환불 에이전트": { domain: "ai", team: "CX 자동화팀", stage: "파일럿", period: "2026.04 –", description: "주문과 환불 규정을 조회해 환불 가능 금액을 계산하는 상담 에이전트", stack: ["Tool Calling", "레드팀"] },
  "정비 도우미": { domain: "ai", team: "AX팀", stage: "파일럿", period: "2026.06 –", description: "정비 매뉴얼의 수치를 찾아 안내하고 작업지시까지 연결하는 현장 도우미", stack: ["RAG", "표 청킹", "평가셋"] },
  "길잡이데스크": { domain: "ai", team: "업무지원팀", stage: "운영 중", period: "2026.01 – 05", description: "승인된 최신 규정만 근거로 삼아 답하는 사내 업무 안내 데스크", stack: ["RAG", "문서 버전 관리"] },
  "PR 리뷰 제안 에이전트": { domain: "ai", team: "개발생산성팀", stage: "개선 중", period: "2026.05 –", description: "PR 규모와 변경 경로에 따라 수정 제안 범위를 조절하는 코드 리뷰 봇", stack: ["GitHub", "LLM"] },
  "조항지기": { domain: "ai", team: "AX팀", stage: "파일럿", period: "2026.07 –", description: "계약서의 위험 조항을 찾아 원문 인용과 함께 보여주는 검토 도구", stack: ["문서 분석", "인용 검증"] },
  "근거등대": { domain: "ai", team: "업무도구팀", stage: "개선 중", period: "2026.04 –", description: "권한에 맞는 사내 문서만 검색해 근거를 찾아주는 지식 검색 서비스", stack: ["검색 인덱스", "권한 동기화"] },

  "말결화면": { domain: "web", team: "국제화제품팀", stage: "운영 중", period: "2026.01 – 04", description: "번역 키 누락을 빌드에서 막고 RTL까지 지원하는 다국어 화면 정비", stack: ["i18n", "RTL", "CI"] },
  "책다리 웹 뷰어": { domain: "web", team: "뷰어팀", stage: "운영 중", period: "2026.03 – 06", description: "웹폰트 로딩에도 페이지가 흔들리지 않는 전자책 웹 뷰어", stack: ["TypeScript", "Font Loading"] },
  "한결로지스 센터 운영 대시보드": { domain: "web", team: "물류시스템팀", stage: "운영 중", period: "2026.02 – 06", description: "해외 센터 시간대에 맞춰 출고 마감을 보여주는 물류 운영 화면", stack: ["React", "ISO 8601"] },
  "관제 대시보드": { domain: "web", team: "관제개발팀", stage: "개선 중", period: "2026.05 –", description: "관제 PC에서 장시간 켜 두어도 느려지지 않도록 다듬은 실시간 화면", stack: ["WebSocket", "DevTools"] },
  "청구 위저드": { domain: "web", team: "청구서비스팀", stage: "종료", period: "2026.02 – 04", description: "모바일 뒤로 가기에도 중복 접수되지 않는 단계형 청구 화면", stack: ["iOS Safari", "bfcache"] },
  "케어링크 보호자 웹": { domain: "web", team: "웹파트", stage: "운영 중", period: "2026.06 – 09", description: "보호자가 단계별 신청서를 끊김 없이 작성하는 돌봄 서비스 웹", stack: ["React Hook Form", "Axios"] },
  "모아접수": { domain: "web", team: "접점개발팀", stage: "운영 중", period: "2025.12 – 2026.02", description: "개인정보는 빼고 작성 중인 신청서만 복원하는 민원 접수 화면", stack: ["IndexedDB", "React"] },
  "통합예약": { domain: "web", team: "프론트엔드 외주", stage: "운영 중", period: "2026.01 – 04", description: "스크린리더로도 날짜를 고를 수 있는 공공시설 통합 예약", stack: ["접근성", "VoiceOver", "TalkBack"] },
  "웹 성능 개선": { domain: "web", team: "커머스웹팀", stage: "개선 중", period: "2026.06 –", description: "상품 이미지와 레이아웃 이동을 줄여 체감 속도를 높인 커머스 개선", stack: ["LCP", "CLS", "RUM"] },
  "온담 생활체육 예약": { domain: "web", team: "웹파트", stage: "운영 중", period: "2026.03 – 06", description: "접속이 몰리는 시간의 대기실과 카운트다운을 다룬 체육시설 예약", stack: ["대기열", "Web Worker"] },
  "모아신청": { domain: "web", team: "시민서비스팀", stage: "운영 중", period: "2026.04 – 07", description: "한글 입력 중에도 단계가 어긋나지 않는 시민 서비스 신청 화면", stack: ["IME", "React"] },
  "반경길잡이": { domain: "web", team: "지도서비스팀", stage: "운영 중", period: "2025.10 – 2026.01", description: "지도 구역별 담당자를 배정하고 변경 이력까지 남기는 상담 도구", stack: ["PostGIS", "지도 SDK"] },
  "함께초안": { domain: "web", team: "협업편집팀", stage: "개선 중", period: "2026.05 –", description: "여러 사람이 한글로 동시에 입력해도 글자가 겹치지 않는 공동 편집기", stack: ["CRDT", "IME"] },

  "목록옮김": { domain: "data", team: "데이터도입팀", stage: "운영 중", period: "2026.01 – 04", description: "CSV를 검증하고 승인된 파일만 옮기는 대량 데이터 가져오기 도구", stack: ["CSV", "체크섬"] },
  "월말 정산 배치": { domain: "data", team: "정산개발팀", stage: "운영 중", period: "2025.11 – 2026.02", description: "부분 환불까지 반영해 월별 수수료와 정산액을 계산하는 배치", stack: ["PostgreSQL", "Batch"] },
  "물결집계": { domain: "data", team: "데이터운영팀", stage: "운영 중", period: "2026.04 – 07", description: "늦게 들어온 주문 보정까지 추적해 다시 계산하는 판매 집계", stack: ["SQL", "데이터 계보"] },
  "통합도서관 회원 일원화": { domain: "data", team: "이관팀", stage: "종료", period: "2026.03 – 06", description: "지자체 도서관의 레거시 회원 DB를 하나로 합친 이관 프로젝트", stack: ["CP949", "VPN", "레거시 DB"] },
  "결제 데이터 정합성": { domain: "data", team: "결제팀", stage: "개선 중", period: "2026.05 –", description: "순서가 뒤바뀐 웹훅에도 결제 상태가 틀어지지 않게 한 보정 작업", stack: ["Webhook", "상태 머신"] },
  "주간 정산 배치": { domain: "data", team: "정산플랫폼팀", stage: "운영 중", period: "2026.02 – 05", description: "다중 인스턴스에서도 한 번만 지급되도록 고친 주간 정산 배치", stack: ["DB Lock", "Scheduler"] },
  "회원·포인트 DB 전환": { domain: "data", team: "플랫폼팀", stage: "종료", period: "2026.03 – 07", description: "서비스 중단을 줄이며 회원과 포인트 DB를 옮긴 전환 프로젝트", stack: ["MySQL", "PostgreSQL", "CDC"] },
  "곁창고": { domain: "data", team: "물류 플랫폼팀", stage: "운영 중", period: "2026.05 – 08", description: "대량 재고 내역을 빠짐없이 내보내는 물류 창고 데이터 도구", stack: ["CSV", "Cursor Pagination"] },

  "교대배포": { domain: "platform", team: "서비스운영팀", stage: "운영 중", period: "2026.03 – 06", description: "스키마를 바꾸는 중에도 503 없이 새 버전을 올리는 무중단 배포", stack: ["Blue-Green", "Migration"] },
  "예약 재고 동시성": { domain: "platform", team: "예약플랫폼팀", stage: "개선 중", period: "2026.07 –", description: "동시 결제와 웹훅 역전에도 예약이 겹치지 않게 한 재고 처리", stack: ["Webhook", "Transaction"] },
  "슬롯마루": { domain: "platform", team: "예약플랫폼팀", stage: "운영 중", period: "2025.12 – 2026.03", description: "예약 슬롯 재고와 금액 대조를 맡는 예약 플랫폼 코어", stack: ["Transaction", "금액 대조"] },
  "메디노트 알림 플랫폼": { domain: "platform", team: "알림플랫폼팀", stage: "운영 중", period: "2026.02 – 06", description: "장애 뒤에도 진료 알림을 시간에 맞게 보내는 메시지 발송 플랫폼", stack: ["Message Queue", "알림톡"] },
  "경계문서함": { domain: "platform", team: "보안제품팀", stage: "파일럿", period: "2026.06 –", description: "승인받은 범위만 임시로 열람하게 하는 보안 문서 저장소", stack: ["RBAC", "감사 로그"] },

  "폴더이음": { domain: "client", team: "데스크톱팀", stage: "개선 중", period: "2026.04 –", description: "편집기의 저장 방식과 상관없이 파일 이력을 잇는 폴더 동기화 앱", stack: ["File Watcher", "Electron"] },
  "현장수첩": { domain: "client", team: "현장제품팀", stage: "운영 중", period: "2026.02 – 06", description: "오프라인에서도 사진과 점검 기록을 남기는 시설 현장 앱", stack: ["Offline Sync", "Mobile"] },
};

export function getProjectMeta(name: string | null): ProjectMeta | null {
  return name ? (PROJECT_META[name] ?? null) : null;
}

export function getProjectDomainStyle(name: string | null): DomainStyle {
  const meta = getProjectMeta(name);
  return meta ? PROJECT_DOMAINS[meta.domain] : UNCLASSIFIED_DOMAIN;
}
