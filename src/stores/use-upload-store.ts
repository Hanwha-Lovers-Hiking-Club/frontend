import { create } from "zustand";

import { canGenerateDocumentPreview, generateDocumentPreview } from "@/features/document-upload/document-preview";
import { getDocumentId } from "@/features/document-upload/file-utils";
import { connectJob, INITIAL_PROGRESS, submitUpload, type SubmittedJob } from "@/features/document-upload/job-client";
import type { SelectedDocument, UploadPhase } from "@/features/document-upload/types";

/**
 * 업로드 진행 상태를 앱 전역에서 유지한다. 화면(/upload)을 벗어나도 작업 연결은 끊기지 않고,
 * 새로고침하면 localStorage 의 작업 ID 로 다시 접속해 진행 화면을 복구한다.
 */

const JOB_STORAGE_KEY = "upload-job";

type StoredJob = SubmittedJob & { documentCount: number };

function readStoredJob(): StoredJob | null {
  try {
    const raw = localStorage.getItem(JOB_STORAGE_KEY);
    if (!raw) return null;
    const job = JSON.parse(raw) as Partial<StoredJob>;
    if (typeof job.jobId !== "string" || typeof job.startedAt !== "number") return null;
    return { jobId: job.jobId, startedAt: job.startedAt, documentCount: Number(job.documentCount) || 1 };
  } catch {
    return null;
  }
}

function writeStoredJob(job: StoredJob | null) {
  try {
    if (job) localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(job));
    else localStorage.removeItem(JOB_STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 복구만 포기한다.
  }
}

function releasePreview(document: SelectedDocument) {
  if (document.previewIsObjectUrl && document.previewUrl) URL.revokeObjectURL(document.previewUrl);
}

type UploadStore = {
  phase: UploadPhase;
  documents: SelectedDocument[];
  /** 새로고침 후에는 File 이 사라지므로 표시용 개수는 따로 가진다. */
  documentCount: number;
  progress: number;
  activeStep: number;
  jobId: string | null;
  error: string | null;
  addDocuments: (files: FileList | File[] | null) => void;
  removeDocument: (id: string) => void;
  startProcessing: () => Promise<void>;
  /** 앱 시작 시 한 번 호출. 저장된 작업이 있으면 다시 접속한다. */
  restoreJob: () => void;
  reset: () => void;
};

let disconnect: (() => void) | null = null;

export const useUploadStore = create<UploadStore>((set, get) => {
  function listen(job: StoredJob) {
    disconnect?.();
    disconnect = connectJob(job, {
      onProgress: ({ activeStep, progress }) => set({ activeStep, progress }),
      onComplete: () => {
        disconnect?.();
        disconnect = null;
        set({ phase: "complete" });
      },
      onNotFound: () => {
        // 서버가 모르는 작업이면 저장된 ID 를 지우고 초기 화면으로 돌아간다.
        get().reset();
      },
    });
  }

  async function generatePreviews(documentsToPreview: SelectedDocument[]) {
    for (const document of documentsToPreview) {
      const preview = await generateDocumentPreview(document.file);

      if (!get().documents.some((current) => current.id === document.id)) {
        if (preview?.isObjectUrl) URL.revokeObjectURL(preview.url);
        continue;
      }

      set((state) => ({
        documents: state.documents.map((current) =>
          current.id === document.id
            ? {
                ...current,
                previewUrl: preview?.url,
                previewIsObjectUrl: preview?.isObjectUrl,
                previewState: preview ? ("ready" as const) : undefined,
              }
            : current,
        ),
      }));
    }
  }

  return {
    phase: "initial",
    documents: [],
    documentCount: 0,
    progress: 0,
    activeStep: 0,
    jobId: null,
    error: null,

    addDocuments: (files) => {
      if (!files) return;

      const existingIds = new Set(get().documents.map((document) => document.id));
      const additions: SelectedDocument[] = Array.from(files)
        .map((file) => ({
          id: getDocumentId(file),
          file,
          previewState: canGenerateDocumentPreview(file) ? ("loading" as const) : undefined,
        }))
        .filter((document) => !existingIds.has(document.id));

      if (additions.length === 0) return;

      set((state) => ({ documents: [...state.documents, ...additions], phase: "review", error: null }));
      void generatePreviews(additions.filter((document) => document.previewState === "loading"));
    },

    removeDocument: (id) => {
      const removed = get().documents.find((document) => document.id === id);
      if (removed) releasePreview(removed);

      const remaining = get().documents.filter((document) => document.id !== id);
      set({ documents: remaining, ...(remaining.length === 0 ? { phase: "initial" as const } : {}) });
    },

    startProcessing: async () => {
      const { documents, phase } = get();
      if (documents.length === 0 || phase !== "review") return;

      // 접수 요청이 나가는 동안 중복 시작을 막는다.
      set({ phase: "processing", progress: INITIAL_PROGRESS, activeStep: 0, documentCount: documents.length, error: null });
      try {
        const submitted = await submitUpload(documents.map((document) => document.file));
        const job: StoredJob = { ...submitted, documentCount: documents.length };
        writeStoredJob(job);
        set({ jobId: job.jobId });
        listen(job);
      } catch {
        set({ phase: "review", error: "문서를 업로드하지 못했습니다. 잠시 후 다시 시도해 주세요." });
      }
    },

    restoreJob: () => {
      if (get().phase !== "initial" || get().jobId) return;
      const job = readStoredJob();
      if (!job) return;

      set({ phase: "processing", jobId: job.jobId, documentCount: job.documentCount, progress: INITIAL_PROGRESS, activeStep: 0 });
      listen(job);
    },

    reset: () => {
      disconnect?.();
      disconnect = null;
      get().documents.forEach(releasePreview);
      writeStoredJob(null);
      set({ phase: "initial", documents: [], documentCount: 0, progress: 0, activeStep: 0, jobId: null, error: null });
    },
  };
});
