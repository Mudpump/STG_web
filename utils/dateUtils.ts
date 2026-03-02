
import { Timestamp } from 'firebase/firestore';

export function formatTimeAgo(timestamp: any): string {
  if (!timestamp) return '방금 전';

  let date: Date;

  try {
    // Handle Firestore Timestamp
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      // Handle serialized timestamp object (seconds/nanoseconds)
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      // Try parsing string or other formats
      const parsed = new Date(timestamp);
      if (isNaN(parsed.getTime())) return '방금 전';
      date = parsed;
    }
  } catch (e) {
    return '방금 전';
  }

  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // seconds

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`; // 7일 미만
  
  // 날짜 형식으로 반환 (예: 5월 24일)
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}
