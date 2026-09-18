import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';

const SKIN_TYPES = ['지성', '건성', '복합성', '민감성'];
const PERSONAL_COLORS = ['봄웜', '여름쿨', '가을웜', '겨울쿨'];

/**
 * CompleteProfilePage 컴포넌트
 *
 * 로그인은 되어 있지만 Chuus 프로필(cu_profiles)이 없는 사용자가
 * 최초 1회 프로필 정보를 입력해 생성하는 화면.
 *
 * Example usage:
 * <CompleteProfilePage />
 */
export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
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

    if (!form.username.trim() || !form.displayName.trim()) {
      setErrorMessage('아이디와 닉네임은 필수입니다.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('cu_profiles').insert({
      id: user.id,
      username: form.username,
      display_name: form.displayName,
      skin_type: form.skinType || null,
      personal_color: form.personalColor || null,
      region: form.region || null,
      address: form.address || null,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.code === '23505' ? '이미 사용 중인 아이디입니다.' : '프로필 생성 중 오류가 발생했습니다.');
      return;
    }

    await refreshProfile();
    navigate('/', { replace: true });
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={800} align="center" sx={{ mb: 1 }}>
          Chuus 프로필 만들기
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
          {user?.email} 계정으로 Chuus를 처음 이용하시네요. 프로필 정보를 입력해주세요.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

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
            시작하기
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
