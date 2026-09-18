import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 10;

/**
 * useSecondhandList 훅
 *
 * 중고판매 게시물 목록을 조회한다.
 *
 * @param {{ statusFilter: string, sortBy: 'latest'|'price_low'|'price_high' }} options
 * @returns {{ items: Array, isLoading: boolean, hasMore: boolean, loadMore: function }}
 */
export function useSecondhandList({ statusFilter = '전체', sortBy = 'latest' } = {}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPage = useCallback(
    async (pageIndex, replace) => {
      setIsLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('cu_secondhand_items')
        .select('*, cu_posts!inner(*, cu_profiles(username, display_name, avatar_url))')
        .eq('cu_posts.status', 'published')
        .range(from, to);

      if (statusFilter !== '전체') query = query.eq('status', statusFilter);
      if (sortBy === 'price_low') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_high') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        setItems((prev) => (replace ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_SIZE);
      }
      setIsLoading(false);
    },
    [statusFilter, sortBy],
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

  return { items, isLoading, hasMore, loadMore };
}
