import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UploadJobRestorer } from "@/features/document-upload/components/upload-job-restorer";
import "./globals.css";

const paperlogy = localFont({
  src: [
    { path: "./fonts/Paperlogy-4Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Paperlogy-5Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Paperlogy-6SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Paperlogy-7Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-paperlogy",
  display: "swap",
  fallback: ["system-ui", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "기술 지식 자산화 Agent",
  description: "프로젝트 산출물을 검색 가능한 기술 지식으로 전환합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${paperlogy.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UploadJobRestorer />
        <TooltipProvider>
          <AppSidebar>{children}</AppSidebar>
        </TooltipProvider>
      </body>
    </html>
  );
}
