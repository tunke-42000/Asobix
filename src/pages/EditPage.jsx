import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameService } from '../services/gameService'
import { storageService } from '../services/storageService'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'
import { MESSAGES } from '../constants/messages'
import { getErrorMessage } from '../utils/errorMessages'
import Layout from '../components/Layout'
import GameForm from '../components/GameForm'

export default function EditPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [game, setGame] = useState(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true
    async function fetchGame() {
      if (!user) {
        if (mounted) setIsFetching(false)
        return
      }
      const userId = user.id || user.uid
      
      try {
        const data = await gameService.getGameById(id)
        if (!data || data.authorId !== userId) {
          navigate(ROUTES.MYPAGE)
          return
        }
        if (mounted) setGame(data)
      } catch (err) {
        console.error('Fetch Game Error:', err)
        navigate(ROUTES.MYPAGE)
      } finally {
        if (mounted) setIsFetching(false)
      }
    }
    fetchGame()
    
    return () => { mounted = false }
  }, [id, user, navigate])

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
      let thumbnailUrl = game.thumbnailUrl || null
      if (thumbnailFile) {
        thumbnailUrl = await storageService.uploadThumbnail(thumbnailFile, userId)
      }

      await gameService.updateGame(id, {
        ...form,
        thumbnailUrl: thumbnailUrl
      })

      navigate(ROUTES.MYPAGE)
    } catch (err) {
      console.error('Game Update Error:', err)
      setErrorMessage(getErrorMessage(err, MESSAGES.ERROR.EDIT))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isFetching) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ゲームを編集する</h1>
        <p className="text-sm text-gray-500 mb-8">投稿情報を更新できます</p>

        {errorMessage && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 whitespace-pre-wrap">
            {errorMessage}
          </div>
        )}

        <GameForm
          initialValues={game}
          onSubmit={handleSubmit}
          submitLabel="保存する"
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      </div>
    </Layout>
  )
}
