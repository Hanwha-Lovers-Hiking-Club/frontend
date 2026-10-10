import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const baseButton = "grid size-10 place-items-center rounded-xl transition-colors";
const outlineButton = "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50";

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
    <nav aria-label="지식카드 페이지 이동" className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(baseButton, outlineButton, "disabled:cursor-not-allowed disabled:opacity-40")}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onPageChange(number)}
          aria-current={number === page ? "page" : undefined}
          className={cn(
            baseButton,
            "text-sm font-semibold",
            number === page ? "bg-zinc-950 text-white" : outlineButton,
          )}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(baseButton, outlineButton, "disabled:cursor-not-allowed disabled:opacity-40")}
        aria-label="다음 페이지"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
