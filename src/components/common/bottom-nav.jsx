import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useScrollDirection } from '../../hooks/use-scroll-direction';

const NAV_ITEMS = [
  { label: '홈', path: '/', icon: <HomeRoundedIcon /> },
  { label: '게시판', path: '/posts', icon: <ArticleRoundedIcon /> },
  { label: '중고거래', path: '/secondhand', icon: <StorefrontRoundedIcon /> },
  { label: '마이페이지', path: '/mypage', icon: <PersonRoundedIcon /> },
];

/**
 * BottomNav 컴포넌트
 *
 * 하단 탭 네비게이션. 라우트 경로에 따라 활성 탭을 표시한다.
 *
 * Example usage:
 * <BottomNav />
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollDirection = useScrollDirection();
  const currentIndex = NAV_ITEMS.findIndex((item) => item.path === location.pathname);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        transform: scrollDirection === 'down' ? 'translateY(100%)' : 'translateY(0)',
        transition: 'transform 0.25s ease',
      }}
    >
      <BottomNavigation
        value={currentIndex === -1 ? 0 : currentIndex}
        onChange={(_event, newValue) => navigate(NAV_ITEMS[newValue].path)}
        showLabels
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} sx={{ minWidth: 0 }} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
