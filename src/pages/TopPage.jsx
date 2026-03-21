import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import GameCard from '../components/GameCard'
import Layout from '../components/Layout'

export default function TopPage() {
  const { user } = useAuth()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGames() {
      try {
        const q = query(collection(db, 'games'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setGames(data)
      } catch (err) {
        console.error('Error fetching games:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [])

  return (
    <Layout>
      {/* Hero */}
      <section className="text-center py-16 mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          ASOBIX
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          作って、遊んで、共有する。
        </p>
        {user ? (
          <Link
            to="/post"
            className="inline-block px-7 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
          >
            ゲームを投稿する
          </Link>
        ) : (
          <Link
            to="/register"
            className="inline-block px-7 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
          >
            無料で始める
          </Link>
        )}
      </section>

      {/* Game List */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          投稿されたゲーム
        </h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-lg font-medium mb-2">まだゲームが投稿されていません</p>
            <p className="text-sm">最初の投稿者になりましょう！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}

