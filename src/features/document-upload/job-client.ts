import { apiUrl, readErrorDetail } from "@/utils/api";

export type JobProgress = { activeStep: number; progress: number };

export type CompletedJob = {
  jobId: string;
  status: "completed";
  createdCardCount: number;
};

export type JobHandlers = {
  onProgress: (progress: JobProgress) => void;
  onComplete: (job: CompletedJob) => void;
  onFailed: (developerMessage?: string) => void;
  onUnavailable: () => void;
};

export type SubmittedJob = {
  jobId: string;
  documentCount: number;
  status: "queued";
};

export class UploadRequestError extends Error {}

export const INITIAL_PROGRESS = 0;

export async function submitUpload(files: File[]): Promise<SubmittedJob> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  let response: Response;
  try {
    response = await fetch(apiUrl("/api/documents/upload"), {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new UploadRequestError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (response.status !== 202) {
    throw new UploadRequestError(
      (await readErrorDetail(response)) ?? "문서를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  const job = (await response.json()) as Partial<SubmittedJob>;
  if (
    typeof job.jobId !== "string" ||
    typeof job.documentCount !== "number" ||
    job.status !== "queued"
  ) {
    throw new UploadRequestError("서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }

  return job as SubmittedJob;
}

function readEventData<T>(event: MessageEvent<string>): T | null {
  try {
    return JSON.parse(event.data) as T;
  } catch {
    return null;
  }
}

export function connectJob(job: Pick<SubmittedJob, "jobId">, handlers: JobHandlers): () => void {
  const source = new EventSource(
    apiUrl(`/api/documents/jobs/${encodeURIComponent(job.jobId)}/events`),
  );
  let finished = false;

  const close = () => {
    finished = true;
    source.close();
  };

  source.addEventListener("progress", (event: MessageEvent<string>) => {
    const progress = readEventData<JobProgress>(event);
    if (
      progress &&
      Number.isInteger(progress.activeStep) &&
      progress.activeStep >= 0 &&
      progress.activeStep <= 8 &&
      typeof progress.progress === "number" &&
      progress.progress >= 0 &&
      progress.progress <= 100
    ) {
      handlers.onProgress(progress);
    }
  });

  source.addEventListener("completed", (event: MessageEvent<string>) => {
    const completed = readEventData<CompletedJob>(event);
    if (!completed || typeof completed.createdCardCount !== "number") {
      close();
      handlers.onUnavailable();
      return;
    }

    close();
    handlers.onComplete(completed);
  });

  source.addEventListener("failed", (event: MessageEvent<string>) => {
    const failed = readEventData<{ message?: unknown }>(event);
    close();
    handlers.onFailed(typeof failed?.message === "string" ? failed.message : undefined);
  });

  source.onerror = () => {
    if (!finished && source.readyState === EventSource.CLOSED) {
      close();
      handlers.onUnavailable();
    }
  };

  return close;
}
