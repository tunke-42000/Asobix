import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gameService } from '../services/gameService'
import { ROUTES } from '../constants/routes'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'

export default function TopPage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchGames() {
      try {
        const fetchedGames = await gameService.getGames()
        setGames(fetchedGames)
      } catch (err) {
        console.error('Error fetching games:', err)
        setError('ゲーム一覧の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [])

  return (
    <Layout>
      <div className="flex flex-col gap-10 py-6">
        <div className="text-center space-y-4 py-12 px-4 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
            自作ゲームの世界へようこそ
          </h1>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Asobix（アソビックス）は、開発者が作成したゲームをシェアして遊べるプラットフォームです。お気に入りのゲームを見つけよう！
          </p>
          <div className="pt-4">
            <Link
              to={ROUTES.POST}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md shadow-blue-200 transition-transform active:scale-95"
            >
              ゲームを投稿する
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ✨ 新着ゲーム
          </h2>
          
          {error && (
            <div className="text-center py-10 bg-red-50 text-red-500 rounded-xl border border-red-100 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            !error && (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed text-gray-500">
                まだ投稿されたゲームがありません
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  )
}
