import { supabase } from '../lib/supabase'
import { profileService } from './profileService'

export const authService = {
  async register(email, password, username) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    
    const user = data.user ?? data.session?.user
    if (user) {
      await profileService.upsertProfile(user.id, username)
    }
    return user
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
