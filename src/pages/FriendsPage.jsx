import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { friendService } from '../services/friendService'
import { profileService } from '../services/profileService'
import { ROUTES } from '../constants/routes'
import Layout from '../components/Layout'

export default function FriendsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('list') // list, add, requests
  
  const [friends, setFriends] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [isFetching, setIsFetching] = useState(true)

  const [searchId, setSearchId] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' })

  const loadData = async () => {
    if (!user) return
    setIsFetching(true)
    try {
      const [fData, rReq, sReq] = await Promise.all([
        friendService.getFriends(user.id),
        friendService.getReceivedRequests(user.id),
        friendService.getSentRequests(user.id)
      ])
      setFriends(fData)
      setReceivedRequests(rReq)
      setSentRequests(sReq)
    } catch (err) {
      console.error("Error loading friend data:", err)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchId.trim()) return
    setIsSearching(true)
    setSearchError('')
    setSearchResult(null)
    setActionMessage({text: '', type: ''})

    try {
      const result = await profileService.searchByPublicId(searchId.trim().toUpperCase())
      if (!result) {
        setSearchError('ユーザーが見つかりませんでした。IDを確認してください。')
      } else if (result.id === user.id) {
        setSearchError('自分自身を検索しています')
        setSearchResult(result) // show anyway but disable adding conceptually
      } else {
        setSearchResult(result)
      }
    } catch (err) {
      setSearchError('検索中にエラーが発生しました')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (receiverId) => {
    try {
      await friendService.sendRequest(user.id, receiverId)
      setActionMessage({ text: 'フレンド申請を送信しました！', type: 'success' })
      setSearchResult(null)
      setSearchId('')
      loadData()
    } catch (err) {
      setActionMessage({ text: err.message || '申請に失敗しました', type: 'error' })
    }
  }

  const handleAccept = async (requestId, senderId) => {
    try {
      await friendService.acceptRequest(requestId, senderId, user.id)
      loadData()
    } catch (err) {
      alert(err.message || '承認に失敗しました')
    }
  }

  const handleReject = async (requestId) => {
    if(!window.confirm('この申請を拒否しますか？')) return
    try {
      await friendService.updateRequestStatus(requestId, 'rejected')
      loadData()
    } catch (err) {
      alert('拒否に失敗しました')
    }
  }

  const handleCancel = async (requestId) => {
    if(!window.confirm('申請を取り消しますか？')) return
    try {
      await friendService.updateRequestStatus(requestId, 'canceled')
      loadData()
    } catch (err) {
      alert('取り消しに失敗しました')
    }
  }

  const handleRemoveFriend = async (friendshipId, username) => {
    if(!window.confirm(`本当に ${username} さんとのフレンドを解除しますか？`)) return
    try {
      await friendService.removeFriend(friendshipId)
      loadData()
    } catch (err) {
      alert('解除に失敗しました')
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-2 space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">フレンド管理</h1>
            <p className="text-gray-500 mt-1">フレンド追加やリクエストを管理します</p>
          </div>
          <Link to={ROUTES.MYPAGE} className="text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-xl font-bold transition">
            マイページに戻る
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-full overflow-x-auto">
          <button onClick={() => setActiveTab('list')} className={`flex-1 py-3 px-4 font-bold text-sm rounded-lg whitespace-nowrap transition-all ${activeTab === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            フレンド一覧 <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{friends.length}</span>
          </button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-3 px-4 font-bold text-sm rounded-lg whitespace-nowrap transition-all ${activeTab === 'add' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            ➕フレンド追加
          </button>
          <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 px-4 font-bold text-sm rounded-lg whitespace-nowrap transition-all ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            申請リスト 
            {receivedRequests.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{receivedRequests.length}</span>}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 min-h-[400px]">
          
          {/* TAB: LIST */}
          {activeTab === 'list' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">フレンド一覧</h2>
              {isFetching ? (
                <div className="text-center py-10 text-gray-400 font-bold animate-pulse">読み込み中...</div>
              ) : friends.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-500 font-bold">まだフレンドがいません</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map(f => (
                    <div key={f.friendship_id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:shadow-md transition bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white text-blue-500 font-bold rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100">
                          {f.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{f.username}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{f.public_user_id}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveFriend(f.friendship_id, f.username)} className="text-sm font-bold text-red-500 bg-white px-3 py-1.5 border border-red-100 hover:bg-red-50 rounded-lg transition shadow-sm">
                        解除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADD */}
          {activeTab === 'add' && (
            <div className="max-w-lg mx-auto py-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">ユーザーIDで探す</h2>
              <p className="text-sm text-gray-500 text-center mb-8">お互いのID（ASB-XXXXXX）を入力してフレンド申請を送れます</p>
              
              <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <input
                  type="text"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  placeholder="ASB-XXXXXX"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-center focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition uppercase uppercase"
                />
                <button type="submit" disabled={isSearching || !searchId} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm shadow-blue-200">
                  検索
                </button>
              </form>

              {searchError && (
                <div className="bg-red-50 text-red-600 font-bold px-4 py-3 rounded-xl text-center text-sm mb-6">{searchError}</div>
              )}
              {actionMessage.text && (
                <div className={`font-bold px-4 py-3 rounded-xl text-center text-sm mb-6 ${actionMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                  {actionMessage.text}
                </div>
              )}

              {searchResult && searchResult.id !== user.id && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center shadow-inner">
                  <div className="w-20 h-20 bg-white text-blue-500 font-bold rounded-full flex items-center justify-center text-4xl shadow-sm border border-gray-100 mx-auto mb-4">
                    {searchResult.username[0]?.toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{searchResult.username}</h3>
                  <p className="text-gray-500 font-mono text-sm mb-6">{searchResult.public_user_id}</p>
                  <button onClick={() => handleSendRequest(searchResult.id)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
                    フレンド申請を送る
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: REQUESTS */}
          {activeTab === 'requests' && (
             <div className="space-y-12">
               <div>
                 <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">受信した申請 <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{receivedRequests.length}</span></h2>
                 {receivedRequests.length === 0 ? (
                   <p className="text-gray-500 bg-gray-50 py-10 text-center rounded-2xl font-bold border border-gray-100 border-dashed">リクエストはありません</p>
                 ) : (
                   <div className="space-y-3">
                     {receivedRequests.map(req => (
                       <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white shadow-sm gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 font-bold rounded-full flex items-center justify-center text-xl">
                              {req.sender.username[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{req.sender.username}</p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">{req.sender.public_user_id}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => handleAccept(req.id, req.sender.id)} className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-sm">承認する</button>
                            <button onClick={() => handleReject(req.id)} className="flex-1 sm:flex-none px-6 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold text-sm border border-gray-200 hover:border-red-200 rounded-xl transition">拒否</button>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               <div>
                 <h2 className="text-xl font-bold text-gray-900 mb-4 border-t pt-8">送信した申請</h2>
                 {sentRequests.length === 0 ? (
                   <p className="text-gray-500 bg-gray-50 py-6 text-center rounded-xl font-bold border border-gray-100 border-dashed">送信中のリクエストはありません</p>
                 ) : (
                   <div className="space-y-3">
                     {sentRequests.map(req => (
                       <div key={req.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white text-gray-500 font-bold rounded-full flex items-center justify-center text-lg border border-gray-200">
                              {req.receiver.username[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{req.receiver.username}</p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{req.receiver.public_user_id}</p>
                            </div>
                          </div>
                          <button onClick={() => handleCancel(req.id)} className="px-4 py-2 bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 font-bold text-sm border border-gray-200 hover:border-red-200 rounded-xl transition shadow-sm">取り消し</button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          )}

        </div>
      </div>
    </Layout>
  )
}
