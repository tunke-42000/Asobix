import React from 'react'

export default function StarRating({ rating, setRating, interactive = false }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          className={`text-2xl transition-colors focus:outline-none ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${
            star <= rating ? 'text-yellow-400' : 'text-gray-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
