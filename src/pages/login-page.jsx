import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { supabase } from '../lib/supabase';

/**
 * LoginPage 컴포넌트
 *
 * 이메일/비밀번호 로그인 화면.
 *
 * Example usage:
 * <LoginPage />
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);
    if (error) {
      setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    navigate(location.state?.from ?? '/', { replace: true });
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary" align="center" sx={{ mb: 4 }}>
          Chuus
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {location.state?.message && <Alert severity="info">{location.state.message}</Alert>}

          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ borderRadius: 999 }}>
            로그인
          </Button>
        </Box>

        <Typography align="center" sx={{ mt: 3 }}>
          아직 계정이 없으신가요?{' '}
          <Link component={RouterLink} to="/signup">
            회원가입
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
