package com.edulearn.auth.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty("password")
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role; // STUDENT, INSTRUCTOR, ADMIN

    @Column(nullable = false)
    private String provider; // LOCAL, GOOGLE, GITHUB

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column(nullable = false)
    private Boolean isApproved = false;

    private String verificationToken;

    private String resetPasswordToken;

    private LocalDateTime resetPasswordTokenExpiry;

    private Long mobile;

    private String bio;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicUrl;

    private String learningGoals;

    private String expertiseAreas;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isSuspended = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
