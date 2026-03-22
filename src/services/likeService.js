import { supabase } from '../lib/supabase'

export const likeService = {
  async toggleLike(gameId, userId, isCurrentlyLiked) {
    if (!userId) throw new Error('ログインが必要です')

    if (isCurrentlyLiked) {
      // いいね解除
      const { error } = await supabase
        .from('game_likes')
        .delete()
        .eq('game_id', gameId)
        .eq('user_id', userId)
        
      if (error) throw error
      return false // 新しい状態: いいねしていない
    } else {
      // いいね追加
      const { error } = await supabase
        .from('game_likes')
        .insert({ game_id: gameId, user_id: userId })
        
      // すでにいいね済みのユニーク制約エラー(23505)は無視する
      if (error && error.code !== '23505') throw error
      return true // 新しい状態: いいねしている
    }
  }
}
