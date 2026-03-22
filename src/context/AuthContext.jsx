import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // ログイン後 または セッション復旧時にプロフィールが存在しなければ自動作成する
    const loadProfile = async (sessionUser) => {
      try {
        let prof = await profileService.getProfile(sessionUser.id)
        if (!prof) {
          // authService.register 時に設定した user_metadata.username を使用
          const username = sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0] || 'User'
          await profileService.upsertProfile(sessionUser.id, username)
          prof = await profileService.getProfile(sessionUser.id)
        }
        return prof
      } catch (err) {
        console.error('Error loading/creating profile:', err)
        return null
      }
    }

    const initSession = async () => {
      try {
        const session = await authService.getCurrentSession()
        if (mounted) {
          setUser(session?.user || null)
          if (session?.user) {
            const prof = await loadProfile(session.user)
            if (mounted) setProfile(prof || null)
          }
        }
      } catch (e) {
        console.error('Session init error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initSession()

    // Listen to token refresh or auth sign in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      setUser(session?.user || null)
      if (session?.user) {
        const prof = await loadProfile(session.user)
        if (mounted) setProfile(prof || null)
      } else {
        if (mounted) setProfile(null)
      }
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email, password, username) {
    return await authService.register(email, password, username)
  }

  async function signIn(email, password) {
    return await authService.login(email, password)
  }

  async function signOut() {
    await authService.logout()
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
