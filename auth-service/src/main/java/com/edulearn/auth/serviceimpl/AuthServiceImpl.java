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

    @Autowired
    private com.edulearn.auth.service.MailService mailService;

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

        if ("INSTRUCTOR".equalsIgnoreCase(user.getRole())) {
            user.setIsVerified(false);
            user.setIsApproved(false);
        } else if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            user.setIsVerified(true);
            user.setIsApproved(true);
        } else {
            user.setIsVerified(false);
            user.setIsApproved(true); // Students don't need manual approval, just verification
        }

        user.setVerificationToken(java.util.UUID.randomUUID().toString());
        user.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        if (!savedUser.getIsVerified()) {
            mailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getVerificationToken());
        }

        return savedUser;
    }

    @Override
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (Boolean.TRUE.equals(user.getIsSuspended())) {
            throw new InvalidCredentialsException("Account is suspended. Please contact support.");
        }

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new InvalidCredentialsException("Email not verified. Please check your email.");
        }

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
        if (userDetails.getLearningGoals() != null) {
            existingUser.setLearningGoals(userDetails.getLearningGoals());
        }
        if (userDetails.getExpertiseAreas() != null) {
            existingUser.setExpertiseAreas(userDetails.getExpertiseAreas());
        }
        
        return userRepository.save(existingUser);
    }

    @Override
    public String oauth2Login(String email, String fullName, String provider, String profilePicUrl) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            if (Boolean.TRUE.equals(user.getIsSuspended())) {
                throw new InvalidCredentialsException("Account is suspended. Please contact support.");
            }
        } else {
            // Auto register
            user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setProvider(provider);
            user.setProfilePicUrl(profilePicUrl);
            user.setRole("STUDENT");
            user.setIsVerified(true);
            user.setIsSuspended(false);
            // Generate a random password since it's OAuth2, but we need a hash
            user.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            user.setCreatedAt(LocalDateTime.now());
            user = userRepository.save(user);
        }
        return jwtUtil.generateToken(user);
    }

    @Override
    public void suspendUser(int userId) {
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        user.setIsSuspended(true);
        userRepository.save(user);
    }

    @Override
    public void unsuspendUser(int userId) {
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        user.setIsSuspended(false);
        userRepository.save(user);
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired verification token"));
        user.setIsVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }
    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        mailService.sendResetPasswordEmail(user.getEmail(), token);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset token"));
        
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset token has expired");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    public void approveInstructor(int instructorId) {
        User user = userRepository.findByUserId(instructorId);
        if (user == null || !"INSTRUCTOR".equalsIgnoreCase(user.getRole())) {
            throw new UserNotFoundException("Instructor not found with ID: " + instructorId);
        }
        user.setIsApproved(true);
        userRepository.save(user);
        mailService.sendApprovalNotification(user.getEmail());
    }

    @Override
    public java.util.List<User> getPendingInstructors() {
        return userRepository.findByRoleAndIsApprovedFalse("INSTRUCTOR");
    }
}
