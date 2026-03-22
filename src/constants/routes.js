export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  POST: '/post',
  MYPAGE: '/mypage',
  FRIENDS: '/friends',
  
  // Router definition paths
  EDIT_ROUTE: '/edit/:id',
  GAME_DETAIL_ROUTE: '/games/:id',

  // Path builders for Links
  buildEditPath: (id) => `/edit/${id}`,
  buildGameDetailPath: (id) => `/games/${id}`
}
