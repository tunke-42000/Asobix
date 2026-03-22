import { supabase } from '../lib/supabase'

export const profileService = {
  async getProfile(userId) {
    if (!userId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, public_user_id, avatar_url')
      .eq('id', userId)
      .maybeSingle()
      
    if (error) {
      console.error("profileService.getProfile error:", error)
      return null
    }
    return data
  },

  async createProfile(userId, username, avatarUrl = null) {
    const publicUserId = 'ASB-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        public_user_id: publicUserId,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      
    if (error) {
      console.error("profileService.createProfile error:", error)
      throw error
    }
  },

  async updateUsername(userId, newUsername) {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: newUsername,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      
    if (error) {
      console.error("profileService.updateUsername error:", error)
      throw error
    }
  },

  async searchByPublicId(publicId) {
    if (!publicId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, public_user_id, avatar_url')
      .eq('public_user_id', publicId)
      .maybeSingle()
      
    if (error) throw error
    return data
  }
}
