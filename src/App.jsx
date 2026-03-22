import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ROUTES } from './constants/routes'

import TopPage from './pages/TopPage'
import GameDetailPage from './pages/GameDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PostPage from './pages/PostPage'
import EditPage from './pages/EditPage'
import MyPage from './pages/MyPage'
import FriendsPage from './pages/FriendsPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.HOME} element={<TopPage />} />
          <Route path={ROUTES.GAME_DETAIL_ROUTE} element={<GameDetailPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          
          <Route path={ROUTES.POST} element={
            <ProtectedRoute>
              <PostPage />
            </ProtectedRoute>
          } />
          
          <Route path={ROUTES.EDIT_ROUTE} element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          } />
          
          <Route path={ROUTES.MYPAGE} element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.FRIENDS} element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
