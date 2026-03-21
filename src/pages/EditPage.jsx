import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import GameForm from '../components/GameForm'

async function uploadThumbnail(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `thumbnails/${userId}/${Date.now()}.${ext}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}

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
      try {
        const docRef = doc(db, 'games', id)
        const docSnap = await getDoc(docRef)
        
        if (!docSnap.exists()) {
          navigate('/mypage')
          return
        }
        
        const data = docSnap.data()
        if (data.authorId !== user?.uid) {
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
    setLoading(true)
    setSubmitError('')
    try {
      let thumbnailUrl = game.thumbnailUrl
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile, user.uid)
      }

      const docRef = doc(db, 'games', id)
      await updateDoc(docRef, {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description || null,
        gameUrl: form.gameUrl,
        thumbnailUrl: thumbnailUrl,
        tags: form.tags,
        platform: form.platform || null,
        controls: form.controls || null,
        updatedAt: serverTimestamp(),
      })

      navigate('/mypage')
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || '保存に失敗しました。もう一度お試しください。')
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ゲームを編集する</h1>
        <p className="text-sm text-gray-500 mb-8">投稿情報を更新できます</p>

        {submitError && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
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

