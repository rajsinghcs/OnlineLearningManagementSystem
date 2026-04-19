package com.edulearn.auth.serviceimpl;

import com.edulearn.auth.config.JwtUtil;
import com.edulearn.auth.entity.User;
import com.edulearn.auth.exception.InvalidCredentialsException;
import com.edulearn.auth.exception.UserAlreadyExistsException;
import com.edulearn.auth.exception.UserNotFoundException;
import com.edulearn.auth.repository.UserRepository;
import com.edulearn.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + user.getEmail());
        }
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        if (user.getProvider() == null || user.getProvider().isEmpty()) {
            user.setProvider("LOCAL");
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("STUDENT");
        }
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid password");
        }

        return jwtUtil.generateToken(user);
    }

    @Override
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // Blacklist token in Redis
        long expiration = 86400000; // 24 hrs
        redisTemplate.opsForValue().set("blacklist:" + token, "true", expiration, TimeUnit.MILLISECONDS);
    }

    @Override
    public boolean validateToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        // Check if token is blacklisted
        String blacklisted = redisTemplate.opsForValue().get("blacklist:" + token);
        if (blacklisted != null && blacklisted.equals("true")) {
            return false;
        }

        return jwtUtil.validateToken(token);
    }

    @Override
    public String refreshToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        if (validateToken(token)) {
            String email = jwtUtil.extractEmail(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            return jwtUtil.generateToken(user);
        }
        throw new InvalidCredentialsException("Invalid or expired token");
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    @Override
    public void changePassword(int userId, String newPassword) {
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public User updateProfile(int userId, User userDetails) {
        User existingUser = userRepository.findByUserId(userId);
        if (existingUser == null) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        
        if (userDetails.getFullName() != null) {
            existingUser.setFullName(userDetails.getFullName());
        }
        if (userDetails.getBio() != null) {
            existingUser.setBio(userDetails.getBio());
        }
        if (userDetails.getMobile() != null) {
            existingUser.setMobile(userDetails.getMobile());
        }
        if (userDetails.getProfilePicUrl() != null) {
            existingUser.setProfilePicUrl(userDetails.getProfilePicUrl());
        }
        
        return userRepository.save(existingUser);
    }
}
