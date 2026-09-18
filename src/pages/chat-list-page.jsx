import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import AppLayout from '../components/common/app-layout';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';
import { formatRelativeTime } from '../utils/format-date';

/**
 * ChatListPage 컴포넌트
 *
 * 내가 참여 중인 중고거래 채팅방 목록을 보여준다.
 *
 * Example usage:
 * <ChatListPage />
 */
export default function ChatListPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('cu_chat_rooms')
      .select('*, cu_posts(caption, image_url), buyer:buyer_id(display_name, avatar_url), seller:seller_id(display_name, avatar_url)')
      .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRooms(data ?? []);
        setIsLoading(false);
      });
  }, [profile?.id]);

  if (isLoading) {
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
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        채팅
      </Typography>

      {rooms.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
          진행 중인 채팅이 없어요.
        </Typography>
      )}

      {rooms.map((room) => {
        const isBuyer = room.buyer_id === profile.id;
        const other = isBuyer ? room.seller : room.buyer;
        return (
          <Box
            key={room.id}
            onClick={() => navigate(`/chat/${room.id}`)}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
          >
            <Avatar src={other?.avatar_url} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>
                {other?.display_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {room.cu_posts?.caption}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(room.created_at)}
            </Typography>
          </Box>
        );
      })}
    </AppLayout>
  );
}
