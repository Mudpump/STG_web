/**
 * KST(UTC+9) 기준 날짜 유틸리티
 * 
 * JavaScript의 toISOString()은 항상 UTC를 반환하므로,
 * 한국 시간 기준으로 날짜/요일을 구할 때는 +9h 오프셋을 적용한 뒤
 * UTC 함수로 계산해야 합니다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST(UTC+9) 기준 현재 Date 객체 반환 (UTC 시각에 +9시간 오프셋 적용) */
export const getKSTNow = (): Date => {
  return new Date(Date.now() + KST_OFFSET_MS);
};

/** KST 기준 오늘 날짜를 YYYY-MM-DD로 반환 */
export const getKSTDateString = (date?: Date): string => {
  const d = date || getKSTNow();
  return d.toISOString().split('T')[0];
};

/** KST 기준 이번 주 월요일 Date 반환 (시각은 KST 00:00) */
export const getKSTMonday = (): Date => {
  const kst = getKSTNow();
  const day = kst.getUTCDay(); // +9h 했으므로 getUTCDay()가 KST 요일
  const diff = day === 0 ? 6 : day - 1; // 일요일=6, 월요일=0
  kst.setUTCDate(kst.getUTCDate() - diff);
  kst.setUTCHours(0, 0, 0, 0);
  return kst;
};

/** KST 기준 오늘 요일 인덱스 (0=월, 6=일) */
export const getKSTDayOfWeek = (): number => {
  const kst = getKSTNow();
  const day = kst.getUTCDay();
  return day === 0 ? 6 : day - 1;
};

/** KST 기준 특정 Date의 YYYY-MM-DD 반환 (이미 +9h 적용된 Date 전용) */
export const toKSTDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
