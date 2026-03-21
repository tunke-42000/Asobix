import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
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

export default function PostPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit({ form, thumbnailFile }) {
    setLoading(true)
    setSubmitError('')
    try {
      let thumbnailUrl = null
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile, user.uid)
      }

      const docRef = collection(db, 'games')
      await addDoc(docRef, {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description || null,
        gameUrl: form.gameUrl,
        thumbnailUrl: thumbnailUrl,
        tags: form.tags,
        platform: form.platform || null,
        controls: form.controls || null,
        authorId: user.uid,
        authorName: profile?.username || '名無し',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      navigate('/mypage')
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || '投稿に失敗しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ゲームを投稿する</h1>
        <p className="text-sm text-gray-500 mb-8">あなたのゲームをみんなに紹介しましょう</p>

        {submitError && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {submitError}
          </div>
        )}

        <GameForm onSubmit={handleSubmit} submitLabel="投稿する" loading={loading} />
      </div>
    </Layout>
  )
}

