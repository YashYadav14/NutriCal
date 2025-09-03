package com.yash.nutrition.dto;

public record CaloriesResponse(
        double bmr,
        double activityFactor,
        double tdee,
        double goalCalories
) {}
