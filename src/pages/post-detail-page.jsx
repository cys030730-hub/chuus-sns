import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import AppLayout from '../components/common/app-layout';
import CommentItem from '../components/post/comment-item';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';
import { formatRelativeTime } from '../utils/format-date';

/**
 * PostDetailPage 컴포넌트
 *
 * 게시물 상세 화면. 좋아요/스크랩/댓글/신고와 중고거래 문의를 처리한다.
 *
 * Example usage:
 * <PostDetailPage />
 */
export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [post, setPost] = useState(null);
  const [secondhandItem, setSecondhandItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const loadPost = useCallback(async () => {
    setIsLoading(true);
    const { data: postData } = await supabase
      .from('cu_posts')
      .select('*, cu_profiles(id, username, display_name, avatar_url)')
      .eq('id', postId)
      .maybeSingle();
    setPost(postData);

    if (postData?.is_secondhand) {
      const { data: item } = await supabase.from('cu_secondhand_items').select('*').eq('post_id', postId).maybeSingle();
      setSecondhandItem(item);
    }

    const { data: commentData } = await supabase
      .from('cu_comments')
      .select('*, cu_profiles(id, username, display_name, avatar_url)')
      .eq('post_id', postId)
      .eq('status', 'visible')
      .order('created_at', { ascending: true });
    setComments(commentData ?? []);

    if (profile?.id) {
      const { data: like } = await supabase.from('cu_likes').select('id').eq('post_id', postId).eq('user_id', profile.id).maybeSingle();
      setIsLiked(Boolean(like));
      const { data: scrap } = await supabase.from('cu_scraps').select('id').eq('post_id', postId).eq('user_id', profile.id).maybeSingle();
      setIsScraped(Boolean(scrap));
    }

    setIsLoading(false);
  }, [postId, profile?.id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const toggleLike = async () => {
    if (!profile?.id || !post) return;
    if (isLiked) {
      await supabase.from('cu_likes').delete().eq('post_id', post.id).eq('user_id', profile.id);
      setPost((prev) => ({ ...prev, likes_count: Math.max(0, prev.likes_count - 1) }));
    } else {
      await supabase.from('cu_likes').insert({ post_id: post.id, user_id: profile.id });
      setPost((prev) => ({ ...prev, likes_count: prev.likes_count + 1 }));
    }
    setIsLiked((prev) => !prev);
  };

  const toggleScrap = async () => {
    if (!profile?.id || !post) return;
    if (isScraped) {
      await supabase.from('cu_scraps').delete().eq('post_id', post.id).eq('user_id', profile.id);
    } else {
      await supabase.from('cu_scraps').insert({ post_id: post.id, user_id: profile.id });
    }
    setIsScraped((prev) => !prev);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post?.caption, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || !profile?.id) return;

    const { data } = await supabase
      .from('cu_comments')
      .insert({ post_id: post.id, user_id: profile.id, content: commentText.trim() })
      .select('*, cu_profiles(id, username, display_name, avatar_url)')
      .single();

    if (data) {
      setComments((prev) => [...prev, data]);
      setPost((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
      setCommentText('');
    }
  };

  const handleReport = async () => {
    setMenuAnchor(null);
    if (!profile?.id || !post) return;
    await supabase.from('cu_reports').insert({ reporter_id: profile.id, target_type: 'post', target_id: post.id, reason: '부적절한 게시물' });
  };

  const handleStartChat = async () => {
    if (!profile?.id || !post) return;
    const { data: existingRoom } = await supabase
      .from('cu_chat_rooms')
      .select('id')
      .eq('post_id', post.id)
      .eq('buyer_id', profile.id)
      .maybeSingle();

    if (existingRoom) {
      navigate(`/chat/${existingRoom.id}`);
      return;
    }

    const { data: newRoom } = await supabase
      .from('cu_chat_rooms')
      .insert({ post_id: post.id, buyer_id: profile.id, seller_id: post.user_id })
      .select('id')
      .single();

    if (newRoom) navigate(`/chat/${newRoom.id}`);
  };

  if (isLoading || !post) {
    return (
      <AppLayout hasFab={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      </AppLayout>
    );
  }

  const isOwner = profile?.id === post.user_id;

  return (
    <AppLayout hasFab={false}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar src={post.cu_profiles?.avatar_url} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography fontWeight={700}>{post.cu_profiles?.display_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatRelativeTime(post.created_at)}
          </Typography>
        </Box>
        {post.is_secondhand && <Chip label="중고판매" color="primary" size="small" />}
        <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)} aria-label="더보기">
          <MoreVertRoundedIcon />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          {!isOwner && <MenuItem onClick={handleReport}>신고하기</MenuItem>}
          {isOwner && <MenuItem onClick={() => setMenuAnchor(null)}>수정 (준비중)</MenuItem>}
        </Menu>
      </Box>

      {post.image_url && (
        <Box
          component="img"
          src={post.image_url}
          alt={post.caption}
          sx={{ width: '100%', borderRadius: 3, aspectRatio: '1 / 1', objectFit: 'cover', mb: 2 }}
        />
      )}

      {post.rating ? <Rating value={post.rating} readOnly sx={{ mb: 1 }} /> : null}
      <Typography variant="h6" fontWeight={700}>
        {post.caption}
      </Typography>
      <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{post.content}</Typography>

      {post.is_secondhand && secondhandItem && (
        <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: 'primary.light' }}>
          <Typography variant="h6" fontWeight={800} color="primary.dark">
            {secondhandItem.price.toLocaleString()}원
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            상품 상태: {secondhandItem.condition} · {secondhandItem.status}
          </Typography>
          {!isOwner && (
            <Button
              variant="contained"
              startIcon={<ChatBubbleOutlineRoundedIcon />}
              onClick={handleStartChat}
              sx={{ borderRadius: 999 }}
            >
              채팅으로 문의하기
            </Button>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
        <IconButton onClick={toggleLike} aria-label="좋아요">
          {isLiked ? <FavoriteRoundedIcon color="primary" /> : <FavoriteBorderRoundedIcon />}
        </IconButton>
        <Typography variant="body2">{post.likes_count}</Typography>

        <IconButton onClick={handleShare} aria-label="공유">
          <ShareRoundedIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton onClick={toggleScrap} aria-label="스크랩">
          {isScraped ? <BookmarkRoundedIcon color="primary" /> : <BookmarkBorderRoundedIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        댓글 {post.comments_count}
      </Typography>

      {comments
        .filter((comment) => !comment.parent_id)
        .map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={comments.filter((reply) => reply.parent_id === comment.id)}
            isAuthor={comment.user_id === post.user_id}
          />
        ))}

      <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="댓글을 입력하세요"
          fullWidth
          size="small"
        />
        <Button type="submit" variant="contained" sx={{ borderRadius: 999 }}>
          등록
        </Button>
      </Box>
    </AppLayout>
  );
}
