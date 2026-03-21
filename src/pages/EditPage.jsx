import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
// [TEMPORARILY DISABLED] Storage
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import GameForm from '../components/GameForm'

// [TEMPORARILY DISABLED] Storage Upload: Firebase料金プラン制約のため一時停止。Blazeプラン移行時に以下を有効化してください。
/*
async function uploadThumbnail(file, userId) {
  if (!userId) {
    throw new Error('ログインしていません。画像のアップロードにはログインが必要です。')
  }
  try {
    const ext = file.name.split('.').pop()
    const path = `thumbnails/${userId}/${Date.now()}.${ext}`
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadUrl = await getDownloadURL(snapshot.ref)
    return downloadUrl
  } catch (error) {
    console.error('画像アップロードに失敗しました:', error.code, error.message)
    throw new Error(`画像のアップロード処理でエラーが発生しました。(${error.code || 'unknown'})`)
  }
}
*/

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
    if (!user || !user.uid) {
      setSubmitError('ログインセッションが有効ではありません。')
      return
    }

    setLoading(true)
    setSubmitError('')
    
    try {
      let thumbnailUrl = game.thumbnailUrl || null
      
      // [TEMPORARILY DISABLED] Storage Upload: 画像処理一時停止中
      // if (thumbnailFile) {
      //   thumbnailUrl = await uploadThumbnail(thumbnailFile, user.uid)
      // }

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
      <div className="max-w-2xl mx-auto">
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


