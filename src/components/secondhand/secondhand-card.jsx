import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

/**
 * SecondhandCard 컴포넌트
 *
 * Props:
 * @param {object} item - cu_secondhand_items 레코드 (cu_posts 조인 포함) [Required]
 *
 * Example usage:
 * <SecondhandCard item={item} />
 */
export default function SecondhandCard({ item }) {
  const navigate = useNavigate();
  const post = item.cu_posts;

  return (
    <Card
      onClick={() => navigate(`/posts/${post.id}`)}
      sx={{ borderRadius: 4, mb: 2, cursor: 'pointer', overflow: 'hidden' }}
    >
      {post.image_url && (
        <CardMedia component="img" image={post.image_url} alt={post.caption} sx={{ aspectRatio: '4 / 3', objectFit: 'cover' }} />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip label={item.status} size="small" color={item.status === '판매중' ? 'primary' : 'default'} />
          <Typography variant="caption" color="text.secondary">
            {item.condition}
          </Typography>
        </Box>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {post.caption}
        </Typography>
        <Typography variant="h6" fontWeight={800} color="primary.dark">
          {item.price.toLocaleString()}원
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {post.cu_profiles?.display_name}
        </Typography>
      </CardContent>
    </Card>
  );
}
