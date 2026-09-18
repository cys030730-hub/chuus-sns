import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from '../../hooks/use-auth';

/**
 * ProtectedRoute 컴포넌트
 *
 * Props:
 * @param {node} children - 인증된 사용자에게만 보여줄 컨텐츠 [Required]
 *
 * Example usage:
 * <ProtectedRoute><HomePage /></ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { session, isLoading, profile, isProfileLoading } = useAuth();
  const location = useLocation();

  if (isLoading || (session && isProfileLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}
