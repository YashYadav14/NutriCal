package com.yash.nutrition.service;

import com.yash.nutrition.dto.UserRegistrationDto;
import com.yash.nutrition.entity.Role;
import com.yash.nutrition.entity.User;
import com.yash.nutrition.repository.RoleRepository;
import com.yash.nutrition.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User save(UserRegistrationDto registrationDto) {
        User user = new User(
                registrationDto.getUsername(),
                registrationDto.getEmail(),
                passwordEncoder.encode(registrationDto.getPassword())
        );

        // --- NEW: Assign the default USER role ---
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        return userRepository.save(user);
    }
}