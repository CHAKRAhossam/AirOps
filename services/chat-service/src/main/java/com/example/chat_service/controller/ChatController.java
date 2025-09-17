package com.example.chat_service.controller;

import com.example.chat_service.dto.ChatMessage;
import com.example.chat_service.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // Track connected users with their roles
    private final ConcurrentHashMap<String, UserInfo> connectedUsers = new ConcurrentHashMap<>();

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        UserInfo userInfo = connectedUsers.get(sessionId);

        if (userInfo != null) {
            chatMessage.setSenderId(userInfo.getUserId());
            chatMessage.setSenderName(userInfo.getUsername());
        }

        // Set timestamp and ID if not present
        if (chatMessage.getId() == null || chatMessage.getId().isEmpty()) {
            chatMessage.setId(UUID.randomUUID().toString());
        }
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }

        log.info("Received public message from {}: {}", chatMessage.getSenderName(), chatMessage.getContent());

        // Save message to database
        try {
            chatService.saveMessage(chatMessage);
        } catch (Exception e) {
            log.error("Failed to save message to database", e);
        }

        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String userId = chatMessage.getSenderId();
        String username = chatMessage.getSenderName();

        // Add user info to web socket session
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("userId", userId);
        headerAccessor.getSessionAttributes().put("sessionId", sessionId);

        // Track connected user
        UserInfo userInfo = new UserInfo(userId, username, "USER");
        connectedUsers.put(sessionId, userInfo);

        // Set message properties
        if (chatMessage.getId() == null || chatMessage.getId().isEmpty()) {
            chatMessage.setId(UUID.randomUUID().toString());
        }
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }
        chatMessage.setType(ChatMessage.MessageType.JOIN);

        log.info("User joined: {} (Session: {}, Total users: {})", username, sessionId, connectedUsers.size());

        // Do not persist JOIN messages to reduce noise

        return chatMessage;
    }

    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        UserInfo userInfo = connectedUsers.get(sessionId);

        if (userInfo != null) {
            chatMessage.setSenderId(userInfo.getUserId());
            chatMessage.setSenderName(userInfo.getUsername());
        }

        // Set message properties
        if (chatMessage.getId() == null || chatMessage.getId().isEmpty()) {
            chatMessage.setId(UUID.randomUUID().toString());
        }
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }

        log.info("Private message from {} to {}", chatMessage.getSenderName(), chatMessage.getReceiverName());

        // Save private message
        try {
            chatService.saveMessage(chatMessage);
        } catch (Exception e) {
            log.error("Failed to save private message to database", e);
        }

        // Send to specific user
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiverId(),
                "/queue/private",
                chatMessage
        );
    }

    @MessageMapping("/chat.room")
    public void sendRoomMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        UserInfo userInfo = connectedUsers.get(sessionId);

        if (userInfo != null) {
            chatMessage.setSenderId(userInfo.getUserId());
            chatMessage.setSenderName(userInfo.getUsername());
        }

        // Set message properties
        if (chatMessage.getId() == null || chatMessage.getId().isEmpty()) {
            chatMessage.setId(UUID.randomUUID().toString());
        }
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }

        log.info("Room message in {}: {} from {}", chatMessage.getRoomId(), chatMessage.getContent(), chatMessage.getSenderName());

        // Save room message
        try {
            chatService.saveMessage(chatMessage);
        } catch (Exception e) {
            log.error("Failed to save room message to database", e);
        }

        // Send to room topic
        messagingTemplate.convertAndSend("/topic/room." + chatMessage.getRoomId(), chatMessage);
    }

    @MessageMapping("/chat.typing")
    public void sendTypingNotification(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        UserInfo userInfo = connectedUsers.get(sessionId);

        if (userInfo != null) {
            chatMessage.setSenderId(userInfo.getUserId());
            chatMessage.setSenderName(userInfo.getUsername());
        }

        // Set message properties for typing notification
        chatMessage.setType(ChatMessage.MessageType.TYPING_START);
        chatMessage.setTimestamp(LocalDateTime.now());

        log.debug("Typing notification from {} in room {}", chatMessage.getSenderName(), chatMessage.getRoomId());

        if (chatMessage.getRoomId() != null && !chatMessage.getRoomId().isEmpty()) {
            // Room typing notification
            messagingTemplate.convertAndSend("/topic/room." + chatMessage.getRoomId() + ".typing", chatMessage);
        } else if (chatMessage.getReceiverId() != null) {
            // Private typing notification
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getReceiverId(),
                    "/queue/typing",
                    chatMessage
            );
        } else {
            // Public typing notification
            messagingTemplate.convertAndSend("/topic/public.typing", chatMessage);
        }
    }

    @MessageMapping("/chat.stopTyping")
    public void sendStopTypingNotification(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        UserInfo userInfo = connectedUsers.get(sessionId);

        if (userInfo != null) {
            chatMessage.setSenderId(userInfo.getUserId());
            chatMessage.setSenderName(userInfo.getUsername());
        }

        // Set message properties for stop typing notification
        chatMessage.setType(ChatMessage.MessageType.TYPING_STOP);
        chatMessage.setTimestamp(LocalDateTime.now());

        log.debug("Stop typing notification from {} in room {}", chatMessage.getSenderName(), chatMessage.getRoomId());

        if (chatMessage.getRoomId() != null && !chatMessage.getRoomId().isEmpty()) {
            // Room stop typing notification
            messagingTemplate.convertAndSend("/topic/room." + chatMessage.getRoomId() + ".typing", chatMessage);
        } else if (chatMessage.getReceiverId() != null) {
            // Private stop typing notification
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getReceiverId(),
                    "/queue/typing",
                    chatMessage
            );
        } else {
            // Public stop typing notification
            messagingTemplate.convertAndSend("/topic/public.typing", chatMessage);
        }
    }

    // Handle user disconnection
    @MessageMapping("/chat.disconnect")
    public void handleDisconnect(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        UserInfo userInfo = connectedUsers.remove(sessionId);

        if (userInfo != null) {
            log.info("User disconnected: {} (Session: {}, Remaining users: {})",
                    userInfo.getUsername(), sessionId, connectedUsers.size());

            // Broadcast leave message
            ChatMessage leaveMessage = ChatMessage.builder()
                    .id(UUID.randomUUID().toString())
                    .senderId(userInfo.getUserId())
                    .senderName(userInfo.getUsername())
                    .content(userInfo.getUsername() + " left the chat")
                    .type(ChatMessage.MessageType.LEAVE)
                    .timestamp(LocalDateTime.now())
                    .build();

            messagingTemplate.convertAndSend("/topic/public", leaveMessage);

            // Do not persist LEAVE messages
        }
    }

    // Helper class to store user information
    private static class UserInfo {
        private final String userId;
        private final String username;
        private final String role;

        public UserInfo(String userId, String username, String role) {
            this.userId = userId;
            this.username = username;
            this.role = role;
        }

        public String getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getRole() { return role; }
    }
}