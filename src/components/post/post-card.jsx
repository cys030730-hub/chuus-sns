import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { formatRelativeTime } from '../../utils/format-date';

/**
 * PostCard 컴포넌트
 *
 * Props:
 * @param {object} post - 게시물 데이터 (cu_posts + 작성자 정보) [Required]
 * @param {boolean} isLiked - 현재 사용자의 좋아요 여부 [Optional, 기본값: false]
 * @param {boolean} isScraped - 현재 사용자의 스크랩 여부 [Optional, 기본값: false]
 * @param {function} onToggleLike - 좋아요 토글 시 실행할 함수(postId) [Optional]
 * @param {function} onToggleScrap - 스크랩 토글 시 실행할 함수(postId) [Optional]
 *
 * Example usage:
 * <PostCard post={post} isLiked onToggleLike={handleToggleLike} />
 */
export default function PostCard({ post, isLiked = false, isScraped = false, onToggleLike, onToggleScrap }) {
  const navigate = useNavigate();
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleClick = () => {
    if (!isLiked) {
      onToggleLike?.(post.id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 700);
  };

  return (
    <Card sx={{ borderRadius: 4, mb: 2, overflow: 'hidden' }}>
      <CardHeader
        avatar={<Avatar src={post.cu_profiles?.avatar_url} alt={post.cu_profiles?.display_name} />}
        title={post.cu_profiles?.display_name ?? '알 수 없음'}
        subheader={formatRelativeTime(post.created_at)}
        action={post.is_secondhand ? <Chip label="중고판매" color="primary" size="small" sx={{ mt: 1, mr: 1 }} /> : null}
        onClick={() => navigate(`/posts/${post.id}`)}
        sx={{ cursor: 'pointer' }}
      />

      {post.image_url && (
        <Box sx={{ position: 'relative' }} onDoubleClick={handleDoubleClick}>
          <CardMedia
            component="img"
            image={post.image_url}
            alt={post.caption}
            sx={{ aspectRatio: '1 / 1', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => navigate(`/posts/${post.id}`)}
          />
          {showHeart && (
            <FavoriteRoundedIcon
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1.2)',
                fontSize: 96,
                color: 'rgba(255,255,255,0.9)',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
                pointerEvents: 'none',
              }}
            />
          )}
        </Box>
      )}

      <CardContent sx={{ cursor: 'pointer' }} onClick={() => navigate(`/posts/${post.id}`)}>
        {post.rating ? <Rating value={post.rating} readOnly size="small" sx={{ mb: 1 }} /> : null}
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {post.caption}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {post.content}
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton onClick={() => onToggleLike?.(post.id)} aria-label="좋아요">
          {isLiked ? <FavoriteRoundedIcon color="primary" /> : <FavoriteBorderRoundedIcon />}
        </IconButton>
        <Typography variant="body2" color="text.secondary">{post.likes_count ?? 0}</Typography>

        <IconButton onClick={() => navigate(`/posts/${post.id}`)} aria-label="댓글" sx={{ ml: 1 }}>
          <ChatBubbleOutlineRoundedIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">{post.comments_count ?? 0}</Typography>

        <IconButton aria-label="공유" sx={{ ml: 1 }}>
          <ShareRoundedIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton onClick={() => onToggleScrap?.(post.id)} aria-label="스크랩">
          {isScraped ? <BookmarkRoundedIcon color="primary" /> : <BookmarkBorderRoundedIcon />}
        </IconButton>
      </CardActions>
    </Card>
  );
}
