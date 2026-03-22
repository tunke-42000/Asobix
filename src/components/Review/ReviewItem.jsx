import React from 'react'
import StarRating from './StarRating'

export default function ReviewItem({ review, currentUserId, onEdit, onDelete }) {
  const isOwner = currentUserId === review.user_id
  
  // Format dates
  const dateObj = new Date(review.created_at)
  const isEdited = review.created_at !== review.updated_at
  const dateStr = dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  // Extract username correctly based on relation query (profiles is a nested object)
  const username = review.profiles?.username || '名無しユーザー'

  return (
    <div className="py-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-xl">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-gray-800">{username}</span>
            <span className="text-sm text-gray-400">{dateStr}</span>
          </div>
          <StarRating rating={review.rating} interactive={false} />
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(review)}
              className="text-xs px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md font-medium transition"
            >
              編集
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="text-xs px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium transition"
            >
              削除
            </button>
          </div>
        )}
      </div>

      {review.review_text && (
        <p className="text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed text-sm">
          {review.review_text}
        </p>
      )}
      
      {isEdited && (
        <p className="text-xs text-gray-400 mt-2">※編集済み</p>
      )}
    </div>
  )
}
