"use client";

import { Sheet } from "@/components/ui/sheet";
import { ChatEvidenceList } from "@/features/chat/components/chat-evidence-list";
import type { ChatReference, ChatSource } from "@/features/chat/types";
import { KnowledgeCardDetailBody, SidePanelContent } from "@/features/knowledge/components/knowledge-card-detail-panel";

/** 답변 근거 목록과, 거기서 고른 지식카드 상세를 한 패널 안에서 오간다. */
export function ChatReferencePanel({
  isOpen,
  references,
  sources,
  selectedReferenceId,
  onClose,
  onSelectReference,
}: {
  isOpen: boolean;
  references: ChatReference[];
  sources: ChatSource[];
  selectedReferenceId: string | null;
  onClose: () => void;
  onSelectReference: (referenceId: string | null) => void;
}) {
  const reference = references.find((item) => item.id === selectedReferenceId) ?? null;
  const relatedReferences = references.filter((item) => item.document.id === reference?.document.id);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <SidePanelContent
          heading={reference ? "지식 상세" : "답변 근거"}
          contentKey={reference?.id ?? "evidence-list"}
          onBack={reference ? () => onSelectReference(null) : undefined}
          backLabel="답변 근거로 돌아가기"
        >
          {reference ? (
            <KnowledgeCardDetailBody
              card={reference.card}
              selectionReason={reference.reason}
              relatedCards={relatedReferences.map((item) => item.card)}
              onSelectCard={(card) => {
                const nextReference = relatedReferences.find((item) => item.card.id === card.id);
                if (nextReference) onSelectReference(nextReference.id);
              }}
              sourceContext={{ documentId: reference.document.id, documentTitle: reference.document.documentTitle, excerpt: reference.document.excerpt, location: reference.document.location }}
            />
          ) : (
            <ChatEvidenceList references={references} sources={sources} onSelectReference={onSelectReference} />
          )}
        </SidePanelContent>
      )}
    </Sheet>
  );
}
