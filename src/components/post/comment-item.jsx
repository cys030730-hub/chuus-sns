import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { formatRelativeTime } from '../../utils/format-date';

/**
 * CommentItem 컴포넌트
 *
 * Props:
 * @param {object} comment - 댓글 데이터 [Required]
 * @param {Array} replies - 이 댓글에 달린 답글 목록 [Optional, 기본값: []]
 * @param {boolean} isAuthor - 게시물 작성자 본인 댓글 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <CommentItem comment={comment} replies={replies} isAuthor />
 */
export default function CommentItem({ comment, replies = [], isAuthor = false }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar src={comment.cu_profiles?.avatar_url} sx={{ width: 32, height: 32 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={700}>
              {comment.cu_profiles?.display_name}
            </Typography>
            {isAuthor && <Chip label="작성자" size="small" color="primary" variant="outlined" />}
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(comment.created_at)}
            </Typography>
          </Box>
          <Typography variant="body2">{comment.content}</Typography>
        </Box>
      </Box>

      {replies.length > 0 && (
        <Box sx={{ pl: 5, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {replies.map((reply) => (
            <Box key={reply.id} sx={{ display: 'flex', gap: 1.5 }}>
              <Avatar src={reply.cu_profiles?.avatar_url} sx={{ width: 28, height: 28 }} />
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  {reply.cu_profiles?.display_name}
                </Typography>
                <Typography variant="body2">{reply.content}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
