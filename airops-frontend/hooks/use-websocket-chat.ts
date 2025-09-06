import { useState, useRef, useEffect, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ChatMessage } from '@/lib/chat-service'
import { useAuth } from '@/contexts/auth-context'

interface UseWebSocketChatProps {
    roomId: string
    onMessageReceived: (message: ChatMessage) => void
    onUserJoined: (message: ChatMessage) => void
    onUserLeft: (message: ChatMessage) => void
    onTypingStart: (message: ChatMessage) => void
    onTypingStop: (message: ChatMessage) => void
}

export function useWebSocketChat({
                                     roomId,
                                     onMessageReceived,
                                     onUserJoined,
                                     onUserLeft,
                                     onTypingStart,
                                     onTypingStop,
                                 }: UseWebSocketChatProps) {
    const { user, token } = useAuth()
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const clientRef = useRef<Client | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 5

    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = undefined
        }
        if (clientRef.current) {
            try {
                clientRef.current.deactivate()
            } catch (error) {
                console.warn('Error during cleanup:', error)
            }
            clientRef.current = null
        }
        setIsConnected(false)
    }, [])

    const connect = useCallback(() => {
        if (!user || !token) {
            console.log('No user or token available for WebSocket connection')
            setConnectionError('Authentication required')
            return
        }

        console.log('Connecting to WebSocket...', { roomId, userId: user.id, attempt: reconnectAttempts.current + 1 })

        // Clean up any existing connection
        cleanup()

        try {
            // Create SockJS connection through gateway
            const socket = new SockJS('http://localhost:8222/ws', null, {
                transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                timeout: 30000
            })

            const stompClient = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                debug: (str) => {
                    console.log('STOMP Debug:', str)
                },
                reconnectDelay: Math.min(5000 * Math.pow(2, reconnectAttempts.current), 30000), // Exponential backoff
                heartbeatIncoming: 25000,
                heartbeatOutgoing: 25000,
            })

            stompClient.onConnect = (frame) => {
                console.log('STOMP Connected successfully:', frame)
                setIsConnected(true)
                setConnectionError(null)
                reconnectAttempts.current = 0

                try {
                    // Subscribe to public topic (always)
                    stompClient.subscribe('/topic/public', (message) => {
                        try {
                            const chatMessage = JSON.parse(message.body) as ChatMessage
                            console.log('Received public message:', chatMessage)

                            switch (chatMessage.type) {
                                case 'CHAT':
                                    onMessageReceived(chatMessage)
                                    break
                                case 'JOIN':
                                    onUserJoined(chatMessage)
                                    break
                                case 'LEAVE':
                                    onUserLeft(chatMessage)
                                    break
                            }
                        } catch (error) {
                            console.error('Error processing public message:', error)
                        }
                    })

                    // Subscribe to public typing notifications
                    stompClient.subscribe('/topic/public.typing', (message) => {
                        try {
                            const chatMessage = JSON.parse(message.body) as ChatMessage
                            if (chatMessage.senderId !== user.id) { // Don't show own typing
                                if (chatMessage.type === 'TYPING_START') {
                                    onTypingStart(chatMessage)
                                } else if (chatMessage.type === 'TYPING_STOP') {
                                    onTypingStop(chatMessage)
                                }
                            }
                        } catch (error) {
                            console.error('Error processing typing notification:', error)
                        }
                    })

                    // Subscribe to room-specific topics if not public room
                    if (roomId && roomId !== 'public') {
                        // Room messages
                        stompClient.subscribe(`/topic/room.${roomId}`, (message) => {
                            try {
                                const chatMessage = JSON.parse(message.body) as ChatMessage
                                console.log('Received room message:', chatMessage)
                                onMessageReceived(chatMessage)
                            } catch (error) {
                                console.error('Error processing room message:', error)
                            }
                        })

                        // Room typing notifications
                        stompClient.subscribe(`/topic/room.${roomId}.typing`, (message) => {
                            try {
                                const chatMessage = JSON.parse(message.body) as ChatMessage
                                if (chatMessage.senderId !== user.id) { // Don't show own typing
                                    if (chatMessage.type === 'TYPING_START') {
                                        onTypingStart(chatMessage)
                                    } else if (chatMessage.type === 'TYPING_STOP') {
                                        onTypingStop(chatMessage)
                                    }
                                }
                            } catch (error) {
                                console.error('Error processing room typing notification:', error)
                            }
                        })
                    }

                    // Subscribe to private messages
                    stompClient.subscribe(`/user/queue/private`, (message) => {
                        try {
                            const chatMessage = JSON.parse(message.body) as ChatMessage
                            console.log('Received private message:', chatMessage)
                            onMessageReceived(chatMessage)
                        } catch (error) {
                            console.error('Error processing private message:', error)
                        }
                    })

                    // Subscribe to private typing notifications
                    stompClient.subscribe(`/user/queue/typing`, (message) => {
                        try {
                            const chatMessage = JSON.parse(message.body) as ChatMessage
                            if (chatMessage.type === 'TYPING_START') {
                                onTypingStart(chatMessage)
                            } else if (chatMessage.type === 'TYPING_STOP') {
                                onTypingStop(chatMessage)
                            }
                        } catch (error) {
                            console.error('Error processing private typing notification:', error)
                        }
                    })

                    // Register session with server (UI ignores JOIN messages)
                    // Register silently without persisting JOINs
                    try {
                        stompClient.publish({
                            destination: '/app/chat.addUser',
                            body: JSON.stringify({
                                senderId: user.id,
                                senderName: `${user.firstName} ${user.lastName}`,
                                type: 'JOIN',
                                roomId: roomId === 'public' ? undefined : roomId,
                            }),
                        })
                    } catch (e) {
                        console.warn('Join announce failed (ignored):', e)
                    }

                } catch (error) {
                    console.error('Error setting up subscriptions:', error)
                    setConnectionError('Failed to set up message subscriptions')
                }
            }

            stompClient.onStompError = (frame) => {
                console.error('STOMP error:', frame)
                const errorMessage = frame.headers['message'] || 'Connection error'
                setConnectionError(`STOMP error: ${errorMessage}`)
                setIsConnected(false)
                scheduleReconnect()
            }

            stompClient.onWebSocketError = (error) => {
                console.error('WebSocket error:', error)
                setConnectionError('WebSocket connection failed')
                setIsConnected(false)
                scheduleReconnect()
            }

            stompClient.onWebSocketClose = () => {
                console.log('WebSocket connection closed')
                setIsConnected(false)
                scheduleReconnect()
            }

            stompClient.onDisconnect = () => {
                console.log('STOMP Disconnected')
                setIsConnected(false)
                scheduleReconnect()
            }

            clientRef.current = stompClient
            stompClient.activate()

        } catch (error) {
            console.error('Error creating WebSocket connection:', error)
            setConnectionError('Failed to create connection')
            scheduleReconnect()
        }
    }, [user, token, roomId, onMessageReceived, onUserJoined, onUserLeft, onTypingStart, onTypingStop, cleanup])

    const scheduleReconnect = useCallback(() => {
        if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++
            const delay = Math.min(5000 * Math.pow(2, reconnectAttempts.current - 1), 30000)
            console.log(`Scheduling reconnect attempt ${reconnectAttempts.current} in ${delay}ms`)

            reconnectTimeoutRef.current = setTimeout(() => {
                connect()
            }, delay)
        } else {
            setConnectionError('Max reconnection attempts reached. Please refresh the page.')
        }
    }, [connect])

    const disconnect = useCallback(() => {
        console.log('Disconnecting WebSocket...')
        reconnectAttempts.current = maxReconnectAttempts // Prevent reconnection
        cleanup()
        setConnectionError(null)
    }, [cleanup])

    const sendMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        if (!clientRef.current || !isConnected) {
            console.error('STOMP client not connected')
            return false
        }

        try {
            const destination = message.roomId && message.roomId !== 'public' ? '/app/chat.room' :
                message.receiverId ? '/app/chat.private' :
                    '/app/chat.sendMessage'

            clientRef.current.publish({
                destination,
                body: JSON.stringify(message),
            })
            return true
        } catch (error) {
            console.error('Failed to send message:', error)
            return false
        }
    }, [isConnected])

    const sendTypingNotification = useCallback((isTyping: boolean, targetRoomId?: string) => {
        if (!clientRef.current || !isConnected || !user) return

        const message = {
            senderId: user.id,
            senderName: `${user.firstName} ${user.lastName}`,
            content: '',
            type: isTyping ? 'TYPING_START' : 'TYPING_STOP',
            roomId: targetRoomId,
        }

        try {
            const destination = isTyping ? '/app/chat.typing' : '/app/chat.stopTyping'
            clientRef.current.publish({
                destination,
                body: JSON.stringify(message),
            })
        } catch (error) {
            console.error('Failed to send typing notification:', error)
        }
    }, [user, isConnected])

    const reconnectManually = useCallback(() => {
        reconnectAttempts.current = 0
        setConnectionError(null)
        connect()
    }, [connect])

    // Auto-connect when dependencies change
    useEffect(() => {
        connect()
        return () => {
            disconnect()
        }
    }, []) // Only run once on mount

    // Reconnect when room changes
    useEffect(() => {
        if (isConnected && clientRef.current) {
            // Just reconnect to get new room subscriptions
            connect()
        }
    }, [roomId])

    return {
        isConnected,
        connectionError,
        sendMessage,
        sendTypingNotification,
        reconnect: reconnectManually,
        disconnect,
    }
}