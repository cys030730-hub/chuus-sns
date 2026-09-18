import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import AppLayout from '../components/common/app-layout';
import { useAuth } from '../hooks/use-auth';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['스킨케어', '메이크업', '헤어', '향수'];
const CONDITIONS = ['미개봉', '사용감 있음', '사용감 많음'];

/**
 * PostWritePage 컴포넌트
 *
 * 게시물 작성 화면. 일반 후기와 중고판매 글을 하나의 폼에서 작성한다.
 *
 * Example usage:
 * <PostWritePage />
 */
export default function PostWritePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [category, setCategory] = useState('스킨케어');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSecondhand, setIsSecondhand] = useState(false);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!caption.trim() || !content.trim()) {
      setErrorMessage('제목(짧은 소개)과 본문을 모두 입력해주세요.');
      return;
    }
    if (isSecondhand && !price) {
      setErrorMessage('판매 가격을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const { data: post, error } = await supabase
      .from('cu_posts')
      .insert({
        user_id: profile.id,
        caption,
        content,
        image_url: imageUrl || null,
        category,
        rating,
        skin_type: profile.skin_type,
        personal_color: profile.personal_color,
        is_secondhand: isSecondhand,
      })
      .select()
      .single();

    if (error || !post) {
      setErrorMessage('게시물 작성 중 오류가 발생했습니다.');
      setIsSubmitting(false);
      return;
    }

    if (isSecondhand) {
      await supabase.from('cu_secondhand_items').insert({
        post_id: post.id,
        price: Number(price),
        condition,
      });
    }

    setIsSubmitting(false);
    navigate(`/posts/${post.id}`, { replace: true });
  };

  return (
    <AppLayout hasFab={false}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Avatar src={profile?.avatar_url} />
        <Typography variant="h6" fontWeight={700}>
          {profile?.display_name}님, 후기를 남겨주세요
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField select label="카테고리" value={category} onChange={(event) => setCategory(event.target.value)} fullWidth>
          {CATEGORIES.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="이미지 URL"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://images.unsplash.com/..."
          helperText="마음에 드는 이미지의 URL을 붙여넣어 주세요 (Unsplash 등)"
          fullWidth
        />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            별점
          </Typography>
          <Rating value={rating} onChange={(_event, value) => setRating(value)} />
        </Box>

        <TextField label="제목 (짧은 소개)" value={caption} onChange={(event) => setCaption(event.target.value)} required fullWidth />
        <TextField
          label="본문"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          fullWidth
          multiline
          minRows={5}
        />

        <FormControlLabel
          control={<Switch checked={isSecondhand} onChange={(event) => setIsSecondhand(event.target.checked)} />}
          label="중고판매 글로 등록"
        />

        {isSecondhand && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, borderRadius: 3, bgcolor: 'grey.50' }}>
            <TextField
              label="판매 가격 (원)"
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required={isSecondhand}
              fullWidth
            />
            <Typography variant="body2" color="text.secondary">
              상품 상태
            </Typography>
            <ToggleButtonGroup value={condition} exclusive onChange={(_event, value) => value && setCondition(value)}>
              {CONDITIONS.map((option) => (
                <ToggleButton key={option} value={option}>
                  {option}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ borderRadius: 999 }}>
          게시하기
        </Button>
      </Box>
    </AppLayout>
  );
}
