import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AppLayout from '../components/common/app-layout';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';
import { formatRelativeTime } from '../utils/format-date';

const TYPE_ICON = {
  like: <FavoriteRoundedIcon color="primary" />,
  comment: <ChatBubbleRoundedIcon color="primary" />,
  reply: <ChatBubbleRoundedIcon color="primary" />,
  chat: <ForumRoundedIcon color="primary" />,
};

const TYPE_TEXT = {
  like: '님이 회원님의 게시물을 좋아합니다',
  comment: '님이 댓글을 남겼습니다',
  reply: '님이 답글을 남겼습니다',
  chat: '님이 채팅 문의를 보냈습니다',
};

/**
 * NotificationsPage 컴포넌트
 *
 * 좋아요/댓글/거래 알림 목록을 보여주고 읽음 처리한다.
 *
 * Example usage:
 * <NotificationsPage />
 */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('cu_notifications')
      .select('*, source:source_user_id(display_name, avatar_url)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNotifications(data ?? []);
        setIsLoading(false);
        const unreadIds = (data ?? []).filter((item) => !item.is_read).map((item) => item.id);
        if (unreadIds.length > 0) {
          supabase.from('cu_notifications').update({ is_read: true }).in('id', unreadIds).then(() => {});
        }
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
        알림
      </Typography>

      {notifications.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
          알림이 없습니다.
        </Typography>
      )}

      {notifications.map((item) => (
        <Box
          key={item.id}
          onClick={() => item.post_id && navigate(`/posts/${item.post_id}`)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            cursor: item.post_id ? 'pointer' : 'default',
            bgcolor: item.is_read ? 'transparent' : 'primary.light',
          }}
        >
          <Avatar src={item.source?.avatar_url} />
          {TYPE_ICON[item.type]}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2">
              <strong>{item.source?.display_name}</strong>
              {TYPE_TEXT[item.type]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(item.created_at)}
            </Typography>
          </Box>
        </Box>
      ))}
    </AppLayout>
  );
}
