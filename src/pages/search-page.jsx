import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/post/post-card';
import SecondhandCard from '../components/secondhand/secondhand-card';
import { supabase } from '../lib/supabase';

const RECENT_KEY = 'chuus_recent_searches';
const POPULAR_KEYWORDS = ['수분크림', '선크림', '쿠션', '틴트', '토너패드', '클렌징오일'];

/**
 * SearchPage 컴포넌트
 *
 * 후기/중고거래 통합 검색과 최근 검색어, 인기 검색어를 제공한다.
 *
 * Example usage:
 * <SearchPage />
 */
export default function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [resultTab, setResultTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [secondhandItems, setSecondhandItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
    setRecentSearches(stored);
  }, []);

  const runSearch = async (term) => {
    if (!term.trim()) return;
    setIsLoading(true);
    setSubmittedKeyword(term);

    const nextRecent = [term, ...recentSearches.filter((item) => item !== term)].slice(0, 8);
    setRecentSearches(nextRecent);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent));

    const { data: postResults } = await supabase
      .from('cu_posts')
      .select('*, cu_profiles(username, display_name, avatar_url)')
      .eq('status', 'published')
      .or(`caption.ilike.%${term}%,content.ilike.%${term}%`)
      .order('created_at', { ascending: false });

    const { data: secondhandResults } = await supabase
      .from('cu_secondhand_items')
      .select('*, cu_posts!inner(*, cu_profiles(username, display_name, avatar_url))')
      .eq('cu_posts.status', 'published')
      .or(`caption.ilike.%${term}%,content.ilike.%${term}%`, { foreignTable: 'cu_posts' });

    setPosts(postResults ?? []);
    setSecondhandItems(secondhandResults ?? []);
    setIsLoading(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runSearch(keyword);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    window.localStorage.removeItem(RECENT_KEY);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', px: { xs: 2, md: 3 }, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ArrowBackRoundedIcon />
        </IconButton>
        <Paper component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 2, py: 0.5, borderRadius: 999 }}>
          <SearchRoundedIcon color="disabled" sx={{ mr: 1 }} />
          <InputBase
            autoFocus
            fullWidth
            placeholder="화장품, 브랜드, 후기 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </Paper>
      </Box>

      {!submittedKeyword && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              최근 검색어
            </Typography>
            {recentSearches.length > 0 && (
              <Typography variant="caption" color="text.secondary" onClick={clearRecent} sx={{ cursor: 'pointer' }}>
                전체 삭제
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {recentSearches.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                최근 검색어가 없습니다.
              </Typography>
            )}
            {recentSearches.map((term) => (
              <Chip
                key={term}
                label={term}
                onClick={() => runSearch(term)}
                onDelete={() => {
                  const next = recentSearches.filter((item) => item !== term);
                  setRecentSearches(next);
                  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
                }}
                deleteIcon={<CloseRoundedIcon />}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            실시간 인기 검색어
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {POPULAR_KEYWORDS.map((term, index) => (
              <Box key={term} onClick={() => runSearch(term)} sx={{ display: 'flex', gap: 1.5, cursor: 'pointer' }}>
                <Typography fontWeight={800} color="primary">
                  {index + 1}
                </Typography>
                <Typography>{term}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {submittedKeyword && (
        <Box>
          <Tabs value={resultTab} onChange={(_event, value) => setResultTab(value)} sx={{ mb: 2 }}>
            <Tab label={`후기 (${posts.length})`} />
            <Tab label={`중고거래 (${secondhandItems.length})`} />
          </Tabs>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} color="primary" />
            </Box>
          )}

          {!isLoading && resultTab === 0 && posts.map((post) => <PostCard key={post.id} post={post} />)}
          {!isLoading && resultTab === 1 && secondhandItems.map((item) => <SecondhandCard key={item.id} item={item} />)}

          {!isLoading && resultTab === 0 && posts.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
              검색 결과가 없습니다.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
