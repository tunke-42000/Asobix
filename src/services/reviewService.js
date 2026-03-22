import { supabase } from '../lib/supabase'

export const reviewService = {
  /**
   * Fetch all reviews for a specific game
   * Ordered by newest first. Includes user profile info.
   */
  async getGameReviews(gameId) {
    const { data, error } = await supabase
      .from('game_reviews')
      .select(`
        id,
        game_id,
        user_id,
        rating,
        review_text,
        created_at,
        updated_at,
        profiles (
          id,
          username,
          avatar_url
        )
      `)
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Fetch a specific user's review for a specific game
   */
  async getUserReview(gameId, userId) {
    if (!userId) return null
    
    const { data, error } = await supabase
      .from('game_reviews')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Create a new review
   */
  async createReview(gameId, userId, rating, reviewText) {
    const { data, error } = await supabase
      .from('game_reviews')
      .insert({
        game_id: gameId,
        user_id: userId,
        rating,
        review_text: reviewText ? reviewText.trim() : null
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update an existing review
   */
  async updateReview(reviewId, rating, reviewText) {
    const { data, error } = await supabase
      .from('game_reviews')
      .update({
        rating,
        review_text: reviewText ? reviewText.trim() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete an existing review
   */
  async deleteReview(reviewId) {
    const { error } = await supabase
      .from('game_reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw error
    return true
  },

  /**
   * Get rating statistics (average and count) for a game
   */
  async getGameRatingStats(gameId) {
    // Note: In a highly scaled app, we might use an RPC or triggers.
    // For now, calculating on the fly.
    const { data, error } = await supabase
      .from('game_reviews')
      .select('rating')
      .eq('game_id', gameId)

    if (error) throw error

    if (!data || data.length === 0) {
      return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    }

    let total = 0
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    data.forEach(review => {
      total += review.rating
      distribution[review.rating] = (distribution[review.rating] || 0) + 1
    })

    return {
      average: Number((total / data.length).toFixed(1)),
      count: data.length,
      distribution
    }
  }
}
