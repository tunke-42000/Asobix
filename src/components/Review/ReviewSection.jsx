import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { reviewService } from '../../services/reviewService'
import { ROUTES } from '../../constants/routes'
import ReviewForm from './ReviewForm'
import ReviewItem from './ReviewItem'
import StarRating from './StarRating'

export default function ReviewSection({ gameId }) {
  const { user } = useAuth()
  
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ average: 0, count: 0, distribution: {} })
  const [userReview, setUserReview] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [fetchedReviews, fetchedStats] = await Promise.all([
        reviewService.getGameReviews(gameId),
        reviewService.getGameRatingStats(gameId)
      ])
      
      setReviews(fetchedReviews)
      setStats(fetchedStats)
      
      // Check if current user has a review
      if (user) {
        const myReview = fetchedReviews.find(r => r.user_id === user.id)
        setUserReview(myReview || null)
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (gameId) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, user])

  const handleSubmit = async ({ rating, reviewText }) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      if (userReview) {
        // Update existing review
        await reviewService.updateReview(userReview.id, rating, reviewText)
      } else {
        // Create new review
        await reviewService.createReview(gameId, user.id, rating, reviewText)
      }
      setIsEditing(false)
      await loadData() // Reload everything to update stats and list
    } catch (err) {
      console.error('Failed to save review:', err)
      alert('レビューの保存に失敗しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('本当にこのレビューを削除しますか？')) return
    
    try {
      await reviewService.deleteReview(reviewId)
      setUserReview(null)
      await loadData()
    } catch (err) {
      console.error('Failed to delete review:', err)
      alert('レビューの削除に失敗しました。')
    }
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">レビューを読み込み中...</div>
  }

  return (
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">レビュー</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Stats & User Action */}
        <div className="lg:col-span-1 border-r-0 lg:border-r border-gray-100 lg:pr-8">
          
          {/* Average Stats */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl font-bold text-gray-900">{stats.average.toFixed(1)}</span>
              <div>
                <StarRating rating={Math.round(stats.average)} interactive={false} />
                <span className="text-sm text-gray-500 block mt-1">星5つ中の平均</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{stats.count} 件のグローバル評価</p>
          </div>

          {/* Distribution Bars */}
          {stats.count > 0 && (
            <div className="space-y-2 mb-8">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution[star] || 0
                const percent = stats.count > 0 ? (count / stats.count) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="text-blue-600 font-medium w-6 hover:underline cursor-pointer">★{star}</span>
                    <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-gray-500 w-8 text-right">{Math.round(percent)}%</span>
                  </div>
                )
              })}
            </div>
          )}

          <hr className="my-6 border-gray-100" />

          {/* User Review Action */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">このゲームを評価する</h3>
            <p className="text-sm text-gray-600 mb-4">
              プレイした感想を他のユーザーと共有しましょう。
            </p>
            
            {!user ? (
              <Link 
                to={ROUTES.LOGIN} 
                className="block w-full text-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition"
              >
                ログインしてレビューを書く
              </Link>
            ) : userReview && (!isEditing) ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition"
              >
                あなたのレビューを編集する
              </button>
            ) : (!isEditing) ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition"
              >
                レビューを書く
              </button>
            ) : null}
          </div>
        </div>

        {/* Right Col: Review List & Form */}
        <div className="lg:col-span-2">
          {isEditing && (
            <div className="mb-8 animate-fade-in">
              <ReviewForm
                initialReview={userReview}
                onSubmit={handleSubmit}
                onCancel={() => setIsEditing(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
              すべてのレビュー ({stats.count}件)
            </h3>
            
            {reviews.length === 0 ? (
              <p className="text-gray-500 py-4">まだレビューはありません。最初のレビューを書いてみましょう！</p>
            ) : (
              <div className="flex flex-col gap-2">
                {reviews.map(review => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    currentUserId={user?.id}
                    onEdit={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                      setIsEditing(true)
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
