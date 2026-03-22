import { useState } from 'react'
import StarRating from './StarRating'

export default function ReviewForm({ initialReview, onSubmit, onCancel, isSubmitting }) {
  const [rating, setRating] = useState(initialReview?.rating || 0)
  const [reviewText, setReviewText] = useState(initialReview?.review_text || '')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError('星評価（1〜5）を選択してください。')
      return
    }
    if (reviewText.length > 500) {
      setError('口コミ本文は500文字以内で入力してください。')
      return
    }
    
    setError('')
    onSubmit({ rating, reviewText })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">
        {initialReview ? 'あなたのレビューを編集' : 'レビューを書く'}
      </h3>
      
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">評価 *</label>
        <StarRating rating={rating} setRating={setRating} interactive={true} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">口コミ本文 (任意)</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="ゲームの感想、良かった点、改善を希望する点などをご自由にお書きください。他のユーザーの参考になります。"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition resize-y min-h-[100px]"
          maxLength={500}
        />
        <p className="text-right text-xs text-gray-400 mt-1">
          {reviewText.length} / 500文字
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="px-6 py-2.5 bg-yellow-400 text-yellow-900 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSubmitting ? '送信中...' : 'レビューを投稿する'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-white text-gray-600 font-medium rounded-lg hover:bg-gray-50 border border-gray-200 disabled:opacity-50 transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
