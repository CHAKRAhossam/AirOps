package com.example.chat_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Set;

@Document(collection = "chat_rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    
    @Id
    private String id;
    
    @Field("room_id")
    private String roomId;
    
    @Field("name")
    private String name;
    
    @Field("description")
    private String description;
    
    @Field("created_by")
    private String createdBy;
    
    @Field("participants")
    private Set<String> participants;
    
    @Field("type")
    private RoomType type;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    public enum RoomType {
        PRIVATE,
        GROUP,
        PUBLIC
    }
}




