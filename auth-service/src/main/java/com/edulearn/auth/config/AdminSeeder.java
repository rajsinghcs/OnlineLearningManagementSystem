package com.edulearn.auth.config;

import com.edulearn.auth.entity.User;
import com.edulearn.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
    }

    private void seedAdmin() {
        String adminEmail = "singhrajbahadur888@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            // Delete all previous users as requested
            userRepository.deleteAll();
            
            User admin = new User();
            admin.setFullName("Platform Admin");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("12345678"));
            admin.setRole("ADMIN");
            admin.setProvider("LOCAL");
            admin.setIsVerified(true);
            admin.setIsApproved(true);
            admin.setIsSuspended(false);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            System.out.println("Clean slate: All previous users deleted. New Admin account created: " + adminEmail);
        }
    }
}
