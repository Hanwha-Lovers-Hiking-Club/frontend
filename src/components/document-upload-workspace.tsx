"use client";

import { useEffect, useRef, useState } from "react";

import { UploadCompleteState } from "@/components/document-upload-complete-state";
import { UploadInitialState } from "@/components/document-upload-initial-state";
import { UploadProcessingState } from "@/components/document-upload-processing-state";
import { UploadReviewState } from "@/components/document-upload-review-state";
import {
  processingSteps,
  getDocumentId,
  type SelectedDocument,
  type UploadPhase,
} from "@/components/document-upload-types";
import { canGenerateDocumentPreview, generateDocumentPreview } from "@/lib/document-preview";

export function DocumentUploadWorkspace() {
  const [phase, setPhase] = useState<UploadPhase>("initial");
  const [documents, setDocuments] = useState<SelectedDocument[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const documentsRef = useRef<SelectedDocument[]>([]);

  function commitDocuments(nextDocuments: SelectedDocument[]) {
    documentsRef.current = nextDocuments;
    setDocuments(nextDocuments);
  }

  function releasePreview(document: SelectedDocument) {
    if (document.previewIsObjectUrl && document.previewUrl) {
      URL.revokeObjectURL(document.previewUrl);
    }
  }

  useEffect(() => {
    return () => documentsRef.current.forEach(releasePreview);
  }, []);

  useEffect(() => {
    if (phase !== "processing") return;

    let stepIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    // shortcut: local timer simulates streamed server progress until the upload API is connected.
    const advance = () => {
      const step = processingSteps[stepIndex];
      setActiveStep(stepIndex);
      setProgress(step.progress);

      if (stepIndex === processingSteps.length - 1) {
        timer = setTimeout(() => setPhase("complete"), 650);
        return;
      }

      stepIndex += 1;
      timer = setTimeout(advance, 900);
    };

    timer = setTimeout(advance, 700);
    return () => clearTimeout(timer);
  }, [phase]);

  function addDocuments(files: FileList | null) {
    if (!files) return;

    const existingIds = new Set(documentsRef.current.map((document) => document.id));
    const additions: SelectedDocument[] = Array.from(files)
      .map((file) => ({
        id: getDocumentId(file),
        file,
        previewState: canGenerateDocumentPreview(file) ? ("loading" as const) : undefined,
      }))
      .filter((document) => !existingIds.has(document.id));

    if (additions.length === 0) return;

    commitDocuments([...documentsRef.current, ...additions]);
    setPhase("review");

    void generatePreviews(additions.filter((document) => document.previewState === "loading"));
  }

  async function generatePreviews(documentsToPreview: SelectedDocument[]) {
    for (const document of documentsToPreview) {
      const preview = await generateDocumentPreview(document.file);

      if (!documentsRef.current.some((currentDocument) => currentDocument.id === document.id)) {
        if (preview?.isObjectUrl) URL.revokeObjectURL(preview.url);
        continue;
      }

      commitDocuments(
        documentsRef.current.map((currentDocument) =>
          currentDocument.id === document.id
            ? {
                ...currentDocument,
                previewUrl: preview?.url,
                previewIsObjectUrl: preview?.isObjectUrl,
                previewState: preview ? "ready" : undefined,
              }
            : currentDocument,
        ),
      );
    }
  }

  function removeDocument(id: string) {
    const removedDocument = documentsRef.current.find((document) => document.id === id);
    if (removedDocument) releasePreview(removedDocument);

    const remainingDocuments = documentsRef.current.filter((document) => document.id !== id);
    commitDocuments(remainingDocuments);

    if (remainingDocuments.length === 0) setPhase("initial");
  }

  function startProcessing() {
    if (documents.length === 0) return;
    setProgress(8);
    setActiveStep(0);
    setPhase("processing");
  }

  function resetUpload() {
    documentsRef.current.forEach(releasePreview);
    commitDocuments([]);
    setProgress(0);
    setActiveStep(0);
    setPhase("initial");
  }

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
      return (
        <UploadProcessingState
          activeStep={activeStep}
          documentCount={documents.length}
          progress={progress}
        />
      );
    case "complete":
      return <UploadCompleteState documentCount={documents.length} onReset={resetUpload} />;
    default:
      return <UploadInitialState onAddDocuments={addDocuments} />;
  }
}
