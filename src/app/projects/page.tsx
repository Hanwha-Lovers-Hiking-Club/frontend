import { FolderKanban } from "lucide-react";

import { ProjectList } from "@/features/projects/components/project-list";

export default function ProjectsPage() {
  return (
    <main className="app-page px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <div className="mx-auto w-full max-w-[90rem]">
        <header className="border-b border-zinc-200 pb-8 sm:pb-10">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <FolderKanban className="size-5 text-brand-strong" aria-hidden />
            <span className="text-sm font-semibold">프로젝트 폴더</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-zinc-950 sm:text-5xl">프로젝트</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
            업로드한 원본 문서와 그 문서에서 만들어진 지식카드를 프로젝트별로 살펴보세요.
          </p>
        </header>

        <ProjectList />
      </div>
    </main>
  );
}
