export type User = {
  username: string
  socketId: string
  isTyping: boolean
}

export type Message = {
  sender: string
  text: string
  createdAt: string
  isTyping: boolean
}
