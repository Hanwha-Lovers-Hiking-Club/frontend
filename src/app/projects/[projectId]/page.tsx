import type { Metadata } from "next";
import { fetchProject } from "@/features/projects/api";
import { ProjectDetail } from "@/features/projects/components/project-detail";

type ProjectParams = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: ProjectParams): Promise<Metadata> {
  const { projectId } = await params;
  const description = "프로젝트의 원본 문서와 지식카드를 확인합니다.";
  try {
    const project = await fetchProject(projectId);
    return { title: project.name, description };
  } catch {
    return { title: "프로젝트", description };
  }
}

export default async function ProjectPage({ params, searchParams }: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const { projectId } = await params;
  const search = await searchParams;
  const listParams = new URLSearchParams();
  for (const key of ["q", "sort", "page"] as const) {
    if (typeof search[key] === "string") listParams.set(key, search[key]);
  }

  return <ProjectDetail key={projectId} projectId={projectId} listHref={`/knowledge?${listParams}`} />;
}
