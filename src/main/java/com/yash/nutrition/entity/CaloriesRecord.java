package com.yash.nutrition.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "calories_records")
public class CaloriesRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String sex;
    private int age;
    private double weightKg;
    private double heightCm;
    private String activityLevel;
    private String goal;

    private double bmr;
    private double activityFactor;
    private double tdee;
    private double goalCalories;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public CaloriesRecord() {}

    public CaloriesRecord(String sex, int age, double weightKg, double heightCm, String activityLevel, String goal,
                          double bmr, double activityFactor, double tdee, double goalCalories) {
        this.sex = sex;
        this.age = age;
        this.weightKg = weightKg;
        this.heightCm = heightCm;
        this.activityLevel = activityLevel;
        this.goal = goal;
        this.bmr = bmr;
        this.activityFactor = activityFactor;
        this.tdee = tdee;
        this.goalCalories = goalCalories;
    }

    @PrePersist
    public void prePersist() { this.createdAt = Instant.now(); }

    // getters & setters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
    public double getHeightCm() { return heightCm; }
    public void setHeightCm(double heightCm) { this.heightCm = heightCm; }
    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public double getBmr() { return bmr; }
    public void setBmr(double bmr) { this.bmr = bmr; }
    public double getActivityFactor() { return activityFactor; }
    public void setActivityFactor(double activityFactor) { this.activityFactor = activityFactor; }
    public double getTdee() { return tdee; }
    public void setTdee(double tdee) { this.tdee = tdee; }
    public double getGoalCalories() { return goalCalories; }
    public void setGoalCalories(double goalCalories) { this.goalCalories = goalCalories; }
    public Instant getCreatedAt() { return createdAt; }
}