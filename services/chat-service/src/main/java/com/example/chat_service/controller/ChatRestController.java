package com.example.chat_service.controller;

import com.example.chat_service.dto.ChatMessage;
import com.example.chat_service.dto.ChatRoom;
import com.example.chat_service.dto.User;
import com.example.chat_service.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatRestController {

    private final ChatService chatService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "chat-service");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody ChatRoom chatRoom, Authentication authentication) {
        log.info("Creating chat room: {}", chatRoom.getName());
        if (authentication != null) {
            chatRoom.setCreatedBy(authentication.getName());
        }
        ChatRoom createdRoom = chatService.createRoom(chatRoom);
        return ResponseEntity.ok(createdRoom);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoom>> getUserRooms(Authentication authentication) {
        String userId = authentication.getName();
        log.info("Getting rooms for user: {}", userId);
        List<ChatRoom> rooms = chatService.getUserRooms(userId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/rooms/accessible")
    public ResponseEntity<List<ChatRoom>> getAccessibleRooms(Authentication authentication) {
        String userId = authentication.getName();
        log.info("Getting accessible rooms for user: {}", userId);
        List<ChatRoom> rooms = chatService.getAccessibleRooms(userId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoom> getRoomById(@PathVariable String roomId) {
        log.info("Getting room by ID: {}", roomId);
        return chatService.getRoomById(roomId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessage>> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting messages for room: {}", roomId);
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = chatService.getRoomMessages(roomId, pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/messages/private/{userId1}/{userId2}")
    public ResponseEntity<Page<ChatMessage>> getPrivateMessages(
            @PathVariable String userId1,
            @PathVariable String userId2,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting private messages between {} and {}", userId1, userId2);
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = chatService.getPrivateMessages(userId1, userId2, pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/messages/user/{userId}")
    public ResponseEntity<Page<ChatMessage>> getUserMessages(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting messages for user: {}", userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = chatService.getUserMessages(userId, pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/rooms/{roomId}/message-count")
    public ResponseEntity<Long> getRoomMessageCount(@PathVariable String roomId) {
        log.info("Getting message count for room: {}", roomId);
        long count = chatService.getRoomMessageCount(roomId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> saveMessage(@RequestBody ChatMessage chatMessage) {
        log.info("Received message from {}: {}", chatMessage.getSenderName(), chatMessage.getContent());
        ChatMessage savedMessage = chatService.saveMessage(chatMessage);
        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInfo(Authentication authentication) {
        Map<String, Object> info = new HashMap<>();
        info.put("service", "chat-service");
        info.put("user", authentication != null ? authentication.getName() : "anonymous");
        info.put("features", new String[]{"WebSocket", "STOMP", "Real-time messaging", "Private messages", "Room messages", "MongoDB"});
        return ResponseEntity.ok(info);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestHeader(name = "Authorization", required = false) String token) {
        String bearer = token != null ? token : "";
        return ResponseEntity.ok(chatService.getAllUsers(bearer));
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role, @RequestHeader(name = "Authorization", required = false) String token) {
        String bearer = token != null ? token : "";
        return ResponseEntity.ok(chatService.getUsersByRole(role, bearer));
    }
}