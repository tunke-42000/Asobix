import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameService } from '../services/gameService'
import { storageService } from '../services/storageService'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/errorMessages'
import Layout from '../components/Layout'
import GameForm from '../components/GameForm'

export default function PostPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit({ form, thumbnailFile }) {
    if (isSubmitting) return
    if (!user || (!user.id && !user.uid)) {
      setErrorMessage(MESSAGES.ERROR.UNAUTHORIZED)
      return
    }
    
    const userId = user.id || user.uid
    setIsSubmitting(true)
    setErrorMessage('')
    
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

      navigate(ROUTES.MYPAGE)
    } catch (err) {
      console.error('Game Post Error:', err)
      setErrorMessage(getErrorMessage(err, MESSAGES.ERROR.POST))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ゲームを投稿する</h1>
        <p className="text-sm text-gray-500 mb-8">あなたのゲームをみんなに紹介しましょう</p>

        {errorMessage && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 whitespace-pre-wrap">
            {errorMessage}
          </div>
        )}

        <GameForm onSubmit={handleSubmit} submitLabel="投稿する" isSubmitting={isSubmitting} />
      </div>
    </Layout>
  )
}
