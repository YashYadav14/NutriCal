package com.yash.nutrition.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "bmi_records")
public class BMIRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // Prevents sending the whole user object back in API responses
    private User user;

    private double weightKg;
    private double heightCm;
    private double bmi;
    private String category;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public BMIRecord() {}

    public BMIRecord(double weightKg, double heightCm, double bmi, String category) {
        this.weightKg = weightKg;
        this.heightCm = heightCm;
        this.bmi = bmi;
        this.category = category;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    // getters & setters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
    public double getHeightCm() { return heightCm; }
    public void setHeightCm(double heightCm) { this.heightCm = heightCm; }
    public double getBmi() { return bmi; }
    public void setBmi(double bmi) { this.bmi = bmi; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Instant getCreatedAt() { return createdAt; }
}