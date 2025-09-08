package com.example.chat_service.repository;

import com.example.chat_service.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    
    @Query("{'roomId': ?0}")
    Page<Message> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);
    
    @Query("{'$or': [{'senderId': ?0, 'receiverId': ?1}, {'senderId': ?1, 'receiverId': ?0}]}")
    Page<Message> findPrivateMessagesBetweenUsers(String userId1, String userId2, Pageable pageable);
    
    @Query("{'$or': [{'senderId': ?0}, {'receiverId': ?0}]}")
    Page<Message> findMessagesByUserId(String userId, Pageable pageable);
    
    List<Message> findByRoomIdAndTypeOrderByCreatedAtDesc(String roomId, Message.MessageType type);
    
    @Query(value = "{'roomId': ?0, 'type': 'CHAT'}", count = true)
    long countMessagesByRoomId(String roomId);
}




