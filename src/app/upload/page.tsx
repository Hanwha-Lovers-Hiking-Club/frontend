import type { Metadata } from "next";
import { DocumentUploadWorkspace } from "@/features/document-upload/components/document-upload-workspace";

export const metadata: Metadata = {
  title: "문서 업로드",
  description: "프로젝트 산출물을 업로드해 지식카드로 만듭니다.",
};

export default function UploadPage() {
  return <DocumentUploadWorkspace />;
}
