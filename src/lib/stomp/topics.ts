export const topics = {
  PLAYER_JOIN: '/user/queue/player/join',
  GAME_INIT: (roomId: string) => `/queue/game/init/${roomId}`,
  GAME_UPDATE: (roomId: string) => `/topic/game/fen/${roomId}`,
  USER_GAME_UPDATE: (roomId: string) => `/user/topic/game/fen/${roomId}`,
}