package com.yash.nutrition.repository;

import com.yash.nutrition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Method to find a user by their username
    Optional<User> findByUsername(String username);

    // Method to check if an email already exists
    boolean existsByEmail(String email);

    // Method to check if a username already exists
    boolean existsByUsername(String username);
}
