import type { Metadata } from "next";
import { FileUp, Folder, LibraryBig } from "lucide-react";
import Link from "next/link";

import { KnowledgeCardBrowser } from "@/features/knowledge/components/knowledge-card-browser";
import { ProjectList } from "@/features/projects/components/project-list";
import { cn } from "@/utils/cn";

export const metadata: Metadata = {
  title: "지식카드",
  description: "프로젝트별 지식카드를 검색하고 살펴봅니다.",
};

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const isCards = params.view === "cards";
  const page = Number(params.page ?? 1);

  return (
    <main className="app-page px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div className="mx-auto w-full max-w-[90rem]">
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2.5 text-zinc-500">
              <LibraryBig className="size-5 text-brand-strong" aria-hidden />
              <span className="text-sm font-semibold">지식 라이브러리</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-5xl">지식카드</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
              프로젝트별로 살펴보거나, 전체 카드에서 필요한 지식을 찾아보세요.
            </p>
          </div>
          <Link href="/upload" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45">
            <FileUp className="size-4" aria-hidden />문서 업로드
          </Link>
        </header>

        <nav aria-label="지식카드 보기 방식" className="mt-8 flex gap-6 border-b border-zinc-200 sm:mt-10">
          {[
            { href: "/knowledge", label: "프로젝트별 보기", icon: Folder, active: !isCards },
            { href: "/knowledge?view=cards", label: "전체 카드", icon: LibraryBig, active: isCards },
          ].map(({ href, label, icon: Icon, active }) => (
            <Link key={href} href={href} scroll={false} aria-current={active ? "page" : undefined} className={cn(
              "inline-flex items-center gap-2 border-b-2 px-1 pb-4 pt-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45",
              active ? "border-brand text-brand-strong" : "border-transparent text-zinc-500 hover:text-zinc-900",
            )}>
              <Icon className="size-4" aria-hidden />{label}
            </Link>
          ))}
        </nav>

        {isCards ? <KnowledgeCardBrowser /> : (
          <ProjectList
            query={typeof params.q === "string" ? params.q.trim() : ""}
            sort={params.sort === "name" ? "name" : "created"}
            page={Number.isSafeInteger(page) && page > 0 ? page : 1}
          />
        )}
      </div>
    </main>
  );
}
