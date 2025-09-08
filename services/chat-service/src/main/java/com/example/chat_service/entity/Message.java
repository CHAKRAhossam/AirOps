package com.example.chat_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    private String id;
    
    @Field("content")
    private String content;
    
    @Field("sender_id")
    private String senderId;
    
    @Field("sender_name")
    private String senderName;
    
    @Field("receiver_id")
    private String receiverId;
    
    @Field("receiver_name")
    private String receiverName;
    
    @Field("type")
    private MessageType type;
    
    @Field("room_id")
    private String roomId;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        TYPING,
        STOP_TYPING
    }
}




