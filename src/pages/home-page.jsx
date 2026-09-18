import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AppLayout from '../components/common/app-layout';
import PostCard from '../components/post/post-card';
import { useAuth } from '../hooks/use-auth';
import { useFeed } from '../hooks/use-feed';
import { usePullToRefresh } from '../hooks/use-pull-to-refresh';

const CATEGORIES = ['전체', '스킨케어', '메이크업', '헤어', '향수'];

/**
 * HomePage 컴포넌트
 *
 * 메인 피드 화면. 무한 스크롤과 카테고리 필터, 검색 진입점을 제공한다.
 *
 * Example usage:
 * <HomePage />
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { posts, isLoading, hasMore, loadMore, refresh, likedIds, scrapedIds, toggleLike, toggleScrap } = useFeed(profile);
  const [category, setCategory] = useState('전체');
  const sentinelRef = useRef(null);
  const { isPulling } = usePullToRefresh(refresh);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.5 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, hasMore]);

  const visiblePosts = category === '전체' ? posts : posts.filter((post) => post.category === category);

  return (
    <AppLayout>
      {isPulling && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={20} color="primary" />
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Paper
          onClick={() => navigate('/search')}
          sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 2, py: 0.5, borderRadius: 999, cursor: 'pointer' }}
        >
          <SearchRoundedIcon color="disabled" sx={{ mr: 1 }} />
          <InputBase placeholder="화장품, 브랜드, 후기 검색" fullWidth readOnly />
        </Paper>
        <IconButton onClick={() => navigate('/notifications')} aria-label="알림">
          <NotificationsNoneRoundedIcon />
        </IconButton>
      </Box>

      <Tabs
        value={category}
        onChange={(_event, value) => setCategory(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, minHeight: 36 }}
      >
        {CATEGORIES.map((item) => (
          <Tab key={item} value={item} label={item} sx={{ minHeight: 36, py: 0.5 }} />
        ))}
      </Tabs>

      {visiblePosts.length === 0 && !isLoading && (
        <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
          아직 게시물이 없어요. 첫 후기를 남겨보세요!
        </Typography>
      )}

      {visiblePosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLiked={likedIds.has(post.id)}
          isScraped={scrapedIds.has(post.id)}
          onToggleLike={toggleLike}
          onToggleScrap={toggleScrap}
        />
      ))}

      <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        {isLoading && <CircularProgress size={24} color="primary" />}
      </Box>

      {!hasMore && posts.length > 0 && (
        <Typography color="text.secondary" align="center" variant="body2" sx={{ py: 2 }} onClick={refresh}>
          마지막 게시물이에요
        </Typography>
      )}
    </AppLayout>
  );
}
