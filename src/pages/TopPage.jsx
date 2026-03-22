import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { gameService } from '../services/gameService'
import { friendService } from '../services/friendService'
import { ROUTES } from '../constants/routes'
import { PLATFORMS } from '../constants/options'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'

export default function TopPage() {
  const { user } = useAuth()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  // Search & Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [showFriendsOnly, setShowFriendsOnly] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'popular'

  useEffect(() => {
    async function fetchGames() {
      try {
        const data = await gameService.getGames()
        setGames(data)
      } catch (error) {
        console.error('Error fetching games:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [])

  useEffect(() => {
    async function fetchFriends() {
      if (user) {
        try {
          const fData = await friendService.getFriends(user.id)
          setFriendIds(fData.map(f => f.id))
        } catch (e) {
          console.error('Error fetching friends:', e)
        }
      }
    }
    fetchFriends()
  }, [user])

  function togglePlatformFilter(p) {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    )
  }

  function handleReset() {
    setSearchQuery('')
    setSelectedPlatforms([])
    setShowFriendsOnly(false)
    setSortBy('newest')
  }

  // Filtered Games Logic
  const filteredGames = games.filter(game => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = query ? game.title.toLowerCase().includes(query) : true

    const matchesPlatform = selectedPlatforms.length > 0
      ? selectedPlatforms.some(sp => game.platform?.includes(sp))
      : true
      
    const matchesFriend = showFriendsOnly ? friendIds.includes(game.authorId) : true

    return matchesSearch && matchesPlatform && matchesFriend
  })

  // Sorted Games Logic
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'popular') {
      if (b.likeCount !== a.likeCount) return (b.likeCount || 0) - (a.likeCount || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
    return new Date(b.createdAt) - new Date(a.createdAt) // newest fallback
  })

  // Top 5 Popular Games
  const topRankingGames = [...games]
    .sort((a, b) => {
      if (b.likeCount !== a.likeCount) return (b.likeCount || 0) - (a.likeCount || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    .slice(0, 5)

  return (
    <Layout>
      <div className="py-8 space-y-12 overflow-x-hidden w-full">

        {/* Hero Section */}
        <section className="text-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 rounded-3xl border border-blue-100 shadow-sm mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            つくったゲームを<br className="md:hidden" />世界に届けよう
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Asobixは、誰でも簡単に自作ゲームを投稿・共有できるプラットフォームです。<br className="hidden md:block" />
            あなたの作品を待っているプレイヤーがいます。
          </p>
          <div className="pt-4">
            <Link
              to={ROUTES.POST}
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-transform active:scale-95 text-lg"
            >
              🚀 ゲームを投稿する
            </Link>
          </div>
        </section>

        {/* Popular Ranking Section */}
        {!loading && topRankingGames.length > 0 && (
          <section className="max-w-6xl mx-auto px-2">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              👑 人気ランキング TOP {topRankingGames.length}
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar">
              {topRankingGames.map((game, index) => (
                <div key={`rank-${game.id}`} className="min-w-[300px] sm:min-w-[340px] snap-start relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-extrabold text-xl rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10 transform -rotate-12">
                    {index + 1}
                  </div>
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search & Filter Section */}
        <section className="max-w-6xl mx-auto px-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10 flex flex-col gap-6">
            
            <div className="flex flex-col lg:flex-row gap-4 items-start xl:items-center w-full">
              {/* Search Bar */}
              <div className="relative w-full lg:flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ゲーム名で検索..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* Sorting Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 flex-1 sm:flex-none">
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${sortBy === 'newest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    ✨ 新着順
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${sortBy === 'popular' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    🔥 人気順
                  </button>
                </div>

                {/* Friends Filter Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 flex-1 sm:flex-none">
                  <button
                    onClick={() => setShowFriendsOnly(false)}
                    className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${!showFriendsOnly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    全てのゲーム
                  </button>
                  {user && (
                   <button
                      onClick={() => setShowFriendsOnly(true)}
                      className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all ${showFriendsOnly ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      フレンドのみ
                    </button>
                  )}
                </div>
              </div>

              {(searchQuery || selectedPlatforms.length > 0 || showFriendsOnly || sortBy !== 'newest') && (
                <button
                  onClick={handleReset}
                  className="w-full lg:w-auto text-sm font-bold text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-5 py-3 rounded-xl transition-colors whitespace-nowrap active:scale-95"
                >
                  ✖ クリア
                </button>
              )}
            </div>

            {/* Platform Filters */}
            <div className="border-t border-gray-100 pt-5 mt-2">
              <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                🎮 プラットフォームでフィルター
              </p>
              <div className="flex flex-wrap gap-2.5">
                {PLATFORMS.map(p => {
                  const isSelected = selectedPlatforms.includes(p)
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatformFilter(p)}
                      className={`px-4 py-2 border rounded-full text-sm font-bold transition-all select-none ${
                        isSelected
                          ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {p} {isSelected && <span className="ml-1 opacity-75">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Games Grid */}
          <div>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-2xl font-extrabold text-gray-900">
                {searchQuery || selectedPlatforms.length > 0 ? "検索結果" : sortBy === 'popular' ? "人気ゲーム一覧" : "新着ゲーム一覧"}
              </h2>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                {sortedGames.length} 件
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-72 border border-gray-100 shadow-sm" />
                ))}
              </div>
            ) : sortedGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                <div className="text-6xl mb-6">👻</div>
                <p className="text-gray-900 font-extrabold text-xl mb-3">該当するゲームが見つかりませんでした</p>
                <p className="text-gray-500 text-sm font-medium">検索条件を変更するか、クリアしてお試しください。</p>
                <button 
                  onClick={handleReset}
                  className="mt-8 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  条件をリセット
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </Layout>
  )
}
