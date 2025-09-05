package com.example.auth_service.token;

import com.example.auth_service.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.actuate.autoconfigure.wavefront.WavefrontProperties;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(length = 1000)
    private String token;

    @Enumerated(EnumType.STRING)
    private TokenType tokenType;

    private boolean expired;

    private boolean revoked;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
