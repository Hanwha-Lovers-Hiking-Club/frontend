const TABLE_DIVIDER = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/**
 * 근거 원문 청크는 문서 중간을 자른 마크다운이라 표·목록이 온전하지 않다.
 * 렌더링하면 더 깨지므로 기호만 걷어 읽을 수 있는 일반 텍스트로 바꾼다.
 */
export function toReadableExcerpt(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !TABLE_DIVIDER.test(line))
    .map((line) => {
      let text = line.trim();
      if (text.startsWith("|")) {
        text = text
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean)
          .join(" · ");
      }
      return text
        .replace(/^#{1,6}\s+/, "")
        .replace(/^>\s?/, "")
        .replace(/^[-*+]\s+/, "• ")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1");
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
