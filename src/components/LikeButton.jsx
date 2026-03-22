import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { likeService } from '../services/likeService'

export default function LikeButton({ gameId, authorId, initialLikeCount, initialLikedUserIds = [], currentUser, className = '' }) {
  const navigate = useNavigate()
  
  // 楽観的UIのためのローカルステート
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0)
  const isInitiallyLiked = currentUser ? initialLikedUserIds.includes(currentUser.id) : false
  const [isLiked, setIsLiked] = useState(isInitiallyLiked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      if (window.confirm('いいねするにはログインが必要です。ログイン画面へ移動しますか？')) {
        navigate(ROUTES.LOGIN)
      }
      return
    }

    if (currentUser.id === authorId) {
      alert('自分の投稿にはいいねできません')
      return
    }

    if (isLoading) return

    // 先に画面の見た目だけ変更する (楽観的更新)
    setIsLoading(true)
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1)

    try {
      await likeService.toggleLike(gameId, currentUser.id, isLiked)
    } catch (err) {
      // 失敗した場合は元に戻す
      console.error('Like error:', err)
      setIsLiked(isLiked)
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
      alert('いいねの処理に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-90 ${
        isLiked 
          ? 'bg-pink-50 text-pink-600 border border-pink-200 shadow-sm' 
          : 'bg-white text-gray-400 border border-gray-200 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 shadow-sm'
      } ${className}`}
      title={isLiked ? "いいねを取り消す" : "面白い！"}
    >
      <span className={`text-base leading-none ${isLiked && !isLoading ? 'animate-[ping_0.3s_ease-out_1]' : 'opacity-80'}`}>
        {isLiked ? '❤️' : '🤍'}
      </span>
      <span className="text-sm font-bold min-w-[1ch] text-center">
        {likeCount}
      </span>
    </button>
  )
}
