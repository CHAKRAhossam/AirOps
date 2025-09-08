package com.example.chat_service.service;

import com.example.chat_service.dto.ChatMessage;
import com.example.chat_service.dto.ChatRoom;
import com.example.chat_service.dto.User;
import com.example.chat_service.entity.Message;
import com.example.chat_service.repository.MessageRepository;
import com.example.chat_service.repository.ChatRoomRepository;
import com.example.chat_service.feign.AuthServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final AuthServiceClient authServiceClient;

    public ChatMessage saveMessage(ChatMessage chatMessage) {
        chatMessage.setId(UUID.randomUUID().toString());
        chatMessage.setTimestamp(LocalDateTime.now());

        Message message = Message.builder()
                .content(chatMessage.getContent())
                .senderId(chatMessage.getSenderId())
                .senderName(chatMessage.getSenderName())
                .receiverId(chatMessage.getReceiverId())
                .receiverName(chatMessage.getReceiverName())
                .type(Message.MessageType.valueOf(chatMessage.getType().name()))
                .roomId(chatMessage.getRoomId())
                .createdAt(chatMessage.getTimestamp())
                .build();

        Message savedMessage = messageRepository.save(message);
        log.info("Message saved with ID: {}", savedMessage.getId());

        return chatMessage;
    }

    public ChatRoom createRoom(ChatRoom chatRoom) {
        chatRoom.setId(UUID.randomUUID().toString());
        chatRoom.setCreatedAt(LocalDateTime.now());
        chatRoom.setUpdatedAt(LocalDateTime.now());

        com.example.chat_service.entity.ChatRoom roomEntity = com.example.chat_service.entity.ChatRoom.builder()
                .roomId(chatRoom.getId())
                .name(chatRoom.getName())
                .description(chatRoom.getDescription())
                .createdBy(chatRoom.getCreatedBy())
                .participants(chatRoom.getParticipants())
                .type(com.example.chat_service.entity.ChatRoom.RoomType.valueOf(chatRoom.getType().name()))
                .createdAt(chatRoom.getCreatedAt())
                .updatedAt(chatRoom.getUpdatedAt())
                .build();

        com.example.chat_service.entity.ChatRoom savedRoom = chatRoomRepository.save(roomEntity);
        log.info("Chat room created: {}", savedRoom.getName());

        return chatRoom;
    }

    public List<ChatRoom> getUserRooms(String userId) {
        return chatRoomRepository.findRoomsByParticipant(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<ChatRoom> getAccessibleRooms(String userId) {
        return chatRoomRepository.findAccessibleRooms(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public Optional<ChatRoom> getRoomById(String roomId) {
        return chatRoomRepository.findByRoomId(roomId)
                .map(this::mapToDto);
    }

    public Page<ChatMessage> getRoomMessages(String roomId, Pageable pageable) {
        return messageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, pageable)
                .map(this::mapToDto);
    }

    public Page<ChatMessage> getPrivateMessages(String userId1, String userId2, Pageable pageable) {
        return messageRepository.findPrivateMessagesBetweenUsers(userId1, userId2, pageable)
                .map(this::mapToDto);
    }

    public Page<ChatMessage> getUserMessages(String userId, Pageable pageable) {
        return messageRepository.findMessagesByUserId(userId, pageable)
                .map(this::mapToDto);
    }

    public long getRoomMessageCount(String roomId) {
        return messageRepository.countMessagesByRoomId(roomId);
    }

    public List<User> getAllUsers(String bearerToken) {
        try {
            return authServiceClient.getAllUsers(bearerToken);
        } catch (Exception e) {
            log.error("Failed to get users from auth service", e);
            return new ArrayList<>();
        }
    }

    public List<User> getUsersByRole(String role, String bearerToken) {
        try {
            return authServiceClient.getUsersByRole(role, bearerToken);
        } catch (Exception e) {
            log.error("Failed to get users by role from auth service", e);
            return new ArrayList<>();
        }
    }

    private ChatMessage mapToDto(Message message) {
        return ChatMessage.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .receiverId(message.getReceiverId())
                .receiverName(message.getReceiverName())
                .type(ChatMessage.MessageType.valueOf(message.getType().name()))
                .roomId(message.getRoomId())
                .timestamp(message.getCreatedAt())
                .build();
    }

    private ChatRoom mapToDto(com.example.chat_service.entity.ChatRoom room) {
        return ChatRoom.builder()
                .id(room.getRoomId())
                .name(room.getName())
                .description(room.getDescription())
                .createdBy(room.getCreatedBy())
                .participants(room.getParticipants())
                .type(ChatRoom.RoomType.valueOf(room.getType().name()))
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}