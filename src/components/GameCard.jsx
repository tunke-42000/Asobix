import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export default function GameCard({ game }) {
  const tags = game.tags || []
  const platforms = game.platform || []

  return (
    <Link
      to={ROUTES.buildGameDetailPath(game.id)}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Thumbnail 16:9 */}
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        {game.thumbnailUrl ? (
          <img
            src={game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🎮
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-1 mb-1.5 group-hover:text-blue-600 transition-colors">
          {game.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed h-10">
          {game.shortDescription}
        </p>

        {/* Platforms & Tags Container */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {platforms.slice(0, 3).map((p, i) => (
            <span
              key={`plat-${i}`}
              className="px-2 py-0.5 bg-gray-800 text-white text-[10px] font-bold tracking-wider rounded border border-gray-700 uppercase"
            >
              {p}
            </span>
          ))}
          {platforms.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold tracking-wider rounded border border-gray-200">
              +{platforms.length - 3}
            </span>
          )}
          {tags.slice(0, 2).map((tag, i) => (
            <span
              key={`tag-${i}`}
              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-medium border border-blue-100"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
           <p className="text-xs text-gray-400 font-medium">
             by <span className="text-gray-600">{game.authorName || '名無し'}</span>
           </p>
        </div>
      </div>
    </Link>
  )
}
