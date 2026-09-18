import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import AppLayout from '../components/common/app-layout';
import SecondhandCard from '../components/secondhand/secondhand-card';
import { useSecondhandList } from '../hooks/use-secondhand-list';

const STATUS_FILTERS = ['전체', '판매중', '거래중', '거래완료'];

/**
 * SecondhandListPage 컴포넌트
 *
 * 중고 화장품 판매 목록 화면. 상태·가격순 필터를 제공한다.
 *
 * Example usage:
 * <SecondhandListPage />
 */
export default function SecondhandListPage() {
  const [statusFilter, setStatusFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');
  const { items, isLoading, hasMore, loadMore } = useSecondhandList({ statusFilter, sortBy });
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { threshold: 0.5 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, hasMore]);

  return (
    <AppLayout>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        중고거래
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup value={statusFilter} exclusive onChange={(_event, value) => value && setStatusFilter(value)} size="small">
          {STATUS_FILTERS.map((option) => (
            <ToggleButton key={option} value={option}>
              {option}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <ToggleButtonGroup value={sortBy} exclusive onChange={(_event, value) => value && setSortBy(value)} size="small" sx={{ mb: 2 }}>
        <ToggleButton value="latest">최신순</ToggleButton>
        <ToggleButton value="price_low">낮은 가격순</ToggleButton>
        <ToggleButton value="price_high">높은 가격순</ToggleButton>
      </ToggleButtonGroup>

      {items.length === 0 && !isLoading && (
        <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
          등록된 중고거래 게시물이 없어요.
        </Typography>
      )}

      {items.map((item) => (
        <SecondhandCard key={item.id} item={item} />
      ))}

      <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        {isLoading && <CircularProgress size={24} color="primary" />}
      </Box>
    </AppLayout>
  );
}
