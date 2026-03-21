import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gameService } from '../services/gameService'
import Layout from '../components/Layout'

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
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
        if (!data) {
          setError('ゲームが見つかりませんでした。')
        } else {
          setGame(data)
        }
      } catch (err) {
        console.error(err)
        setError('エラーが発生しました。')
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
          <Link to="/" className="text-blue-500 hover:underline">トップページに戻る</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Thumbnail Hero */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
          {game.thumbnailUrl ? (
            <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🎮</div>
          )}
        </div>

        <div className="p-8 md:p-10">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {game.platform && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    {game.platform}
                  </span>
                )}
                {game.tags && game.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{game.title}</h1>
              <p className="text-lg text-gray-600 font-medium">{game.shortDescription}</p>
            </div>
            
            <a
              href={game.gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95 shrink-0"
            >
              遊んでみる
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <hr className="border-gray-100 my-8" />

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ゲームの説明</h3>
                <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
                  {game.description || '詳しい説明はありません。'}
                </div>
              </section>

              {game.controls && (
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">操作方法</h3>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-gray-700 whitespace-pre-wrap">
                    {game.controls}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-50">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">製作者情報</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-bold text-xl">
                    {game.authorName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{game.authorName}</div>
                    <div className="text-sm text-gray-500">開発者</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">投稿日時</h4>
                <p className="text-gray-600">{formatDate(game.createdAt)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">更新日時</h4>
                <p className="text-gray-600">{formatDate(game.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
