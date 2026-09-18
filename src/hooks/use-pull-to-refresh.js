import { useEffect, useState } from 'react';

const PULL_THRESHOLD = 70;

/**
 * usePullToRefresh 훅
 *
 * 화면 최상단에서 아래로 당기는 제스처를 감지해 새로고침 콜백을 실행한다.
 *
 * @param {function} onRefresh - 새로고침 시 실행할 함수
 * @returns {{ isPulling: boolean }}
 */
export function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    let startY = 0;
    let tracking = false;

    const handleTouchStart = (event) => {
      if (window.scrollY === 0) {
        startY = event.touches[0].clientY;
        tracking = true;
      }
    };

    const handleTouchMove = (event) => {
      if (!tracking) return;
      const deltaY = event.touches[0].clientY - startY;
      if (deltaY > PULL_THRESHOLD) {
        setIsPulling(true);
      }
    };

    const handleTouchEnd = () => {
      if (tracking && isPulling) {
        onRefresh?.();
      }
      tracking = false;
      setIsPulling(false);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefresh, isPulling]);

  return { isPulling };
}
