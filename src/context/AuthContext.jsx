import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. セッション初期化と認証状態リスナー (onAuthStateChange内で非同期処理を行わない)
  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      try {
        const session = await authService.getCurrentSession()
        if (mounted) {
          setUser(session?.user || null)
        }
      } catch (e) {
        console.error('Session init error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initSession()

    // 認証状態の変更検知 (asyncは使わず、即座にstate更新のみ行いAuth Token Lockを回避する)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 2. Userの変更を検知してプロフィールを取得・自動作成する (分離・遅延実行)
  useEffect(() => {
    let mounted = true

    const loadProfile = async (sessionUser) => {
      try {
        let prof = await profileService.getProfile(sessionUser.id)
        if (!prof) {
          // If profile doesn't exist, create it automatically
          const username = sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0] || 'User'
          await profileService.upsertProfile(sessionUser.id, username)
          prof = await profileService.getProfile(sessionUser.id)
        }
        if (mounted) setProfile(prof || null)
      } catch (err) {
        console.error('Error loading/creating profile:', err)
        // Profile取得に失敗してもアプリがクラッシュしないよう、nullにフォールバック
        if (mounted) setProfile(null)
      }
    }

    if (user) {
      loadProfile(user)
    } else {
      setProfile(null) // ログアウト時等
    }

    return () => {
      mounted = false
    }
  }, [user])

  async function signUp(email, password, username) {
    return await authService.register(email, password, username)
  }

  async function signIn(email, password) {
    return await authService.login(email, password)
  }

  async function signOut() {
    await authService.logout()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    login: signIn,
    register: signUp,
    logout: signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
