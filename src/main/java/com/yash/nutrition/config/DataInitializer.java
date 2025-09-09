package com.yash.nutrition.config;

import com.yash.nutrition.entity.Role;
import com.yash.nutrition.entity.User;
import com.yash.nutrition.repository.RoleRepository;
import com.yash.nutrition.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create ROLE_USER if it doesn't exist
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            roleRepository.save(new Role("ROLE_USER"));
        }

        // Create ROLE_ADMIN if it doesn't exist
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            roleRepository.save(new Role("ROLE_ADMIN"));
        }

        // Create a default admin user if it doesn't exist
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").get();
            Role userRole = roleRepository.findByName("ROLE_USER").get();

            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            roles.add(userRole);

            User admin = new User(
                    "admin",
                    "admin@nutrical.com",
                    passwordEncoder.encode("admin")
            );
            admin.setRoles(roles);
            userRepository.save(admin);
        }
    }
}