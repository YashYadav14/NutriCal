package com.yash.nutrition.service;

import org.springframework.stereotype.Service;

@Service
public class HealthService {

    public double calcBMI(double weightKg, double heightCm) {
        double hMeters = heightCm / 100.0;
        if (hMeters <= 0) return 0.0;
        return weightKg / (hMeters * hMeters);
    }

    public String bmiCategory(double bmi) {
        if (bmi <= 0) return "Invalid";
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25.0) return "Normal";
        if (bmi < 30.0) return "Overweight";
        return "Obese";
    }

    public double bmr(String sex, double weightKg, double heightCm, int age) {
        // Mifflin-St Jeor
        double base = 10 * weightKg + 6.25 * heightCm - 5 * age;
        if ("FEMALE".equalsIgnoreCase(sex)) return base - 161;
        return base + 5; // default to male if not matched
    }

    public double activityFactor(String level) {
        String l = level == null ? "" : level.toUpperCase();
        return switch (l) {
            case "SEDENTARY"   -> 1.2;
            case "LIGHT"       -> 1.375;
            case "MODERATE"    -> 1.55;
            case "ACTIVE"      -> 1.725;
            case "VERY_ACTIVE" -> 1.9;
            default            -> 1.2;
        };
    }

    public double adjustForGoal(double tdee, String goal) {
        String g = goal == null ? "" : goal.toUpperCase();
        return switch (g) {
            case "CUT"      -> tdee * 0.85;  // ~15% deficit
            case "BULK"     -> tdee * 1.10;  // ~10% surplus
            case "MAINTAIN" -> tdee;
            default         -> tdee;
        };
    }

    public double round1(double v) { return Math.round(v * 10.0) / 10.0; }
    public double round0(double v) { return Math.round(v); }

    public double[] macrosGrams(int calories, double pPct, double fPct, double cPct) {
        // kcal per gram: protein 4, carbs 4, fat 9
        double pGr = (calories * (pPct/100.0)) / 4.0;
        double fGr = (calories * (fPct/100.0)) / 9.0;
        double cGr = (calories * (cPct/100.0)) / 4.0;
        return new double[]{ pGr, fGr, cGr };
    }
}
