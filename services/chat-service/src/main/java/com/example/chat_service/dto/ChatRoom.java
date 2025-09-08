package com.example.chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    private String id;
    private String name;
    private String description;
    private String createdBy;
    private Set<String> participants;
    private RoomType type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public enum RoomType {
        PRIVATE,
        GROUP,
        PUBLIC
    }
}




