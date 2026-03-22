import { supabase } from '../lib/supabase'

function parsePlatform(p) {
  if (!p) return []
  try {
    const parsed = JSON.parse(p)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // JSONパースに失敗した場合（過去の自由入力データ等）はカンマやスラッシュで分割して配列化
    return p.split(/[,/]/).map(s => s.trim()).filter(Boolean)
  }
  return []
}

function mapRowToModel(row) {
  if (!row) return null
  const likes = row.game_likes || []
  const reviews = row.game_reviews || []
  
  let averageRating = 0
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
    averageRating = Number((sum / reviews.length).toFixed(1))
  }

  return {
    id: row.id,
    authorId: row.user_id,
    authorName: row.profiles?.username || '名無し',
    authorAvatarUrl: row.profiles?.avatar_url || null,
    title: row.title,
    shortDescription: row.short_description || '',
    description: row.description || '',
    gameUrl: row.game_url,
    thumbnailUrl: row.thumbnail_url,
    tags: row.tags || [],
    platform: parsePlatform(row.platform),
    controls: row.controls || '',
    likeCount: likes.length,
    likedUserIds: likes.map(l => l.user_id),
    reviewCount: reviews.length,
    averageRating: averageRating,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const gameService = {
  async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*, profiles(username, avatar_url), game_likes(user_id), game_reviews(rating)')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data.map(mapRowToModel)
  },

  async getGameById(id) {
    const { data, error } = await supabase
      .from('games')
      .select('*, profiles(username, avatar_url), game_likes(user_id), game_reviews(rating)')
      .eq('id', id)
      .single()
      
    if (error) throw error
    return mapRowToModel(data)
  },

  async getGamesByUser(userId) {
    const { data, error } = await supabase
      .from('games')
      .select('*, profiles(username, avatar_url), game_likes(user_id), game_reviews(rating)')
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
      platform: JSON.stringify(gameData.platform || []),
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
      platform: JSON.stringify(gameData.platform || []),
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
