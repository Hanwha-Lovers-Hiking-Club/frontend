import type { ChatReference } from "./types";
import { getMockKnowledgeCard } from "@/features/knowledge/mock";

export const demoReply = `업로드된 문서를 기준으로 보면, 현재 흐름은 **문서 수집 → 분석 처리 → 지식카드 생성**으로 정리할 수 있어요.

1. **문서 수집**
   파일을 추가한 뒤 미리보기로 내용을 확인합니다.

2. **분석 처리**
   문서 구조와 핵심 내용을 읽고, 지식으로 연결할 수 있는 단위를 추출합니다.

3. **지식카드 생성**
   추출한 내용을 상황·대응 방법·결과·재사용 포인트로 정리합니다.

다음으로는 처리 단계별 진행 메시지를 실제 서버 응답과 연결하면 사용자가 기다리는 흐름을 더 자연스럽게 만들 수 있습니다.`;

const demoKnowledgeCard = getMockKnowledgeCard("kc-007");
const demoSupportingCard = getMockKnowledgeCard("kc-003");
const demoSourceDocument = {
  id: "document-search-response-design",
  documentTitle: "검색 응답 설계서",
  location: "2장 · 답변 근거와 지식 연결",
  excerpt: "답변의 각 주장은 원본 문서와 연결하고, 같은 문서에서 파생된 지식카드는 근거를 빠르게 확인할 수 있도록 함께 제공해야 합니다.",
};
export const demoReferences: ChatReference[] = [
  ...(demoKnowledgeCard
    ? [{
        id: "knowledge-card-kc-007",
        type: "knowledge-card" as const,
        label: demoKnowledgeCard.title,
        card: demoKnowledgeCard,
        reason: "답변의 출처 연결 기준은 이 카드에 정리된 신뢰도·중복 인용 원칙을 따릅니다.",
        document: demoSourceDocument,
      }]
    : []),
  ...(demoSupportingCard
    ? [{
        id: "knowledge-card-kc-003",
        type: "knowledge-card" as const,
        label: demoSupportingCard.title,
        card: {
          ...demoSupportingCard,
          evidences: demoSupportingCard.evidences.map((evidence) => ({ ...evidence, documentTitle: demoSourceDocument.documentTitle })),
        },
        reason: "문서의 구조를 보존한 단위로 나누는 기준은 이 카드의 청크 분할 원칙을 참고했습니다.",
        document: demoSourceDocument,
      }]
    : []),
];
