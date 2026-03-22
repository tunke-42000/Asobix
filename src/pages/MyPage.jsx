import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { gameService } from '../services/gameService'
import { profileService } from '../services/profileService'
import { storageService } from '../services/storageService'
import { ROUTES } from '../constants/routes'
import { MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/errorMessages'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'

export default function MyPage() {
  const { user, profile, signOut } = useAuth()
  const [games, setGames] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' })
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetchMyGames() {
      if (!user) {
        if (mounted) setIsFetching(false)
        return
      }
      try {
        const fetchedGames = await gameService.getGamesByUser(user.id)
        if (mounted) setGames(fetchedGames)
        if (mounted && profile) {
          setNewUsername(profile.username)
        }
      } catch (err) {
        console.error('MyPage fetch games error:', err)
        if (mounted) setErrorMessage(getErrorMessage(err, MESSAGES.ERROR.FETCH_GAMES))
      } finally {
        if (mounted) setIsFetching(false)
      }
    }
    fetchMyGames()
    
    return () => { mounted = false }
  }, [user, profile])

  async function handleDelete(gameId) {
    if (!window.confirm(MESSAGES.CONFIRM.DELETE)) return

    try {
      await gameService.deleteGame(gameId)
      setGames(games.filter(g => g.id !== gameId))
    } catch (err) {
      console.error('Delete Game Error:', err)
      alert(getErrorMessage(err, MESSAGES.ERROR.DELETE))
    }
  }

  async function handleUpdateUsername(e) {
    e.preventDefault()
    if (!newUsername.trim()) {
      setProfileMessage({ text: 'ユーザー名を入力してください', type: 'error' })
      return
    }
    if (newUsername.trim() === profile.username) {
      setIsEditingProfile(false)
      return
    }

    setIsUpdating(true)
    setProfileMessage({ text: '', type: '' })

    try {
      await profileService.updateUsername(profile.id, newUsername.trim())
      setProfileMessage({ text: 'ユーザー名を更新しました！', type: 'success' })
      setIsEditingProfile(false)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error('Update Username Error:', err)
      setProfileMessage({ text: 'ユーザー名の更新に失敗しました。既に入力された名前が使われている可能性があります。', type: 'error' })
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setIsUploadingAvatar(true)
    setProfileMessage({ text: 'アバター画像をアップロードしています...', type: 'info' })

    try {
      const url = await storageService.uploadAvatar(file, user.id)
      await profileService.updateAvatar(user.id, url)
      setProfileMessage({ text: 'アバター画像を更新しました！', type: 'success' })
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      console.error(err)
      setProfileMessage({ text: 'アバター画像のアップロードに失敗しました。', type: 'error' })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  function handleCopyId() {
    if (profile?.public_user_id) {
      navigator.clipboard.writeText(profile.public_user_id)
      setProfileMessage({ text: 'ユーザーIDをコピーしました！', type: 'success' })
      setTimeout(() => setProfileMessage({ text: '', type: '' }), 3000)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 py-6 px-2">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24 sm:h-32 w-full"></div>
          <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative -mt-12 sm:-mt-16">
            
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <label className="relative cursor-pointer group shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-md border-4 border-white bg-white" />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white text-blue-500 rounded-full flex items-center justify-center font-bold text-4xl shadow-md border-4 border-white">
                    {profile?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity m-1">
                  <span className="text-white text-sm font-bold">{isUploadingAvatar ? '処理中...' : '📷 変更'}</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
              </label>
              
              <div className="text-center md:text-left pt-2 pb-2">
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateUsername} className="flex flex-col md:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      maxLength={20}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-gray-900 w-48 text-center md:text-left"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={isUpdating} className="text-sm px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">保存</button>
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="text-sm px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">キャンセル</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile?.username || '名無し'}</h1>
                    <button onClick={() => setIsEditingProfile(true)} className="text-gray-400 hover:text-blue-500 transition px-2" title="名前を変更する">✏️</button>
                  </div>
                )}
                
                {profile?.public_user_id && (
                  <div className="mt-3 flex items-center justify-center md:justify-start gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 inline-flex">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">ID</span>
                    <span className="text-sm text-gray-800 font-mono font-medium">{profile.public_user_id}</span>
                    <button onClick={handleCopyId} className="text-gray-400 hover:text-blue-500 ml-1" title="IDをコピー">📄</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-20">
              <Link
                to={ROUTES.FRIENDS}
                className="w-full text-center px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl border border-blue-200 transition-colors shadow-sm"
              >
                👥 フレンド管理
              </Link>
              <button
                onClick={signOut}
                className="w-full px-6 py-2.5 bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 font-medium rounded-xl border border-gray-200 hover:border-red-200 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
          
          <div className="px-6 md:px-10 pb-6">
             {profileMessage.text && (
                <div className={`px-4 py-3 text-sm rounded-lg border font-medium text-center ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : profileMessage.type === 'info' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {profileMessage.text}
                </div>
              )}
             {user?.email && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">登録メールアドレス (本人のみに表示されます)</p>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>
              )}
          </div>
        </div>

        {/* My Games Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">あなたの投稿</h2>
            <Link
              to={ROUTES.POST}
              className="text-sm font-bold text-white bg-blue-600 px-5 py-2.5 rounded-full shadow-sm shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              ＋ 新規投稿
            </Link>
          </div>

          {errorMessage && (
            <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-6 font-medium">
              {errorMessage}
            </div>
          )}

          {isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
               {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map(game => (
                <div key={game.id} className="relative group">
                  <GameCard game={game} />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={ROUTES.buildEditPath(game.id)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:text-blue-600 transition"
                      title="編集"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
              <p className="text-gray-500 mb-5 font-medium">まだ投稿したゲームがありません</p>
              <Link
                to={ROUTES.POST}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                最初のゲームを投稿する
              </Link>
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
