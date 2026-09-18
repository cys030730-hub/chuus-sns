import { Navigate } from 'react-router-dom';
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
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
