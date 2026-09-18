import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/protected-route';
import LoginPage from './pages/login-page';
import SignupPage from './pages/signup-page';
import HomePage from './pages/home-page';
import PostListPage from './pages/post-list-page';
import PostWritePage from './pages/post-write-page';
import PostDetailPage from './pages/post-detail-page';
import SecondhandListPage from './pages/secondhand-list-page';
import MyPage from './pages/my-page';
import ChatListPage from './pages/chat-list-page';
import ChatRoomPage from './pages/chat-room-page';
import NotificationsPage from './pages/notifications-page';
import SearchPage from './pages/search-page';
import CompleteProfilePage from './pages/complete-profile-page';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/posts" element={<ProtectedRoute><PostListPage /></ProtectedRoute>} />
      <Route path="/posts/new" element={<ProtectedRoute><PostWritePage /></ProtectedRoute>} />
      <Route path="/posts/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
      <Route path="/secondhand" element={<ProtectedRoute><SecondhandListPage /></ProtectedRoute>} />
      <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatListPage /></ProtectedRoute>} />
      <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
