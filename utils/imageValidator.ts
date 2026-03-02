
/**
 * 이미지 URL이 유효한지(로딩 가능한지) 확인하는 함수
 * @param url 확인할 이미지 URL
 * @param timeout 타임아웃 (기본값 3000ms)
 * @returns 로딩 성공 시 true, 실패 시 false
 */
export const checkImageAvailability = (url: string, timeout = 3000): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    let timer: any;

    const clear = () => {
        if (timer) clearTimeout(timer);
        img.onload = null;
        img.onerror = null;
    };

    img.onload = () => {
        clear();
        // 이미지가 로드되었으나 너비가 0이거나 너무 작은 경우(깨진 이미지 아이콘 등) 필터링
        if (img.naturalWidth > 10) {
            resolve(true);
        } else {
            resolve(false);
        }
    };
    
    img.onerror = () => {
        clear();
        resolve(false);
    };

    // 타임아웃 설정: 너무 오래 걸리면 실패 처리
    timer = setTimeout(() => {
        img.src = ""; // 로딩 취소 시도
        clear();
        resolve(false);
    }, timeout);

    img.src = url;
  });
};
