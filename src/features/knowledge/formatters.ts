/** "2026-10-08" 또는 ISO 일시 -> "2026. 10. 8." (일시는 브라우저 시간대 기준) */
export function formatKnowledgeDate(iso: string) {
  // 날짜만 있는 문자열은 new Date 가 UTC 로 읽어 하루 밀릴 수 있어 로컬 시각으로 고정한다.
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}
