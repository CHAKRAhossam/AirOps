package com.example.chat_service.repository;

import com.example.chat_service.entity.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    
    Optional<ChatRoom> findByRoomId(String roomId);
    
    @Query("{'participants': ?0}")
    List<ChatRoom> findRoomsByParticipant(String userId);
    
    @Query("{'$or': [{'type': 'PUBLIC'}, {'participants': ?0}]}")
    List<ChatRoom> findAccessibleRooms(String userId);
    
    List<ChatRoom> findByType(ChatRoom.RoomType type);
    
    @Query("{'createdBy': ?0}")
    List<ChatRoom> findRoomsCreatedBy(String userId);
    
    boolean existsByRoomId(String roomId);
}




