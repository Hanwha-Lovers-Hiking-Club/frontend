import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";

const baseButton = "grid size-10 place-items-center rounded-xl transition-colors";
const outlineButton = "border border-zinc-200 bg-white text-zinc-600 shadow-[0_1px_1px_rgba(24,36,31,0.03)] hover:border-zinc-300 hover:bg-zinc-50";

export function KnowledgePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="지식카드 페이지 이동" className="relative flex items-center justify-center border-t border-zinc-200 bg-zinc-50/65 px-5 py-4 sm:px-6">
      <p className="absolute left-6 hidden text-sm text-zinc-500 sm:block">
        <span className="font-semibold text-zinc-800">{page}</span> / {totalPages} 페이지
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(baseButton, outlineButton, "disabled:cursor-not-allowed disabled:opacity-40")}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-[0_1px_1px_rgba(24,36,31,0.03)]">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onPageChange(number)}
          aria-current={number === page ? "page" : undefined}
          className={cn(
            "grid size-8 place-items-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45",
            number === page ? "bg-primary text-primary-foreground shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950",
          )}
        >
          {number}
        </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(baseButton, outlineButton, "disabled:cursor-not-allowed disabled:opacity-40")}
          aria-label="다음 페이지"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
