import { useEffect, useState } from 'react';

/**
 * useScrollDirection 훅
 *
 * 스크롤 방향(위/아래)을 감지한다.
 * @returns {'up'|'down'} 현재 스크롤 방향
 */
export function useScrollDirection() {
  const [direction, setDirection] = useState('up');

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setDirection(currentY > lastY && currentY > 60 ? 'down' : 'up');
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return direction;
}
