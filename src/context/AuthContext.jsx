import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      // currentUser.uid が確実に存在する場合のみ fetchProfile を実行
      if (currentUser && currentUser.uid) {
        await fetchProfile(currentUser.uid)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const docRef = doc(db, 'profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        setProfile(docSnap.data())
      } else {
        // ドキュメントが見つからない場合は null でフェールバック
        setProfile(null)
      }
    } catch (e) {
      // 原因がすぐ分かるようにエラーコードとメッセージを出力
      console.error('Error fetching profile:', e.code, e.message)
      // オフラインや権限エラー発生時も、UIが壊れないよう null をセットして処理続行
      setProfile(null)
    } finally {
      // 成功でも失敗でも最終的に確実に loading を解除する
      setLoading(false)
    }
  }

  async function signUp(email, password, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    await setDoc(doc(db, 'profiles', user.uid), {
      username,
      createdAt: new Date().toISOString()
    })
    return user
  }

  async function signIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
