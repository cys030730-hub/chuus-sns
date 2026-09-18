import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AppLayout from '../components/common/app-layout';
import PostCard from '../components/post/post-card';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';

const SKIN_TYPES = ['지성', '건성', '복합성', '민감성'];
const PERSONAL_COLORS = ['봄웜', '여름쿨', '가을웜', '겨울쿨'];
const TABS = ['프로필', '내가 쓴 글', '좋아요한 글', '거래내역'];

/**
 * MyPage 컴포넌트
 *
 * 프로필 조회/수정, 활동 내역, 거래 내역을 탭으로 보여준다.
 *
 * Example usage:
 * <MyPage />
 */
export default function MyPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState(0);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    if (!profile?.id) return;
    setIsLoading(true);

    Promise.all([
      supabase.from('cu_posts').select('*, cu_profiles(username, display_name, avatar_url)').eq('user_id', profile.id).order('created_at', { ascending: false }),
      supabase
        .from('cu_scraps')
        .select('cu_posts(*, cu_profiles(username, display_name, avatar_url))')
        .eq('user_id', profile.id),
      supabase
        .from('cu_likes')
        .select('cu_posts(*, cu_profiles(username, display_name, avatar_url))')
        .eq('user_id', profile.id),
      supabase
        .from('cu_transactions')
        .select('*, cu_secondhand_items(price, condition, cu_posts(caption, image_url))')
        .eq('buyer_id', profile.id),
    ]).then(([postsRes, , likesRes, transactionsRes]) => {
      setMyPosts(postsRes.data ?? []);
      setLikedPosts((likesRes.data ?? []).map((row) => row.cu_posts).filter(Boolean));
      setPurchases(transactionsRes.data ?? []);
      setIsLoading(false);
    });
  }, [profile?.id]);

  const openEdit = () => {
    setEditForm({
      display_name: profile.display_name,
      bio: profile.bio ?? '',
      skin_type: profile.skin_type ?? '',
      personal_color: profile.personal_color ?? '',
      region: profile.region ?? '',
      address: profile.address ?? '',
    });
    setIsEditOpen(true);
  };

  const handleSaveProfile = async () => {
    await supabase.from('cu_profiles').update(editForm).eq('id', profile.id);
    await refreshProfile();
    setIsEditOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  if (!profile) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout hasFab={false}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar src={profile.avatar_url} sx={{ width: 64, height: 64 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={800}>
            {profile.display_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{profile.username}
          </Typography>
        </Box>
        <Button onClick={handleLogout} startIcon={<LogoutRoundedIcon />} color="secondary">
          로그아웃
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {tab === 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            소개
          </Typography>
          <Typography sx={{ mb: 2 }}>{profile.bio || '자기소개가 없습니다.'}</Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                피부타입
              </Typography>
              <Typography>{profile.skin_type || '미설정'}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                퍼스널컬러
              </Typography>
              <Typography>{profile.personal_color || '미설정'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                지역
              </Typography>
              <Typography>{profile.region || '미설정'}</Typography>
            </Grid>
          </Grid>

          <Button variant="contained" onClick={openEdit} sx={{ borderRadius: 999 }}>
            프로필 수정
          </Button>
        </Box>
      )}

      {tab === 1 && (isLoading ? <CircularProgress size={24} /> : myPosts.map((post) => <PostCard key={post.id} post={post} />))}
      {tab === 2 && (isLoading ? <CircularProgress size={24} /> : likedPosts.map((post) => <PostCard key={post.id} post={post} />))}

      {tab === 3 && (
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            구매 내역
          </Typography>
          {purchases.length === 0 && (
            <Typography color="text.secondary" variant="body2">
              구매 내역이 없습니다.
            </Typography>
          )}
          {purchases.map((transaction) => (
            <Box key={transaction.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2">{transaction.cu_secondhand_items?.cu_posts?.caption}</Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.status}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>프로필 수정</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {editForm && (
            <>
              <TextField
                label="닉네임"
                value={editForm.display_name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, display_name: event.target.value }))}
                fullWidth
              />
              <TextField
                label="자기소개"
                value={editForm.bio}
                onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                select
                label="피부타입"
                value={editForm.skin_type}
                onChange={(event) => setEditForm((prev) => ({ ...prev, skin_type: event.target.value }))}
                fullWidth
              >
                {SKIN_TYPES.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="퍼스널컬러"
                value={editForm.personal_color}
                onChange={(event) => setEditForm((prev) => ({ ...prev, personal_color: event.target.value }))}
                fullWidth
              >
                {PERSONAL_COLORS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="지역"
                value={editForm.region}
                onChange={(event) => setEditForm((prev) => ({ ...prev, region: event.target.value }))}
                fullWidth
              />
              <TextField
                label="상세 주소"
                value={editForm.address}
                onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveProfile}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
