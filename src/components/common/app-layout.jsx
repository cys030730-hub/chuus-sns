import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useNavigate } from 'react-router-dom';
import BottomNav from './bottom-nav';

/**
 * AppLayout 컴포넌트
 *
 * Props:
 * @param {node} children - 페이지 컨텐츠 [Required]
 * @param {boolean} hasFab - 글쓰기 플로팅 버튼 표시 여부 [Optional, 기본값: true]
 *
 * Example usage:
 * <AppLayout><HomePage /></AppLayout>
 */
export default function AppLayout({ children, hasFab = true }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 8 }}>
      <Box component="main" sx={{ maxWidth: 600, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        {children}
      </Box>

      {hasFab && (
        <Fab
          color="primary"
          onClick={() => navigate('/posts/new')}
          sx={{ position: 'fixed', bottom: 72, right: { xs: 16, md: 'calc(50% - 284px)' } }}
        >
          <EditRoundedIcon />
        </Fab>
      )}

      <BottomNav />
    </Box>
  );
}
