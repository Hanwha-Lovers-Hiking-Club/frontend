import { processingSteps } from "@/features/document-upload/config";

/**
 * 업로드 작업 서버 통신 경계. 백엔드가 준비되면 이 파일의 두 함수 본문만 교체한다.
 *   - submitUpload  -> POST /upload (파일 저장 후 작업 ID 만 즉시 응답)
 *   - connectJob    -> GET /jobs/{jobId}/events (SSE, 중간 접속 시 현재 단계부터 수신)
 * 지금은 서버 없이 개발할 수 있도록 작업 시작 시각(startedAt)만으로 진행 상태를 계산해 흉내 낸다.
 */

export type JobProgress = { activeStep: number; progress: number };

export type JobHandlers = {
  onProgress: (progress: JobProgress) => void;
  onComplete: () => void;
  /** 서버가 모르는 작업 ID (404). 서버 재시작 등으로 발생할 수 있다. */
  onNotFound: () => void;
};

export type SubmittedJob = {
  jobId: string;
  /** 개발용 시뮬레이션 전용. 실서버 연동 시 제거한다. */
  startedAt: number;
};

export const INITIAL_PROGRESS = 8;

const SIMULATED_START_DELAY = 1_500;
const SIMULATED_STEP_DURATION = 10_000;
const SIMULATED_COMPLETE_DELAY = 10_000;
const SIMULATED_TICK = 500;

export async function submitUpload(files: File[]): Promise<SubmittedJob> {
  void files;
  return { jobId: crypto.randomUUID(), startedAt: Date.now() };
}

export function connectJob(job: SubmittedJob, handlers: JobHandlers): () => void {
  const lastIndex = processingSteps.length - 1;
  const totalDuration = SIMULATED_START_DELAY + lastIndex * SIMULATED_STEP_DURATION + SIMULATED_COMPLETE_DELAY;
  let lastStep = -2;
  const tick = () => {
    const elapsed = Date.now() - job.startedAt;
    if (elapsed >= totalDuration) {
      clearInterval(timer);
      handlers.onProgress({ activeStep: lastIndex, progress: processingSteps[lastIndex].progress });
      handlers.onComplete();
      return;
    }

    const step =
      elapsed < SIMULATED_START_DELAY
        ? -1
        : Math.min(lastIndex, Math.floor((elapsed - SIMULATED_START_DELAY) / SIMULATED_STEP_DURATION));
    if (step === lastStep) return;
    lastStep = step;
    handlers.onProgress(
      step < 0
        ? { activeStep: 0, progress: INITIAL_PROGRESS }
        : { activeStep: step, progress: processingSteps[step].progress },
    );
  };

  const timer = setInterval(tick, SIMULATED_TICK);
  tick();
  return () => clearInterval(timer);
}
