import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 10;

/**
 * usePostList 훅
 *
 * 카테고리/정렬 조건에 따라 게시물 목록을 무한 스크롤로 조회한다.
 *
 * @param {{ category: string, sortBy: 'latest'|'popular', onlySecondhand: boolean }} options
 * @returns {{ posts: Array, isLoading: boolean, hasMore: boolean, loadMore: function }}
 */
export function usePostList({ category, sortBy, onlySecondhand = false }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPage = useCallback(
    async (pageIndex, replace) => {
      setIsLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('cu_posts')
        .select('*, cu_profiles(username, display_name, avatar_url)')
        .eq('status', 'published')
        .range(from, to);

      if (onlySecondhand) query = query.eq('is_secondhand', true);
      if (category && category !== '전체') query = query.eq('category', category);
      query = query.order(sortBy === 'popular' ? 'likes_count' : 'created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        setPosts((prev) => (replace ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_SIZE);
      }
      setIsLoading(false);
    },
    [category, sortBy, onlySecondhand],
  );

  useEffect(() => {
    setPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  };

  return { posts, isLoading, hasMore, loadMore };
}
