import { supabase } from '../lib/supabase'

export const authService = {
  async register(email, password, username) {
    // Save username into user_metadata so AuthContext can auto-create the profile later
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { username }
      }
    })
    if (error) throw error
    
    // サインアップ直後の profiles への insert は削除（RLSポリシーにより違反となるため）
    // 自動作成は AuthContext 側のセッション読み込み時に遅延実行する
    
    return data.user ?? data.session?.user
  },
  
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  },
  
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }
}
