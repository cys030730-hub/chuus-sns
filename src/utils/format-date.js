/**
 * ISO 날짜 문자열을 "n분 전", "n시간 전" 형태의 상대 시간으로 변환한다.
 * @param {string} isoString - ISO 8601 날짜 문자열
 * @returns {string} 상대 시간 텍스트
 */
export function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return new Date(isoString).toLocaleDateString('ko-KR');
}
