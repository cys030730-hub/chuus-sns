import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import AppLayout from '../components/common/app-layout';
import PostCard from '../components/post/post-card';
import { useAuth } from '../hooks/use-auth';
import { usePostList } from '../hooks/use-post-list';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['전체', '스킨케어', '메이크업', '헤어', '향수'];

/**
 * PostListPage 컴포넌트
 *
 * 카테고리·정렬 조건으로 게시물을 탐색하는 목록 화면.
 *
 * Example usage:
 * <PostListPage />
 */
export default function PostListPage() {
  const { profile } = useAuth();
  const [category, setCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');
  const { posts, isLoading, hasMore, loadMore } = usePostList({ category, sortBy });
  const [likedIds, setLikedIds] = useState(new Set());
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!profile?.id || posts.length === 0) return;
    supabase
      .from('cu_likes')
      .select('post_id')
      .eq('user_id', profile.id)
      .in('post_id', posts.map((post) => post.id))
      .then(({ data }) => setLikedIds((prev) => new Set([...prev, ...(data ?? []).map((row) => row.post_id)])));
  }, [posts, profile?.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { threshold: 0.5 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, hasMore]);

  const toggleLike = async (postId) => {
    if (!profile?.id) return;
    if (likedIds.has(postId)) {
      await supabase.from('cu_likes').delete().eq('post_id', postId).eq('user_id', profile.id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      await supabase.from('cu_likes').insert({ post_id: postId, user_id: profile.id });
      setLikedIds((prev) => new Set(prev).add(postId));
    }
  };

  return (
    <AppLayout>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        게시판
      </Typography>

      <Tabs value={category} onChange={(_event, value) => setCategory(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 1 }}>
        {CATEGORIES.map((item) => (
          <Tab key={item} value={item} label={item} sx={{ minHeight: 36, py: 0.5 }} />
        ))}
      </Tabs>

      <ToggleButtonGroup value={sortBy} exclusive onChange={(_event, value) => value && setSortBy(value)} size="small" sx={{ mb: 2 }}>
        <ToggleButton value="latest">최신순</ToggleButton>
        <ToggleButton value="popular">인기순</ToggleButton>
      </ToggleButtonGroup>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} isLiked={likedIds.has(post.id)} onToggleLike={toggleLike} />
      ))}

      <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        {isLoading && <CircularProgress size={24} color="primary" />}
      </Box>
    </AppLayout>
  );
}
