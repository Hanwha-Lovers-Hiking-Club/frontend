/** "2026-10-08" 또는 ISO 일시 -> "2026. 10. 8." (일시는 브라우저 시간대 기준) */
export function formatKnowledgeDate(iso: string) {
  // 날짜만 있는 문자열은 new Date 가 UTC 로 읽어 하루 밀릴 수 있어 로컬 시각으로 고정한다.
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

/** ISO 일시 -> "2026. 10. 8. 14:05". 값이 없으면 "기록 없음". */
export function formatKnowledgeDateTime(iso: string | null | undefined) {
  if (!iso) return "기록 없음";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "기록 없음";
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${formatKnowledgeDate(iso)} ${time}`;
}

/** 횟수 필드가 없거나 null 이면 0 으로 본다. 값은 보정하지 않는다. */
export function formatKnowledgeCount(count: number | null | undefined) {
  return `${(typeof count === "number" && Number.isFinite(count) ? count : 0).toLocaleString("ko-KR")}회`;
}
