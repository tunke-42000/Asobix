import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'

export default function MyPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!user) return

    async function fetchMyGames() {
      try {
        const q = query(
          collection(db, 'games'),
          where('authorId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setGames(data)
      } catch (err) {
        console.error('Error fetching my games:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyGames()
  }, [user])

  async function handleDelete(gameId) {
    if (!window.confirm('このゲームを削除しますか？この操作は取り消せません。')) return
    setDeletingId(gameId)
    try {
      await deleteDoc(doc(db, 'games', gameId))
      setGames(prev => prev.filter(g => g.id !== gameId))
    } catch (err) {
      console.error('Error deleting game:', err)
      alert('削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold">
              {(profile?.username?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile?.username || '名無し'}</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* My Games */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">自分の投稿</h2>
          <Link
            to="/post"
            className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors"
          >
            ＋ 新規投稿
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium mb-1">まだ投稿がありません</p>
            <Link to="/post" className="text-sm text-blue-500 hover:underline">
              最初のゲームを投稿する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <div key={game.id} className="relative">
                <GameCard game={game} />
                {/* Action buttons */}
                <div className="flex gap-2 mt-2">
                  <Link
                    to={`/edit/${game.id}`}
                    className="flex-1 text-center py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(game.id)}
                    disabled={deletingId === game.id}
                    className="flex-1 py-2 text-sm text-red-500 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === game.id ? '削除中...' : '削除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

