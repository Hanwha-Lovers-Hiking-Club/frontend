"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cardTypeConfig, sortOptions } from "@/features/knowledge/config";
import {
  KNOWLEDGE_CARD_TYPES,
  type KnowledgeCardTypeFilter,
  type KnowledgeSort,
} from "@/features/knowledge/types";

const selectClassName =
  "h-12 w-fit min-w-0 max-w-full cursor-pointer whitespace-nowrap rounded-xl border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-700 shadow-none transition-[border-color,box-shadow] hover:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20";

export function KnowledgeToolbar({
  type,
  sort,
  onSearch,
  onTypeChange,
  onSortChange,
}: {
  type: KnowledgeCardTypeFilter;
  sort: KnowledgeSort;
  onSearch: (query: string) => void;
  onTypeChange: (type: KnowledgeCardTypeFilter) => void;
  onSortChange: (sort: KnowledgeSort) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <section
      aria-label="지식카드 검색 및 정렬"
      className="mt-7 rounded-3xl border border-zinc-200/90 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(24,36,31,0.45)] sm:p-5"
    >
      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(draft.trim());
        }}
      >
        <label className="group relative block">
          <span className="sr-only">지식카드 검색</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-brand-strong"
            aria-hidden
          />
          <input
            type="search"
            placeholder="제목, 내용, 태그로 지식카드 검색"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 py-2 pl-11 pr-14 text-sm text-zinc-900 outline-none transition-[border-color,background-color,box-shadow] placeholder:text-zinc-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
          />
          <button
            type="submit"
            aria-label="검색"
            title="검색"
            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-xl bg-zinc-950 text-white transition-[background-color,transform] hover:bg-zinc-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45"
          >
            <Search className="size-4" aria-hidden />
          </button>
        </label>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <Select
            value={type}
            onValueChange={(value) => onTypeChange(value as KnowledgeCardTypeFilter)}
          >
            <SelectTrigger className={selectClassName} aria-label="카드 유형">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="rounded-xl border-zinc-200 p-1.5 shadow-lg">
              <SelectItem value="all" className="cursor-pointer rounded-lg py-2">모든 유형</SelectItem>
              {KNOWLEDGE_CARD_TYPES.map((value) => (
                <SelectItem key={value} value={value} className="cursor-pointer rounded-lg py-2">
                  {cardTypeConfig[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => onSortChange(value as KnowledgeSort)}
          >
            <SelectTrigger className={selectClassName} aria-label="정렬 기준">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="rounded-xl border-zinc-200 p-1.5 shadow-lg">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer rounded-lg py-2">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </section>
  );
}
