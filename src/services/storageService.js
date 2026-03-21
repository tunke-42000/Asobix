import { supabase } from '../lib/supabase'

export const storageService = {
  async uploadThumbnail(file, userId) {
    if (!userId) throw new Error('ログインしていません')
    
    // UUID + timestamp + ext configuration
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const path = `${userId}/${filename}`
    
    const { data, error } = await supabase.storage
      .from('thumbnails')
      .upload(path, file)
      
    if (error) throw error
    
    // We get the public URL and return it directly so the DB stores the full URL.
    return this.getPublicThumbnailUrl(data.path)
  },

  getPublicThumbnailUrl(path) {
    if (!path) return null
    if (path.startsWith('http')) return path
    
    const { data } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(path)
      
    return data.publicUrl
  }
}
