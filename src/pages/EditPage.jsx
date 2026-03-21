import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gameService } from '../services/gameService'
import { storageService } from '../services/storageService'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import GameForm from '../components/GameForm'

export default function EditPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function fetchGame() {
      if (!user) {
        setFetching(false)
        return
      }
      const userId = user.id || user.uid
      
      try {
        const data = await gameService.getGameById(id)
        if (!data || data.authorId !== userId) {
          navigate('/mypage')
          return
        }
        setGame(data)
      } catch (err) {
        console.error(err)
        navigate('/mypage')
      } finally {
        setFetching(false)
      }
    }
    fetchGame()
  }, [id, user, navigate])

  async function handleSubmit({ form, thumbnailFile }) {
    if (!user || (!user.id && !user.uid)) {
      setSubmitError('ログインセッションが有効ではありません。')
      return
    }
    
    const userId = user.id || user.uid

    setLoading(true)
    setSubmitError('')
    
    try {
      let thumbnailUrl = game.thumbnailUrl || null
      
      if (thumbnailFile) {
        thumbnailUrl = await storageService.uploadThumbnail(thumbnailFile, userId)
      }

      await gameService.updateGame(id, {
        ...form,
        thumbnailUrl: thumbnailUrl
      })

      navigate('/mypage')
    } catch (err) {
      console.error('Game Update Error:', err)
      setSubmitError(err.message || '保存に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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

        {submitError && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 whitespace-pre-wrap">
            {submitError}
          </div>
        )}

        <GameForm
          initialValues={game}
          onSubmit={handleSubmit}
          submitLabel="保存する"
          loading={loading}
        />
      </div>
    </Layout>
  )
}
