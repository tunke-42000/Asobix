import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { gameService } from '../services/gameService'
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
      } catch (err) {
        console.error('MyPage fetch games error:', err)
        if (mounted) setErrorMessage(getErrorMessage(err, MESSAGES.ERROR.FETCH_GAMES))
      } finally {
        if (mounted) setIsFetching(false)
      }
    }
    fetchMyGames()
    
    return () => { mounted = false }
  }, [user])

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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10 py-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-bold text-3xl shadow-inner">
              {profile?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.username || '名無し'}</h1>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-6 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 font-medium rounded-xl border border-gray-200 hover:border-red-200 transition-colors"
          >
            ログアウト
          </button>
        </div>

        {/* My Games Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">あなたの投稿</h2>
            <Link
              to={ROUTES.POST}
              className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
            >
              ＋ 新規投稿
            </Link>
          </div>

          {errorMessage && (
            <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-6">
              {errorMessage}
            </div>
          )}

          {isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
               {[...Array(2)].map((_, i) => (
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
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:text-blue-600 transition"
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
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
              <p className="text-gray-500 mb-4">まだ投稿したゲームがありません</p>
              <Link
                to={ROUTES.POST}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
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
