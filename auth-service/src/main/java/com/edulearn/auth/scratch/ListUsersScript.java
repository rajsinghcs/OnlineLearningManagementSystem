package com.edulearn.auth.scratch;

import com.edulearn.auth.entity.User;
import com.edulearn.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class ListUsersScript implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        List<User> users = userRepository.findAll();
        System.out.println("USER_DEBUG: --- CURRENT USERS IN DATABASE ---");
        for (User u : users) {
            System.out.println("USER_DEBUG: Email: " + u.getEmail() + " | Role: " + u.getRole());
        }
        System.out.println("USER_DEBUG: ----------------------------------");
    }
}
