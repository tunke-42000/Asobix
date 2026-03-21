import { supabase } from '../lib/supabase'

export const profileService = {
  async getProfile(userId) {
    if (!userId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  async upsertProfile(userId, username, avatarUrl = null) {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      
    if (error) throw error
  }
}
