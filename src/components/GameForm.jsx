import { useState, useEffect } from 'react'
import { validateGameForm } from '../utils/validation'
import { PLATFORMS } from '../constants/options'

export default function GameForm({ initialValues, onSubmit, submitLabel = '投稿する', isSubmitting = false, isEdit = false }) {
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    gameUrl: '',
    platform: [],
    tags: '',
    controls: ''
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || '',
        shortDescription: initialValues.shortDescription || '',
        description: initialValues.description || '',
        gameUrl: initialValues.gameUrl || '',
        platform: initialValues.platform || [],
        tags: initialValues.tags?.join(', ') || '',
        controls: initialValues.controls || ''
      })
      if (initialValues.thumbnailUrl) {
        setThumbnailPreview(initialValues.thumbnailUrl)
      }
    }
  }, [initialValues])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  function togglePlatform(p) {
    setForm(prev => {
      const isSelected = prev.platform.includes(p)
      const nextPlatform = isSelected 
        ? prev.platform.filter(item => item !== p)
        : [...prev.platform, p]
      return { ...prev, platform: nextPlatform }
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setValidationError('')
    
    // utils の外部関数を利用してバリデーション
    const errObj = validateGameForm(form, thumbnailPreview, isEdit)
    if (errObj) {
      setValidationError(errObj)
      return
    }

    const tagsArray = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t)

    onSubmit({
      form: { ...form, tags: tagsArray },
      thumbnailFile
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
      
      {validationError && (
        <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-pulse">
          {validationError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          ゲームタイトル <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="あそびっくす大冒険"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          サムネイル画像 {isEdit ? '' : <span className="text-red-400">*</span>}
        </label>
        {thumbnailPreview && (
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
            <img src={thumbnailPreview} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition"
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          短い説明（一覧表示用） <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="shortDescription"
          value={form.shortDescription}
          onChange={handleChange}
          placeholder="タップして進む爽快アクション！"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">詳細な説明</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          placeholder="ゲームのストーリーや特徴など"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Game URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          ゲームURL (UnityRoom. ふりーむ等) <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          name="gameUrl"
          value={form.gameUrl}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Platform & Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          対応プラットフォーム (複数選択可) <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
          {PLATFORMS.map(p => {
            const isSelected = form.platform.includes(p)
            return (
              <button
                type="button"
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">タグ (カンマ区切り)</label>
        <input
          type="text"
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="RPG, ドット絵, アクション"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">操作方法</label>
        <textarea
          name="controls"
          value={form.controls}
          onChange={handleChange}
          rows="2"
          placeholder="矢印キーで移動、Spaceでジャンプ"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 disabled:opacity-60 transition-all active:scale-95"
        >
          {isSubmitting ? '処理中...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
