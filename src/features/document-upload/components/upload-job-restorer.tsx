"use client";

import { useEffect } from "react";

import { useUploadStore } from "@/stores/use-upload-store";

/** 앱 최상단에서 한 번 마운트되어, 새로고침 전에 진행 중이던 업로드 작업에 다시 접속한다. */
export function UploadJobRestorer() {
  useEffect(() => {
    useUploadStore.getState().restoreJob();
  }, []);

  return null;
}
