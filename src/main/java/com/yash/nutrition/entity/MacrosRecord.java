package com.yash.nutrition.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "macros_records")
public class MacrosRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private int calories;
    private double proteinPercent;
    private double fatPercent;
    private double carbPercent;

    private double proteinGrams;
    private double fatGrams;
    private double carbGrams;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public MacrosRecord() {}

    public MacrosRecord(int calories, double proteinPercent, double fatPercent, double carbPercent,
                        double proteinGrams, double fatGrams, double carbGrams) {
        this.calories = calories;
        this.proteinPercent = proteinPercent;
        this.fatPercent = fatPercent;
        this.carbPercent = carbPercent;
        this.proteinGrams = proteinGrams;
        this.fatGrams = fatGrams;
        this.carbGrams = carbGrams;
    }

    @PrePersist
    public void prePersist() { this.createdAt = Instant.now(); }

    // getters & setters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }
    public double getProteinPercent() { return proteinPercent; }
    public void setProteinPercent(double proteinPercent) { this.proteinPercent = proteinPercent; }
    public double getFatPercent() { return fatPercent; }
    public void setFatPercent(double fatPercent) { this.fatPercent = fatPercent; }
    public double getCarbPercent() { return carbPercent; }
    public void setCarbPercent(double carbPercent) { this.carbPercent = carbPercent; }
    public double getProteinGrams() { return proteinGrams; }
    public void setProteinGrams(double proteinGrams) { this.proteinGrams = proteinGrams; }
    public double getFatGrams() { return fatGrams; }
    public void setFatGrams(double fatGrams) { this.fatGrams = fatGrams; }
    public double getCarbGrams() { return carbGrams; }
    public void setCarbGrams(double carbGrams) { this.carbGrams = carbGrams; }
    public Instant getCreatedAt() { return createdAt; }
}