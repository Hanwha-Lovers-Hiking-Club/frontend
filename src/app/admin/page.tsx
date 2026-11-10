import { ShieldCheck } from "lucide-react";

import { DraftCardBrowser } from "@/features/knowledge/components/draft-card-browser";

export default function AdminPage() {
  return (
    <main className="app-page px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div className="mx-auto w-full max-w-[90rem]">
        <header>
          <div className="flex items-center gap-2.5 text-zinc-500">
            <ShieldCheck className="size-5 text-brand-strong" aria-hidden />
            <span className="text-sm font-semibold">관리자</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-5xl">드래프트 카드</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            검증을 통과하지 못해 보류된 카드를 살펴보세요. 카드를 열면 본문과 근거, 보류 사유를 확인할 수 있습니다.
          </p>
        </header>

        <DraftCardBrowser />
      </div>
    </main>
  );
}
