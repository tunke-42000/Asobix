import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gameService } from '../services/gameService'
import { ROUTES } from '../constants/routes'
import Layout from '../components/Layout'

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function GameDetailPage() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchGame() {
      try {
        const data = await gameService.getGameById(id)
        if (!data) throw new Error('Game not found')
        setGame(data)
      } catch (err) {
        console.error('Error fetching game:', err)
        setError('ゲームが見つかりませんでした')
      } finally {
        setLoading(false)
      }
    }
    fetchGame()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error || !game) {
    return (
      <Layout>
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-700 mb-2">{error || 'Game Not Found'}</h2>
          <Link to={ROUTES.HOME} className="text-blue-500 hover:underline">トップページに戻る</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-8">
          <div className="block md:flex gap-10 items-start">
            
            {/* Thumbnail */}
            <div className="w-full md:w-1/2 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 aspect-video md:aspect-[4/3] mb-6 md:mb-0">
              {game.thumbnailUrl ? (
                <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                  🎮
                </div>
              )}
            </div>

            {/* Info */}
            <div className="w-full md:w-1/2 flex flex-col justify-between h-full">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                  {game.title}
                </h1>
                
                {/* Author */}
                <div className="flex items-center gap-3 mb-6">
                  {game.authorAvatarUrl ? (
                    <img src={game.authorAvatarUrl} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-bold text-lg">
                      {game.authorName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">制作者</p>
                    <p className="font-semibold text-gray-900">{game.authorName}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {game.shortDescription}
                </p>

                {/* Platforms & Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {game.platform?.length > 0 && game.platform.map((p, idx) => (
                    <span key={`plat-${idx}`} className="px-3 py-1 bg-gray-800 text-white text-xs font-bold tracking-wider rounded border border-gray-700 uppercase shadow-sm">
                      💻 {p}
                    </span>
                  ))}
                  {game.tags?.map((tag, idx) => (
                    <span key={`tag-${idx}`} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Play Button */}
              {game.gameUrl ? (
                <a
                  href={game.gameUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                  ゲームを遊ぶ 🎮
                </a>
              ) : (
                <button disabled className="block w-full text-center py-4 bg-gray-300 text-white text-lg font-bold rounded-2xl cursor-not-allowed">
                  URLがありません
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {(game.description || game.controls) && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                {game.description && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-blue-500">📖</span> ゲームの説明
                    </h3>
                    <div className="text-gray-600 leading-loose whitespace-pre-wrap">
                      {game.description}
                    </div>
                  </div>
                )}
                
                {game.controls && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-blue-500">🎮</span> 操作方法
                    </h3>
                    <div className="text-gray-600 leading-loose whitespace-pre-wrap bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      {game.controls}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">ゲーム情報</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <span className="block text-gray-500 mb-1">投稿日</span>
                  <span className="text-gray-900 font-medium">{formatDate(game.createdAt)}</span>
                </li>
                {game.updatedAt !== game.createdAt && (
                  <li>
                    <span className="block text-gray-500 mb-1">最終更新日</span>
                    <span className="text-gray-900 font-medium">{formatDate(game.updatedAt)}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </Layout>
  )
}
