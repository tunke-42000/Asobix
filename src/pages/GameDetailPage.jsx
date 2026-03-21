import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Layout from '../components/Layout'

const PLATFORM_LABELS = {
  pc: 'PC',
  mobile: 'スマホ',
  both: 'PC・スマホ両対応',
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  // Firestore timestamp to Date
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString('ja-JP')
  }
  return new Date(timestamp).toLocaleDateString('ja-JP')
}

export default function GameDetailPage() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGame() {
      try {
        const docRef = doc(db, 'games', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setGame({ id: docSnap.id, ...docSnap.data() })
        }
      } catch (err) {
        console.error('Error fetching game:', err)
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

  if (!game) {
    return (
      <Layout>
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">ゲームが見つかりませんでした</p>
          <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline text-sm">
            トップページへ戻る
          </Link>
        </div>
      </Layout>
    )
  }

  const tags = game.tags || []
  const createdAtStr = formatDate(game.createdAt)
  const updatedAtStr = formatDate(game.updatedAt)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
          ← 一覧に戻る
        </Link>

        {/* Thumbnail */}
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-6">
          {game.thumbnailUrl ? (
            <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🎮</div>
          )}
        </div>

        {/* Title & Play Button */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{game.title}</h1>
          <a
            href={game.gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors text-center"
          >
            🎮 ゲームを遊ぶ
          </a>
        </div>

        {/* Tags & Platform */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
              {tag}
            </span>
          ))}
          {game.platform && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              🖥 {PLATFORM_LABELS[game.platform] || game.platform}
            </span>
          )}
        </div>

        {/* Short desc */}
        <p className="text-gray-600 text-base mb-6 leading-relaxed">
          {game.shortDescription}
        </p>

        {/* Description */}
        {game.description && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">詳細説明</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{game.description}</p>
          </div>
        )}

        {/* Controls */}
        {game.controls && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">操作方法</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{game.controls}</p>
          </div>
        )}

        {/* Meta */}
        <div className="text-xs text-gray-400 flex flex-col gap-1">
          <span>投稿者: {game.authorName || '名無し'}</span>
          <span>投稿日: {createdAtStr}</span>
          {updatedAtStr && updatedAtStr !== createdAtStr && <span>更新日: {updatedAtStr}</span>}
        </div>
      </div>
    </Layout>
  )
}

