import { supabase } from '../lib/supabase'

export const friendService = {
  // 受信した保留中の申請一覧
  async getReceivedRequests(userId) {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id, status, created_at, sender:sender_id(id, username, public_user_id, avatar_url)')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // 送信した保留中の申請一覧
  async getSentRequests(userId) {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id, status, created_at, receiver:receiver_id(id, username, public_user_id, avatar_url)')
      .eq('sender_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // 申請の送信
  async sendRequest(senderId, receiverId) {
    if (senderId === receiverId) throw new Error("自分自身にフレンド申請はできません")
    
    // 既にフレンドか確認
    const isFriend = await this.checkFriendship(senderId, receiverId)
    if (isFriend) throw new Error("既にフレンドです")

    // 既に申請中か確認
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id, status')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .eq('status', 'pending')
      .maybeSingle()
      
    if (existing) throw new Error("既に申請済みか、相手から申請が来ています")

    const { error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: senderId, receiver_id: receiverId })
    if (error) throw error
  },

  // 申請の承認
  async acceptRequest(requestId, userOne, userTwo) {
    // 1. ステータスを accepted に更新
    const { error: reqErr } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
    if (reqErr) throw reqErr

    // 2. friendshipsテーブルに登録 (user_one_id は常に user_two_id より小さくする正規化)
    const [u1, u2] = [userOne, userTwo].sort()
    const { error: friendErr } = await supabase
      .from('friendships')
      .insert({ user_one_id: u1, user_two_id: u2 })
    
    if (friendErr && friendErr.code !== '23505') throw friendErr // 重複は無視
  },

  // 申請の拒否 または キャンセル
  async updateRequestStatus(requestId, status) {
    // status: 'rejected' or 'canceled'
    const { error } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId)
    if (error) throw error
  },

  // フレンド一覧の取得
  async getFriends(userId) {
    const { data, error } = await supabase
      .from('friendships')
      .select('id, user_one:user_one_id(id, username, public_user_id, avatar_url), user_two:user_two_id(id, username, public_user_id, avatar_url)')
      .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`)
      
    if (error) throw error
    
    // フレンド側のプロフィール情報だけを抽出して平坦化
    return data.map(f => {
      const friendProfile = f.user_one.id === userId ? f.user_two : f.user_one;
      return {
         friendship_id: f.id,
         ...friendProfile
      }
    })
  },

  // フレンド削除
  async removeFriend(friendshipId) {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
    if (error) throw error
  },

  // フレンド関係の存在チェック
  async checkFriendship(userA, userB) {
    const [u1, u2] = [userA, userB].sort()
    const { data, error } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_one_id', u1)
      .eq('user_two_id', u2)
      .maybeSingle()
    if (error) throw error
    return !!data
  }
}
