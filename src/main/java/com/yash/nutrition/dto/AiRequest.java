package com.yash.nutrition.dto;

import java.util.List;

public class AiRequest {
    private String message;
    private Integer age;
    private Double weight;
    private Double height;
    private String gender;
    private String goal;
    private String activityLevel;
    private String preferences;
    private Integer caloriesTarget;
    private List<ChatMessage> history;

    public AiRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }

    // legacy alias for existing GeminiAiService code
    public String getDietaryPreferences() { return preferences; }
    public void setDietaryPreferences(String preferences) { this.preferences = preferences; }

    public Integer getCaloriesTarget() { return caloriesTarget; }
    public void setCaloriesTarget(Integer caloriesTarget) { this.caloriesTarget = caloriesTarget; }

    public List<ChatMessage> getHistory() { return history; }
    public void setHistory(List<ChatMessage> history) { this.history = history; }
}
