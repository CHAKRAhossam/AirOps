import api from "@/lib/axios-config"

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  receiverId?: string
  receiverName?: string
  roomId?: string
  timestamp: string
  type: "CHAT" | "JOIN" | "LEAVE" | "SYSTEM"
}

export interface ChatRoom {
  id: string
  name: string
  description: string
  createdBy: string
  participants: string[]
  type: "PRIVATE" | "GROUP" | "PUBLIC"
  createdAt: string
  updatedAt: string
}

export interface CreateRoomRequest {
  name: string
  description: string
  participants: string[]
  type: "PRIVATE" | "GROUP" | "PUBLIC"
}

export interface ChatUser {
  id: string
  firstName: string
  lastName: string
  role: string
  email: string
}

class ChatService {
  // Room management
  async createRoom(roomData: CreateRoomRequest): Promise<ChatRoom> {
    const response = await api.post("/chat/rooms", roomData)
    return response.data
  }

  async saveMessage(message: ChatMessage): Promise<ChatMessage> {
    const response = await api.post("/chat/messages", message)
    return response.data
  }

  async getRooms(): Promise<ChatRoom[]> {
    const response = await api.get("/chat/rooms")
    return response.data
  }

  async getRoomById(roomId: string): Promise<ChatRoom> {
    const response = await api.get(`/chat/rooms/${roomId}`)
    return response.data
  }

  async getRoomMessages(
    roomId: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: ChatMessage[]; totalElements: number }> {
    const response = await api.get(`/chat/rooms/${roomId}/messages?page=${page}&size=${size}`)
    return response.data
  }

  // User management (for participant selection)
  async getUsers(): Promise<ChatUser[]> {
    const response = await api.get("/chat/users")
    return response.data
  }

  async getUsersByRole(role: string): Promise<ChatUser[]> {
    const response = await api.get(`/chat/users/role/${role}`)
    return response.data
  }

  // WebSocket connection helper
  getWebSocketUrl(roomId?: string): string {
    const wsUrl = "ws://localhost:8222/ws"
    return roomId ? `${wsUrl}/chat/room/${roomId}` : `${wsUrl}/chat/public`
  }
}

export const chatService = new ChatService() 
