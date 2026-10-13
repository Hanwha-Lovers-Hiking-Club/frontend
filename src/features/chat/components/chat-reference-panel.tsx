"use client";

import { KnowledgeCardDetailPanel } from "@/features/knowledge/components/knowledge-card-detail-panel";
import type { ChatReference } from "@/features/chat/types";

export function ChatReferencePanel({
  references,
  selectedReferenceId,
  onClose,
  onSelectReference,
}: {
  references: ChatReference[];
  selectedReferenceId: string | null;
  onClose: () => void;
  onSelectReference: (referenceId: string) => void;
}) {
  const reference = references.find((item) => item.id === selectedReferenceId) ?? null;
  const relatedReferences = references.filter((item) => item.document.id === reference?.document.id);

  return (
    <KnowledgeCardDetailPanel
      card={reference?.card ?? null}
      onClose={onClose}
      relatedCards={relatedReferences.map((item) => item.card)}
      onSelectCard={(card) => {
        const nextReference = relatedReferences.find((item) => item.card.id === card.id);
        if (nextReference) onSelectReference(nextReference.id);
      }}
      sourceContext={reference ? { excerpt: reference.document.excerpt, location: reference.document.location } : undefined}
    />
  );
}
