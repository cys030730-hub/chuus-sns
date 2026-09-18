import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';

/**
 * ChatRoomPage 컴포넌트
 *
 * 1:1 중고거래 문의 채팅방. 실시간 메시지 수신을 지원한다.
 *
 * Example usage:
 * <ChatRoomPage />
 */
export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    supabase
      .from('cu_chat_rooms')
      .select('*, cu_posts(caption, cu_secondhand_items(status))')
      .eq('id', roomId)
      .maybeSingle()
      .then(({ data }) => setRoom(data));

    supabase
      .from('cu_chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`chat_room_${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cu_chat_messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!text.trim() || !profile?.id) return;
    await supabase.from('cu_chat_messages').insert({ room_id: roomId, sender_id: profile.id, message: text.trim() });
    setText('');
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton onClick={() => navigate('/chat')} aria-label="뒤로가기">
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography fontWeight={700} sx={{ flexGrow: 1 }} noWrap>
          {room?.cu_posts?.caption}
        </Typography>
        {room?.cu_posts?.cu_secondhand_items && (
          <Chip label={room.cu_posts.cu_secondhand_items.status} size="small" color="primary" />
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((message) => {
          const isMine = message.sender_id === profile?.id;
          return (
            <Box key={message.id} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <Box
                sx={{
                  maxWidth: '70%',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  bgcolor: isMine ? 'primary.main' : 'grey.100',
                  color: isMine ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body2">{message.message}</Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1, p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <TextField value={text} onChange={(event) => setText(event.target.value)} placeholder="메시지를 입력하세요" fullWidth size="small" />
        <IconButton type="submit" color="primary" aria-label="전송">
          <SendRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
