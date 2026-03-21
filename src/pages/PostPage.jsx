import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameService } from '../services/gameService'
import { storageService } from '../services/storageService'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import GameForm from '../components/GameForm'

export default function PostPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit({ form, thumbnailFile }) {
    if (!user || (!user.id && !user.uid)) {
      setSubmitError('ログインセッションが有効ではありません。')
      return
    }
    
    const userId = user.id || user.uid

    setLoading(true)
    setSubmitError('')
    
    try {
      let thumbnailUrl = null
      
      if (thumbnailFile) {
        thumbnailUrl = await storageService.uploadThumbnail(thumbnailFile, userId)
      }

      await gameService.createGame({
        ...form,
        authorId: userId,
        thumbnailUrl: thumbnailUrl
      })

      navigate('/mypage')
    } catch (err) {
      console.error('Game Post Error:', err)
      setSubmitError(err.message || '投稿に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ゲームを投稿する</h1>
        <p className="text-sm text-gray-500 mb-8">あなたのゲームをみんなに紹介しましょう</p>

        {submitError && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 whitespace-pre-wrap">
            {submitError}
          </div>
        )}

        <GameForm onSubmit={handleSubmit} submitLabel="投稿する" loading={loading} />
      </div>
    </Layout>
  )
}
