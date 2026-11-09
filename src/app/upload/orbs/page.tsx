import type { Metadata } from "next";
import { DocumentProcessingOrbGallery } from "@/features/document-upload/components/document-processing-orb-gallery";

export const metadata: Metadata = {
  title: "문서 처리 애니메이션",
  description: "문서 처리 단계 애니메이션 미리보기입니다.",
};

export default function DocumentProcessingOrbTestPage() {
  return <DocumentProcessingOrbGallery />;
}
