package com.example.auth_service.entity;

import com.example.auth_service.token.Token;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;
import java.util.ArrayList;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String firstName;
    private String lastName;
    
    @Column(unique = true, length = 255)
    private String email;
    
    @Column(length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "user")
    private List<Token> tokens;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // Add the role-based authority
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        
        // Add specific authorities based on role
        switch (role) {
            case ADMIN:
                authorities.add(new SimpleGrantedAuthority("FLIGHT_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_READ"));
                authorities.add(new SimpleGrantedAuthority("STAFF_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("STAFF_CREATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_READ"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_CREATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_READ"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_CREATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("CHAT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("CHAT_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_SEND"));
                break;
            case SUPERVISEUR:
                authorities.add(new SimpleGrantedAuthority("FLIGHT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("FLIGHT_READ"));
                authorities.add(new SimpleGrantedAuthority("STAFF_CREATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("STAFF_READ"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_CREATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_READ"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_CREATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_UPDATE"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_CREATE"));
                authorities.add(new SimpleGrantedAuthority("CHAT_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_SEND"));
                break;
            case AGENT:
                authorities.add(new SimpleGrantedAuthority("FLIGHT_READ"));
                authorities.add(new SimpleGrantedAuthority("STAFF_READ"));
                authorities.add(new SimpleGrantedAuthority("EVALUATION_READ"));
                authorities.add(new SimpleGrantedAuthority("SCHEDULE_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_READ"));
                authorities.add(new SimpleGrantedAuthority("CHAT_SEND"));
                break;
        }
        
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
