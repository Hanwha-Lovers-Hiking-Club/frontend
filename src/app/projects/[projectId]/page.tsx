import { ProjectDetail } from "@/features/projects/components/project-detail";

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
