package com.yash.nutrition.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // --- Relationships to User's Data ---
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BMIRecord> bmiRecords = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CaloriesRecord> caloriesRecords = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MacrosRecord> macrosRecords = new ArrayList<>();

    // --- Relationship to Roles (CASCADE REMOVED) ---
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();


    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public List<BMIRecord> getBmiRecords() { return bmiRecords; }
    public void setBmiRecords(List<BMIRecord> bmiRecords) { this.bmiRecords = bmiRecords; }
    public List<CaloriesRecord> getCaloriesRecords() { return caloriesRecords; }
    public void setCaloriesRecords(List<CaloriesRecord> caloriesRecords) { this.caloriesRecords = caloriesRecords; }
    public List<MacrosRecord> getMacrosRecords() { return macrosRecords; }
    public void setMacrosRecords(List<MacrosRecord> macrosRecords) { this.macrosRecords = macrosRecords; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}