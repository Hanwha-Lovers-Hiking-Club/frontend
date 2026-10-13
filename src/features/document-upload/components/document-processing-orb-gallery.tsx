"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ParticlesOrb } from "@/features/document-upload/components/voice-orbs/particles-orb";

type OrbPalette = {
  colorFrom: string;
  colorTo: string;
  accentColor?: string;
  accentRatio?: number;
};

type Candidate = {
  name: string;
  description: string;
  processing: OrbPalette;
  complete: OrbPalette;
};

const candidates: Candidate[] = [
  {
    name: "01 · 신뢰에서 브랜드로",
    description: "차가운 정보 흐름이 한화 오렌지의 완성 신호로 전환되는 방식",
    processing: { colorFrom: "#353968", colorTo: "#54c7e8" },
    complete: {
      colorFrom: "#f37321",
      colorTo: "#ffc928",
      accentColor: "#fff7d6",
      accentRatio: 0.04,
    },
  },
  {
    name: "02 · 지식망의 점등",
    description: "보라·시안의 분석 흐름이 맑은 민트 네트워크로 정돈되는 방식",
    processing: { colorFrom: "#7766f8", colorTo: "#38c7e8" },
    complete: {
      colorFrom: "#18a89b",
      colorTo: "#90e3c2",
    },
  },
  {
    name: "03 · 지식의 새벽",
    description: "신비로운 분석 색이 밝은 살구·골드의 결과물로 피어나는 방식",
    processing: { colorFrom: "#5b4bc4", colorTo: "#a78bfa" },
    complete: {
      colorFrom: "#ff9f5a",
      colorTo: "#ffe06b",
      accentColor: "#fff7d6",
      accentRatio: 0.04,
    },
  },
];

function gradientStyle({ colorFrom, colorTo }: OrbPalette) {
  return { backgroundImage: `linear-gradient(90deg, ${colorFrom}, ${colorTo})` };
}

function PaletteDots({ palette }: { palette: OrbPalette }) {
  return (
    <span className="flex items-center gap-1.5" aria-label="색상 조합">
      <i aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: palette.colorFrom }} />
      <i aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: palette.colorTo }} />
      {palette.accentColor && (
        <i aria-hidden className="size-2.5 rounded-full ring-1 ring-zinc-200" style={{ backgroundColor: palette.accentColor }} />
      )}
    </span>
  );
}

function OrbStatePreview({
  title,
  description,
  palette,
  complete = false,
}: {
  title: string;
  description: string;
  palette: OrbPalette;
  complete?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3.5">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-zinc-400">{complete ? "COMPLETE" : "PROCESSING"}</p>
          <h2 className="mt-1 text-sm font-semibold text-zinc-900">{title}</h2>
        </div>
        <PaletteDots palette={palette} />
      </header>

      <div className="grid min-h-56 place-items-center bg-zinc-50/65 px-5 py-5">
        <ParticlesOrb
          state={complete ? "idle" : "thinking"}
          size={164}
          speed={complete ? 1.15 : 0.9}
          particleCount={complete ? 960 : undefined}
          colorFrom={palette.colorFrom}
          colorTo={palette.colorTo}
          accentColor={palette.accentColor}
          accentRatio={palette.accentRatio}
          motion={complete ? { breathe: 0.24, breatheRate: 1.4, drift: 0.2 } : undefined}
          label={title}
        />
      </div>

      <footer className="px-4 py-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{description}</span>
          <span className="font-mono tabular-nums">{complete ? "100%" : "58%"}</span>
        </div>
        <div
          role="progressbar"
          aria-label={title}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={complete ? 100 : 58}
        />
        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full"
            style={{ ...gradientStyle(palette), width: complete ? "100%" : "58%" }}
          />
        </div>
      </footer>
    </section>
  );
}

export function DocumentProcessingOrbGallery() {
  return (
    <main className="app-page px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-400">COLOR SYSTEM LAB</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
              문서 처리 색상 조합
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
              처리와 완료 상태의 오브·진행 게이지를 하나의 시스템으로 비교합니다. 선택 전까지 실제 업로드 화면은 바뀌지 않습니다.
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950">
            <Link href="/upload">업로드 화면으로 돌아가기</Link>
          </Button>
        </header>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {candidates.map((candidate) => (
            <article
              key={candidate.name}
              className="overflow-hidden rounded-[1.5rem] border border-zinc-200/90 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(24,36,31,0.5)]"
            >
              <header className="px-1 pb-4">
                <h2 className="text-base font-semibold tracking-[-0.02em] text-zinc-950">{candidate.name}</h2>
                <p className="mt-1.5 text-sm leading-6 text-zinc-500">{candidate.description}</p>
              </header>
              <div className="space-y-3">
                <OrbStatePreview
                  title="지식을 구조화하는 중"
                  description="처리 중 게이지"
                  palette={candidate.processing}
                />
                <OrbStatePreview
                  title="지식망 구성이 완료됨"
                  description="완료 게이지"
                  palette={candidate.complete}
                  complete
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
