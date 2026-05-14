package com.edulearn.auth.resource;

import com.edulearn.auth.entity.User;
import com.edulearn.auth.repository.UserRepository;
import com.edulearn.auth.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Slf4j
public class AuthResource {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User registeredUser = authService.register(user);
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        log.info("Login attempt for email: {}", email);
        String token = authService.login(email, password);
        User user = authService.getUserByEmail(email);
        
        Map<String, Object> response = Map.of(
            "token", token,
            "user", user
        );
        log.info("User {} logged in successfully with role: {}", email, user.getRole());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return new ResponseEntity<>("Logged out successfully", HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@RequestHeader("Authorization") String token) {
        String newToken = authService.refreshToken(token);
        return new ResponseEntity<>(newToken, HttpStatus.OK);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<User> getProfile(@PathVariable int userId) {
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<User> updateProfile(@PathVariable int userId, @RequestBody User user) {
        log.info("Updating profile for user ID: {}", userId);
        try {
            User updatedUser = authService.updateProfile(userId, user);
            log.info("Profile updated successfully for user ID: {}", userId);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error updating profile for user ID: {}: {}", userId, e.getMessage());
            throw e;
        }
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> request) {
        int userId = Integer.parseInt(request.get("userId"));
        String newPassword = request.get("newPassword");
        authService.changePassword(userId, newPassword);
        return new ResponseEntity<>("Password updated successfully", HttpStatus.OK);
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<User>> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null) {
            return ResponseEntity.ok(userRepository.findAllByRole(role));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @Transactional
    @PutMapping("/verify/{userId}")
    public ResponseEntity<User> verifyUser(@PathVariable int userId) {
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        user.setIsVerified(true);
        User updated = userRepository.save(user);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PostMapping("/oauth2/login")
    public ResponseEntity<Map<String, Object>> oauth2Login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String fullName = payload.get("fullName");
        String provider = payload.get("provider");
        String profilePicUrl = payload.get("profilePicUrl");
        
        log.info("OAuth2 Login attempt for email: {}", email);
        String token = authService.oauth2Login(email, fullName, provider, profilePicUrl);
        User user = authService.getUserByEmail(email);
        
        Map<String, Object> response = Map.of(
            "token", token,
            "user", user
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Transactional
    @PutMapping("/suspend/{userId}")
    public ResponseEntity<String> suspendUser(@PathVariable int userId) {
        authService.suspendUser(userId);
        return new ResponseEntity<>("User suspended successfully", HttpStatus.OK);
    }

    @Transactional
    @PutMapping("/unsuspend/{userId}")
    public ResponseEntity<String> unsuspendUser(@PathVariable int userId) {
        authService.unsuspendUser(userId);
        return new ResponseEntity<>("User unsuspended successfully", HttpStatus.OK);
    }

    @Transactional
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable int userId) {
        userRepository.deleteByUserId(userId);
        return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        try {
            authService.verifyEmail(token);
            // Redirect to frontend login page with a success flag
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:5173/login?verified=true"))
                    .build();
        } catch (Exception e) {
            // Redirect to login with error message
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:5173/login?error=" + e.getMessage()))
                    .build();
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("AUTH_DEBUG: Received forgot-password request for email: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            log.error("AUTH_DEBUG: Email is null or empty in request body");
            return ResponseEntity.badRequest().body("Email is required");
        }
        
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok("Reset link sent to your email");
        } catch (Exception e) {
            log.error("AUTH_DEBUG: Error processing forgot-password for {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        log.info("AUTH_DEBUG: Received reset-password request for token: {}", token);
        
        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }
        
        try {
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            log.error("AUTH_DEBUG: Error resetting password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/admin/approve-instructor/{instructorId}")
    public ResponseEntity<String> approveInstructor(@PathVariable int instructorId) {
        authService.approveInstructor(instructorId);
        return new ResponseEntity<>("Instructor approved successfully", HttpStatus.OK);
    }

    @GetMapping("/admin/pending-instructors")
    public ResponseEntity<java.util.List<User>> getPendingInstructors() {
        return ResponseEntity.ok(authService.getPendingInstructors());
    }
}
