import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 10;

/**
 * useFeed 훅
 *
 * 피드 게시물을 무한 스크롤 방식으로 조회한다. 로그인한 사용자의 피부타입/퍼스널컬러와
 * 일치하는 게시물을 우선 정렬하고, 나머지는 최신순으로 정렬한다.
 *
 * @param {object} profile - 현재 로그인한 사용자의 프로필 (skin_type, personal_color 포함)
 * @returns {{ posts: Array, isLoading: boolean, hasMore: boolean, loadMore: function, refresh: function, likedIds: Set, scrapedIds: Set, toggleLike: function, toggleScrap: function }}
 */
export function useFeed(profile) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [likedIds, setLikedIds] = useState(new Set());
  const [scrapedIds, setScrapedIds] = useState(new Set());

  const fetchInteractionState = useCallback(async (postIds, userId) => {
    if (!userId || postIds.length === 0) return;
    const [{ data: likes }, { data: scraps }] = await Promise.all([
      supabase.from('cu_likes').select('post_id').eq('user_id', userId).in('post_id', postIds),
      supabase.from('cu_scraps').select('post_id').eq('user_id', userId).in('post_id', postIds),
    ]);
    setLikedIds((prev) => new Set([...prev, ...(likes ?? []).map((row) => row.post_id)]));
    setScrapedIds((prev) => new Set([...prev, ...(scraps ?? []).map((row) => row.post_id)]));
  }, []);

  const fetchPage = useCallback(
    async (pageIndex, replace) => {
      setIsLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('cu_posts')
        .select('*, cu_profiles(username, display_name, avatar_url)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        const sorted = profile
          ? [...data].sort((a, b) => {
              const scoreOf = (post) =>
                (post.skin_type === profile.skin_type ? 1 : 0) +
                (post.personal_color === profile.personal_color ? 1 : 0);
              return scoreOf(b) - scoreOf(a);
            })
          : data;

        setPosts((prev) => (replace ? sorted : [...prev, ...sorted]));
        setHasMore(data.length === PAGE_SIZE);
        fetchInteractionState(data.map((post) => post.id), profile?.id);
      }
      setIsLoading(false);
    },
    [profile, fetchInteractionState],
  );

  useEffect(() => {
    setPage(0);
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const loadMore = () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  };

  const refresh = () => {
    setPage(0);
    fetchPage(0, true);
  };

  const toggleLike = async (postId) => {
    if (!profile?.id) return;
    if (likedIds.has(postId)) {
      await supabase.from('cu_likes').delete().eq('post_id', postId).eq('user_id', profile.id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, likes_count: Math.max(0, (post.likes_count ?? 1) - 1) } : post)));
    } else {
      await supabase.from('cu_likes').insert({ post_id: postId, user_id: profile.id });
      setLikedIds((prev) => new Set(prev).add(postId));
      setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, likes_count: (post.likes_count ?? 0) + 1 } : post)));
    }
  };

  const toggleScrap = async (postId) => {
    if (!profile?.id) return;
    if (scrapedIds.has(postId)) {
      await supabase.from('cu_scraps').delete().eq('post_id', postId).eq('user_id', profile.id);
      setScrapedIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      await supabase.from('cu_scraps').insert({ post_id: postId, user_id: profile.id });
      setScrapedIds((prev) => new Set(prev).add(postId));
    }
  };

  return { posts, isLoading, hasMore, loadMore, refresh, likedIds, scrapedIds, toggleLike, toggleScrap };
}
