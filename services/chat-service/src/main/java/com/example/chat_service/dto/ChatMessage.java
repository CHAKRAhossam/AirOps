package com.example.chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String id;
    private String content;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
    private MessageType type;
    private String roomId;
    private LocalDateTime timestamp;
    
    public enum MessageType {
        CHAT,        // Regular chat message
        JOIN,        // User joined notification
        LEAVE,       // User left notification
        SYSTEM,      // System message
        TYPING_START, // User started typing
        TYPING_STOP
    }
}




