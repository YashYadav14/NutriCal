package com.yash.nutrition.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_diet_plans")
public class SavedDietPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ideally, this connects to a User entity: @ManyToOne
    // For simplicity or if Auth is not strictly active during AI testing, we'll store a userId string.
    @Column(name = "user_id")
    private String userId;

    @Column(name = "calories")
    private int calories;

    // We can store macros simply
    @Column(name = "protein")
    private int protein;

    @Column(name = "carbs")
    private int carbs;

    @Column(name = "fats")
    private int fats;

    // Due to the complexity of the meal plan JSON, we can store it as a Lob string or JSON column
    @Lob
    @Column(name = "meal_plan_json", columnDefinition = "TEXT")
    private String mealPlanJson;

    @Lob
    @Column(name = "tips_json", columnDefinition = "TEXT")
    private String tipsJson;

    @Lob
    @Column(name = "weekly_plan_json", columnDefinition = "TEXT")
    private String weeklyPlanJson;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }

    public int getProtein() { return protein; }
    public void setProtein(int protein) { this.protein = protein; }

    public int getCarbs() { return carbs; }
    public void setCarbs(int carbs) { this.carbs = carbs; }

    public int getFats() { return fats; }
    public void setFats(int fats) { this.fats = fats; }

    public String getMealPlanJson() { return mealPlanJson; }
    public void setMealPlanJson(String mealPlanJson) { this.mealPlanJson = mealPlanJson; }

    public String getTipsJson() { return tipsJson; }
    public void setTipsJson(String tipsJson) { this.tipsJson = tipsJson; }

    public String getWeeklyPlanJson() { return weeklyPlanJson; }
    public void setWeeklyPlanJson(String weeklyPlanJson) { this.weeklyPlanJson = weeklyPlanJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
