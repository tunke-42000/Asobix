import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gameService } from '../services/gameService'
import { ROUTES } from '../constants/routes'
import { PLATFORMS } from '../constants/options'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'

export default function TopPage() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])

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

  function togglePlatformFilter(p) {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    )
  }

  function handleReset() {
    setSearchQuery('')
    setSelectedPlatforms([])
  }

  // Filtered Games Logic
  const filteredGames = games.filter(game => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = query ? game.title.toLowerCase().includes(query) : true

    const matchesPlatform = selectedPlatforms.length > 0
      ? selectedPlatforms.some(sp => game.platform?.includes(sp))
      : true

    return matchesSearch && matchesPlatform
  })

  return (
    <Layout>
      <div className="py-8 space-y-12">

        {/* Hero Section */}
        <section className="text-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 rounded-3xl border border-blue-100 shadow-sm">
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

        {/* Search & Filter Section */}
        <section className="max-w-6xl mx-auto px-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10 flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ゲーム名で検索..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all font-medium"
                />
              </div>

              {(searchQuery || selectedPlatforms.length > 0) && (
                <button
                  onClick={handleReset}
                  className="text-sm font-bold text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-5 py-3 rounded-xl transition-colors whitespace-nowrap active:scale-95"
                >
                  ✖ 絞り込み解除
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5">
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
                {searchQuery || selectedPlatforms.length > 0 ? "検索結果" : "新着ゲーム"}
              </h2>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                {filteredGames.length} 件
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-72 border border-gray-100 shadow-sm" />
                ))}
              </div>
            ) : filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                <div className="text-6xl mb-6">👻</div>
                <p className="text-gray-900 font-extrabold text-xl mb-3">該当するゲームが見つかりませんでした</p>
                <p className="text-gray-500 text-sm font-medium">検索条件を変更するか、絞り込みを解除してお試しください。</p>
                <button 
                  onClick={handleReset}
                  className="mt-8 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  すべてのゲームを表示
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </Layout>
  )
}
