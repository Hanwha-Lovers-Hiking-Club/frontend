import { ProjectDetail } from "@/features/projects/components/project-detail";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  return <ProjectDetail key={projectId} projectId={projectId} />;
}
