"use client";

import { UploadInitialState } from "@/features/document-upload/components/document-upload-initial-state";
import { UploadProcessingState } from "@/features/document-upload/components/document-upload-processing-state";
import { UploadReviewState } from "@/features/document-upload/components/document-upload-review-state";
import { useUploadStore } from "@/stores/use-upload-store";

/** 진행 상태와 서버 연결은 useUploadStore 가 전역으로 관리한다. 이 컴포넌트는 단계별 화면만 고른다. */
export function DocumentUploadWorkspace() {
  const phase = useUploadStore((state) => state.phase);
  const documents = useUploadStore((state) => state.documents);
  const documentCount = useUploadStore((state) => state.documentCount);
  const progress = useUploadStore((state) => state.progress);
  const activeStep = useUploadStore((state) => state.activeStep);
  const addDocuments = useUploadStore((state) => state.addDocuments);
  const removeDocument = useUploadStore((state) => state.removeDocument);
  const startProcessing = useUploadStore((state) => state.startProcessing);
  const reset = useUploadStore((state) => state.reset);

  switch (phase) {
    case "review":
      return (
        <UploadReviewState
          documents={documents}
          onAddDocuments={addDocuments}
          onRemoveDocument={removeDocument}
          onStartProcessing={startProcessing}
        />
      );
    case "processing":
      return <UploadProcessingState activeStep={activeStep} documentCount={documentCount} progress={progress} />;
    case "complete":
      return (
        <UploadProcessingState
          activeStep={activeStep}
          documentCount={documentCount}
          progress={progress}
          status="complete"
          onReset={reset}
        />
      );
    default:
      return <UploadInitialState onAddDocuments={addDocuments} />;
  }
}
