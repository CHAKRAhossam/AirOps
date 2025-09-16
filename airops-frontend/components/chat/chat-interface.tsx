"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { chatService, ChatMessage, ChatRoom } from "@/lib/chat-service"
import { CreateRoomDialog } from "./create-room-dialog"
import { useWebSocketChat } from "@/hooks/use-websocket-chat"
import { toast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Send,
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Paperclip,
  Smile,
  Circle,
  Settings,
  Hash,
  Lock,
  Globe,
  UserPlus,
  Bell,
  Archive,
  Star,
  Pin,
  AlertTriangle,
  ChevronDown,
  Image,
  File,
  Mic,
  Info,
} from "lucide-react"

// Extended ChatMessage interface for UI
interface UIMessage extends ChatMessage {
  reactions?: { emoji: string; count: number; users: string[] }[]
  isEdited?: boolean
}

// Extended ChatRoom interface for UI
interface UIRoom extends ChatRoom {
  lastMessage?: UIMessage
  unreadCount: number
  isPinned?: boolean
  isArchived?: boolean
}

interface User {
  id: string
  name: string
  role: string
  status: "online" | "away" | "offline"
  avatar?: string
  lastSeen?: string
}

// All data now loaded dynamically from backend

export function ChatInterface() {
  const { user, token } = useAuth()
  const [activeRoom, setActiveRoom] = useState<string>("public")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [rooms, setRooms] = useState<UIRoom[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserPanel, setShowUserPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastLoadedRoomRef = useRef<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (token) {
      loadRooms()
    }
  }, [token])

  // Load messages when active room changes; avoid reloads on rooms state changes
  useEffect(() => {
    if (rooms.length > 0 && activeRoom && lastLoadedRoomRef.current !== activeRoom) {
      loadRoomMessages(activeRoom)
      lastLoadedRoomRef.current = activeRoom
    }
  }, [rooms, activeRoom])

  // Ensure an active room exists after loading
  useEffect(() => {
    if (rooms.length > 0 && !rooms.find(r => r.id === activeRoom)) {
      setActiveRoom(rooms[0].id)
    }
  }, [rooms])

  // Load users for participants/online list
  useEffect(() => {
    if (!token) return
    const loadUsers = async () => {
      try {
        const list = await chatService.getUsers()
        const uiUsers: User[] = list.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          status: "online",
        }))
        setUsers(uiUsers)
      } catch (error) {
        console.error("Failed to load users:", error)
      }
    }
    loadUsers()
  }, [token])

  const loadRooms = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const fetchedRooms = await chatService.getRooms()
      // Convert backend rooms to UI rooms
      const uiRooms: UIRoom[] = fetchedRooms.map(room => ({
        ...room,
        unreadCount: 0, // TODO: Implement unread count
        isPinned: false,
        isArchived: false,
      }))
      setRooms(uiRooms)
    } catch (error) {
      console.error("Failed to load rooms:", error)
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadRoomMessages = async (roomId: string) => {
    if (!token) return

    try {
      const response = await chatService.getRoomMessages(roomId)
      const uiMessages: UIMessage[] = response.content.map(msg => ({
        ...msg,
        roomId: msg.roomId || roomId,
        reactions: [],
        isEdited: false,
      }))
      setMessages(uiMessages)
    } catch (error) {
      console.error("Failed to load room messages:", error)
      toast({
        title: "Error",
        description: "Failed to load room messages",
        variant: "destructive",
      })
    }
  }

  const handleRoomCreated = () => {
    loadRooms()
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !token) return

    const newMessage: UIMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      content: message,
      timestamp: new Date().toISOString(),
      type: "CHAT",
      roomId: activeRoom,
      reactions: [],
      isEdited: false,
    }

    // Optimistically add message to UI
    setMessages([...messages, newMessage])
    setMessage("")

    // Update room's last message
    setRooms(
        rooms.map((room) => (room.id === activeRoom ? { ...room, lastMessage: newMessage, unreadCount: 0 } : room)),
    )

    // Send via WebSocket (fallback to HTTP if needed)
    try {
      const payload = {
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        content: newMessage.content,
        type: "CHAT" as const,
        // Only include roomId for non-public rooms
        ...(activeRoom !== 'public' ? { roomId: activeRoom } : {}),
      }
      const ok = sendWsMessage(payload)
      if (!ok) {
        await chatService.saveMessage({ ...newMessage })
        // Do not reload immediately; keep optimistic UI to avoid flicker
        // A background refresh can be triggered later if needed
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
      // Remove message from UI if failed
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getActiveRoom = () => {
    return rooms.find((room) => room.id === activeRoom)
  }

  const getRoomMessages = () => {
    // Messages state already scoped to current room
    return messages
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500"
      case "away":
        return "bg-amber-500"
      case "offline":
        return "bg-slate-400"
      default:
        return "bg-slate-400"
    }
  }

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "PUBLIC":
        return <Globe className="h-4 w-4 text-emerald-600" />
      case "PRIVATE":
        return <Lock className="h-4 w-4 text-slate-600" />
      case "GROUP":
        return <Hash className="h-4 w-4 text-blue-600" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
  }

  const getRoleColor = (role: string) => {
    const colors = {
      PILOT: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      CO_PILOT: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white",
      FLIGHT_ATTENDANT: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
      GROUND_STAFF: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
      ADMINISTRATIVE: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  const filteredRooms = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentRoom = getActiveRoom()
  const roomMessages = getRoomMessages()
  const onlineUsers = users.filter(u => u.status === "online")

  // WebSocket handlers
  const onMessageReceived = (chatMsg: ChatMessage) => {
    const targetRoom = chatMsg.roomId || 'public'
    const uiMsg: UIMessage = { ...chatMsg, reactions: [], isEdited: false, roomId: targetRoom }
    // Update last message for the room
    setRooms(prev => prev.map(r => r.id === targetRoom ? { ...r, lastMessage: uiMsg, unreadCount: r.id === activeRoom ? 0 : (r.unreadCount || 0) + (r.id === activeRoom ? 0 : 1) } : r))
    // If message is for current room, append; do not clear/replace list
    if (targetRoom === activeRoom) {
      setMessages(prev => [...prev, uiMsg])
    }
  }

  const onUserJoined = (msg: ChatMessage) => {
    // Optionally show a system message or toast; no-op for now
  }

  const onUserLeft = (msg: ChatMessage) => {
    // Optionally show a system message or toast; no-op for now
  }

  const onTypingStart = (msg: ChatMessage) => {
    if (msg.senderId === user?.id) return
    setIsTyping(prev => prev.includes(msg.senderName) ? prev : [...prev, msg.senderName])
  }

  const onTypingStop = (msg: ChatMessage) => {
    setIsTyping(prev => prev.filter(name => name !== msg.senderName))
  }

  const { sendMessage: sendWsMessage, sendTypingNotification } = useWebSocketChat({
    roomId: activeRoom,
    onMessageReceived,
    onUserJoined,
    onUserLeft,
    onTypingStart,
    onTypingStop,
  })

  return (
      <div className="h-full flex bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Left Sidebar - Rooms List */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300 shadow-lg`}>
          {/* Rooms Header */}
          <div className="p-4 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-bold text-white ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                Chat Rooms
              </h2>
              <div className="flex items-center gap-2">
                <CreateRoomDialog onRoomCreated={handleRoomCreated} />
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-90' : ''}`} />
                </Button>
              </div>
            </div>
            {!sidebarCollapsed && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input
                      placeholder="Search rooms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                  />
                </div>
            )}
          </div>

          {/* Rooms List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-slate-500">Loading rooms...</div>
                  </div>
              ) : filteredRooms.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-slate-500">No rooms available</div>
                  </div>
              ) : (
                  filteredRooms.map((room) => (
                      <div
                          key={room.id}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md ${
                              activeRoom === room.id
                                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md"
                                  : "hover:bg-slate-50"
                          } ${sidebarCollapsed ? 'p-2' : 'p-3'}`}
                          onClick={() => {
                            setActiveRoom(room.id)
                            // message loading handled by effect
                          }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                              {getRoomIcon(room.type)}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-slate-900 truncate">{room.name}</span>
                                    {room.isPinned && <Pin className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                                  </div>
                                  <p className="text-xs text-slate-500 mb-1 line-clamp-1">{room.description}</p>
                                  {room.lastMessage && (
                                      <div className="text-xs text-slate-600">
                                        <span className="font-medium">{room.lastMessage.senderName}:</span>{" "}
                                        <span className="text-slate-500 truncate">{room.lastMessage.content}</span>
                                      </div>
                                  )}
                                </div>
                            )}
                          </div>
                          {room.unreadCount > 0 && (
                              <Badge className="h-5 min-w-[20px] px-1.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-xs flex items-center justify-center animate-pulse">
                                {room.unreadCount}
                              </Badge>
                          )}
                        </div>
                      </div>
                  ))
              )}
            </div>
          </ScrollArea>

          {/* Online Users Footer */}
          {!sidebarCollapsed && (
              <div className="p-4 border-t border-slate-200/60 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Online Users</span>
                  <Badge variant="secondary" className="text-xs">
                    {onlineUsers.length}
                  </Badge>
                </div>
                <div className="flex -space-x-2">
                  {onlineUsers.slice(0, 5).map((user) => (
                      <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                        <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                  ))}
                  {onlineUsers.length > 5 && (
                      <div className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">+{onlineUsers.length - 5}</span>
                      </div>
                  )}
                </div>
              </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50">
                  {currentRoom && getRoomIcon(currentRoom.type)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">{currentRoom?.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>{currentRoom?.participants.length} participants</span>
                    {isTyping.length > 0 && (
                        <span className="ml-2 text-blue-600 animate-pulse">
                          • {isTyping.join(", ")} {isTyping.length === 1 ? "is" : "are"} typing...
                        </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Action Buttons */}
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-blue-50">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-blue-50">
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-blue-50"
                    onClick={() => setShowUserPanel(!showUserPanel)}
                >
                  <Info className="h-4 w-4" />
                </Button>

                {/* Unread Messages Alert */}
                {currentRoom?.unreadCount && currentRoom.unreadCount > 0 && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-full animate-bounce">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">{currentRoom.unreadCount}</span>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-gradient-to-b from-slate-50 to-white overflow-hidden relative">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {roomMessages.map((msg, index) => {
                  const showDate =
                      index === 0 || formatDate(msg.timestamp) !== formatDate(roomMessages[index - 1].timestamp)
                  const isCurrentUser = msg.senderId === user?.id || msg.senderId === "current"
                  const showAvatar = !isCurrentUser && (index === 0 || roomMessages[index - 1].senderId !== msg.senderId)

                  // Hide JOIN messages, show LEAVE/SYSTEM succinctly
                  if (msg.type === "JOIN") {
                    return null
                  } else if (msg.type !== "CHAT") {
                    return (
                      <div key={msg.id} className="animate-fadeIn">
                        {showDate && (
                          <div className="flex items-center justify-center my-6">
                            <div className="bg-white/80 backdrop-blur-sm text-slate-600 text-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                              {formatDate(msg.timestamp)}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-center my-2">
                          <div className="text-xs text-slate-500">
                            {msg.type === "LEAVE" && `${msg.senderName} left the chat`}
                            {msg.type === "SYSTEM" && (msg.content || "")}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                      <div key={msg.id} className="animate-fadeIn">
                        {showDate && (
                            <div className="flex items-center justify-center my-6">
                              <div className="bg-white/80 backdrop-blur-sm text-slate-600 text-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                                {formatDate(msg.timestamp)}
                              </div>
                            </div>
                        )}

                        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} items-end gap-3 group`}>
                          {!isCurrentUser && showAvatar && (
                              <Avatar className="h-8 w-8 mb-1 shadow-md">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                                  {getInitials(msg.senderName)}
                                </AvatarFallback>
                              </Avatar>
                          )}

                          <div className={`flex flex-col max-w-xs sm:max-w-md lg:max-w-lg ${isCurrentUser ? "items-end" : "items-start"}`}>
                            {!isCurrentUser && showAvatar && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-700">{msg.senderName}</span>
                                  <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                                </div>
                            )}

                            <div
                                className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                                    isCurrentUser
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                                        : "bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-md"
                                }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                              {msg.isEdited && (
                                  <span className={`text-xs mt-1 block opacity-75 ${isCurrentUser ? "text-blue-100" : "text-slate-500"}`}>
                                    edited
                                  </span>
                              )}
                            </div>

                            {isCurrentUser && (
                                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                                </div>
                            )}
                          </div>

                          {isCurrentUser && (
                              <Avatar className="h-8 w-8 mb-1 shadow-md">
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold">
                                  {user ? getInitials(`${user.firstName} ${user.lastName}`) : "U"}
                                </AvatarFallback>
                              </Avatar>
                          )}
                        </div>
                      </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Message Input */}
          <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200/60">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-11 w-11 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-11 w-11 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl">
                <Image className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                    placeholder={`Message ${currentRoom?.name}...`}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      // typing notifications (debounced)
                      try {
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                        // Start typing
                        // Note: sendTypingNotification is provided by hook via closure
                        // We call it only when there's content
                        if (e.target.value.trim()) {
                          sendTypingNotification(true, activeRoom !== 'public' ? activeRoom : undefined)
                          typingTimeoutRef.current = setTimeout(() => {
                            sendTypingNotification(false, activeRoom !== 'public' ? activeRoom : undefined)
                          }, 1500)
                        } else {
                          sendTypingNotification(false, activeRoom !== 'public' ? activeRoom : undefined)
                        }
                      } catch {}
                    }}
                    onKeyPress={handleKeyPress}
                    className="h-12 pr-16 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/50 backdrop-blur-sm shadow-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 rounded-lg"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 rounded-lg"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="sm"
                  className={`h-11 w-11 p-0 rounded-xl transition-all duration-200 ${
                      message.trim()
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                          : "bg-slate-300 cursor-not-allowed"
                  }`}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - User Info (when toggled) */}
        {showUserPanel && (
            <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-slate-200/60 flex flex-col shadow-lg">
              <div className="p-4 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Room Info</h3>
                  <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowUserPanel(false)}
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Room Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">About</h4>
                    <p className="text-sm text-slate-600">{currentRoom?.description}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Created {formatDate(currentRoom?.createdAt || '')}</span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">Participants ({currentRoom?.participants.length})</h4>
                    <div className="space-y-2">
                      {currentRoom?.participants.map(participantId => {
                        const participant = users.find(u => u.id === participantId)
                        if (!participant) return null

                        return (
                            <div key={participant.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                                    {getInitials(participant.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-slate-900 truncate">{participant.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${getRoleColor(participant.role)} border-0`}>
                                    {participant.role.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-xs text-slate-500 capitalize">{participant.status}</span>
                                </div>
                              </div>
                            </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">Actions</h4>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50">
                        <Pin className="h-4 w-4" />
                        Pin Room
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50">
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:bg-slate-50">
                        <Star className="h-4 w-4" />
                        Add to Favorites
                      </Button>
                    </div>
                  </div>

                  {/* Media & Files */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">Media & Files</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Placeholder for media thumbnails */}
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                            <File className="h-6 w-6 text-slate-400" />
                          </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50">
                      View All Media
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
        )}
      </div>
  )
}