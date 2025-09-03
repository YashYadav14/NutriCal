package com.yash.nutrition.dto;

public record CaloriesRequest(
        String sex,           // "MALE" or "FEMALE"
        int age,              // years
        double weightKg,
        double heightCm,
        String activityLevel, // SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE
        String goal           // MAINTAIN, CUT, BULK
) {}
