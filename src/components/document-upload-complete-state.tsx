import Link from "next/link";

import { Button } from "@/components/ui/button";

export function UploadCompleteState({
  documentCount,
  onReset,
}: {
  documentCount: number;
  onReset: () => void;
}) {
  return (
    <main className="grid min-h-[calc(100dvh-1.5rem)] place-items-center px-5 py-7 sm:min-h-[calc(100dvh-2rem)] sm:px-8">
      <section className="w-full max-w-lg border-y border-zinc-200 py-12 text-center sm:py-16">
        <p className="font-mono text-xs text-zinc-400">COMPLETE</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950">
          문서 정리가 끝났습니다.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {documentCount}개 문서의 내용을 정리했습니다. 생성된 지식카드를 확인해보세요.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="rounded-lg bg-zinc-950 text-white hover:bg-zinc-800">
            <Link href="/knowledge">지식카드 보러가기</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onReset}
            className="rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
          >
            새 문서 업로드
          </Button>
        </div>
      </section>
    </main>
  );
}
