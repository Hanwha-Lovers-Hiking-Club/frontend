/** "2026-10-08" -> "2026. 10. 8." */
export function formatKnowledgeDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${year}. ${month}. ${day}.`;
}
