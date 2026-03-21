import { useState } from 'react'

const PLATFORMS = [
  { value: 'pc', label: 'PC' },
  { value: 'mobile', label: 'スマホ' },
  { value: 'both', label: 'PC・スマホ両対応' },
]

export default function GameForm({ initialValues = {}, onSubmit, submitLabel = '投稿する', loading }) {
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    gameUrl: '',
    tags: '',
    platform: '',
    controls: '',
    ...initialValues,
    tags: Array.isArray(initialValues.tags) ? initialValues.tags.join(', ') : (initialValues.tags || ''),
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(initialValues.thumbnailUrl || null)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  function validate() {
    if (!form.title.trim()) return 'ゲームタイトルを入力してください'
    if (!form.shortDescription.trim()) return '短い説明を入力してください'
    if (!form.gameUrl.trim()) return 'ゲームURLを入力してください'
    try { new URL(form.gameUrl) } catch { return 'ゲームURLの形式が正しくありません' }
    // [TEMPORARILY DISABLED] Storage Upload: 画像必須バリデーションを一時停止
    // if (!thumbnailPreview) return 'サムネイル画像を選択してください'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)
    setError('')

    const tags = form.tags
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    await onSubmit({ form: { ...form, tags }, thumbnailFile })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
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
          placeholder="例: SuperPlatformer"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Game URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          ゲームURL <span className="text-red-400">*</span>
        </label>
        <input
          type="url"
          name="gameUrl"
          value={form.gameUrl}
          onChange={handleChange}
          placeholder="https://example.com/my-game"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* [TEMPORARILY DISABLED] Storage Upload: 画像アップロードUIを一時停止 */}
      {/*
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          サムネイル画像 <span className="text-red-400">*</span>
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
      */}

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          短い説明 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="shortDescription"
          value={form.shortDescription}
          onChange={handleChange}
          placeholder="一覧カードに表示される説明（50字前後）"
          maxLength={100}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">詳細説明</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          placeholder="ゲームの詳細な説明（任意）"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">タグ</label>
        <input
          type="text"
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="アクション, パズル, RPG（カンマ区切り・任意）"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
        />
      </div>

      {/* Platform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">対応端末</label>
        <select
          name="platform"
          value={form.platform}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition bg-white"
        >
          <option value="">未選択</option>
          {PLATFORMS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">操作方法</label>
        <textarea
          name="controls"
          value={form.controls}
          onChange={handleChange}
          rows={3}
          placeholder="例: WASDで移動、スペースでジャンプ（任意）"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-colors"
      >
        {loading ? '処理中...' : submitLabel}
      </button>
    </form>
  )
}

