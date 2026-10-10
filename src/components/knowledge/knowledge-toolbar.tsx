"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";

import { cardTypeConfig, sortOptions } from "@/lib/knowledge/config";
import {
  KNOWLEDGE_CARD_TYPES,
  type KnowledgeCardTypeFilter,
  type KnowledgeSort,
} from "@/lib/knowledge/types";

const selectClassName =
  "h-12 w-fit min-w-0 max-w-full cursor-pointer appearance-none whitespace-nowrap rounded-xl border border-zinc-200 bg-white py-2 pl-3.5 pr-10 text-sm font-medium text-zinc-700 outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/20";

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
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"
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

        <div className="flex flex-wrap gap-3 lg:justify-end">
          <SelectField label="카드 유형">
            <select
              className={selectClassName}
              value={type}
              onChange={(event) => onTypeChange(event.target.value as KnowledgeCardTypeFilter)}
            >
              <option value="all">모든 유형</option>
              {KNOWLEDGE_CARD_TYPES.map((value) => (
                <option key={value} value={value}>
                  {cardTypeConfig[value].label}
                </option>
              ))}
            </select>
          </SelectField>
          <SelectField label="정렬 기준">
            <select
              className={selectClassName}
              value={sort}
              onChange={(event) => onSortChange(event.target.value as KnowledgeSort)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SelectField>
        </div>
      </form>
    </section>
  );
}

function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="relative inline-flex max-w-full">
      <span className="sr-only">{label}</span>
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
        aria-hidden
      />
    </label>
  );
}
