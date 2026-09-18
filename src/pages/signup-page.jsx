import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import GoogleIcon from '@mui/icons-material/Google';
import { supabase } from '../lib/supabase';

const SKIN_TYPES = ['지성', '건성', '복합성', '민감성'];
const PERSONAL_COLORS = ['봄웜', '여름쿨', '가을웜', '겨울쿨'];

/**
 * SignupPage 컴포넌트
 *
 * 이메일 회원가입 화면. 닉네임, 피부타입/퍼스널컬러, 지역 정보를 함께 입력받는다.
 *
 * Example usage:
 * <SignupPage />
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
    displayName: '',
    skinType: '',
    personalColor: '',
    region: '',
    address: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (form.password !== form.passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);

    const pendingProfile = {
      username: form.username,
      display_name: form.displayName,
      skin_type: form.skinType || null,
      personal_color: form.personalColor || null,
      region: form.region || null,
      address: form.address || null,
    };
    window.localStorage.setItem('chuus_pending_profile', JSON.stringify(pendingProfile));

    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });

    setIsSubmitting(false);

    if (error) {
      window.localStorage.removeItem('chuus_pending_profile');
      setErrorMessage(error.message === 'User already registered' ? '이미 가입된 이메일입니다.' : '회원가입 중 오류가 발생했습니다.');
      return;
    }

    if (data.session) {
      navigate('/', { replace: true });
    } else {
      navigate('/login', { state: { message: '가입 확인 이메일을 보냈습니다. 인증 후 로그인해주세요.' } });
    }
  };

  const handleOAuth = (provider) => {
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary" align="center" sx={{ mb: 4 }}>
          회원가입
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField label="이메일" type="email" value={form.email} onChange={updateField('email')} required fullWidth />
          <TextField label="비밀번호" type="password" value={form.password} onChange={updateField('password')} required fullWidth helperText="6자 이상" />
          <TextField label="비밀번호 확인" type="password" value={form.passwordConfirm} onChange={updateField('passwordConfirm')} required fullWidth />
          <TextField label="닉네임" value={form.displayName} onChange={updateField('displayName')} required fullWidth />
          <TextField label="아이디 (username)" value={form.username} onChange={updateField('username')} required fullWidth helperText="다른 사람에게 @아이디로 표시됩니다" />

          <TextField select label="피부타입" value={form.skinType} onChange={updateField('skinType')} fullWidth>
            {SKIN_TYPES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="퍼스널컬러" value={form.personalColor} onChange={updateField('personalColor')} fullWidth>
            {PERSONAL_COLORS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="사는 지역" value={form.region} onChange={updateField('region')} fullWidth placeholder="예: 서울시 강남구" />
          <TextField label="상세 주소" value={form.address} onChange={updateField('address')} fullWidth helperText="중고 거래 시 사용됩니다" />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ borderRadius: 999 }}>
            가입하기
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>또는</Divider>

        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton onClick={() => handleOAuth('kakao')} sx={{ bgcolor: '#FEE500' }} aria-label="카카오로 계속하기">
            <ChatBubbleRoundedIcon />
          </IconButton>
          <IconButton onClick={() => handleOAuth('google')} sx={{ border: '1px solid', borderColor: 'divider' }} aria-label="구글로 계속하기">
            <GoogleIcon />
          </IconButton>
        </Stack>

        <Typography align="center" sx={{ mt: 3 }}>
          이미 계정이 있으신가요?{' '}
          <Link component={RouterLink} to="/login">
            로그인
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
