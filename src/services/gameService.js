import { supabase } from '../lib/supabase'

function mapRowToModel(row) {
  if (!row) return null
  return {
    id: row.id,
    authorId: row.user_id,
    authorName: row.profiles?.username || '名無し',
    title: row.title,
    shortDescription: row.short_description || '',
    description: row.description || '',
    gameUrl: row.game_url,
    thumbnailUrl: row.thumbnail_url,
    tags: row.tags || [],
    platform: row.platform || '',
    controls: row.controls || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const gameService = {
  async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data.map(mapRowToModel)
  },

  async getGameById(id) {
    const { data, error } = await supabase
      .from('games')
      .select('*, profiles(username, avatar_url)')
      .eq('id', id)
      .single()
      
    if (error) throw error
    return mapRowToModel(data)
  },

  async getGamesByUser(userId) {
    const { data, error } = await supabase
      .from('games')
      .select('*, profiles(username, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data.map(mapRowToModel)
  },

  async createGame(gameData) {
    // Map camelCase to snake_case for DB
    const insertData = {
      user_id: gameData.authorId,
      title: gameData.title,
      short_description: gameData.shortDescription,
      description: gameData.description || '',
      game_url: gameData.gameUrl,
      thumbnail_url: gameData.thumbnailUrl,
      tags: gameData.tags || [],
      platform: gameData.platform || '',
      controls: gameData.controls || ''
    }

    const { data, error } = await supabase
      .from('games')
      .insert(insertData)
      .select()
      .single()
      
    if (error) throw error
    return mapRowToModel(data)
  },

  async updateGame(id, gameData) {
    const updatePayload = {
      title: gameData.title,
      short_description: gameData.shortDescription,
      description: gameData.description || '',
      game_url: gameData.gameUrl,
      thumbnail_url: gameData.thumbnailUrl,
      tags: gameData.tags || [],
      platform: gameData.platform || '',
      controls: gameData.controls || ''
      // updated_at is handled by DB trigger
    }

    const { data, error } = await supabase
      .from('games')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return mapRowToModel(data)
  },

  async deleteGame(id) {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  }
}
