import { supabase } from '../lib/supabase'

export const profileService = {
  async getProfile(userId) {
    if (!userId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle() // 406エラーを防ぎ、存在しない場合は単にnullを返す
      
    if (error) {
      console.error("profileService.getProfile error:", error)
      return null // アプリクラッシュを防ぐため無理にthrowしない
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
      
    if (error) {
      console.error("profileService.upsertProfile error:", error)
      throw error
    }
  }
}
