package com.yash.nutrition.service;

import org.springframework.stereotype.Service;

@Service
public class BmiService {

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

    public double round1(double v) { return Math.round(v * 10.0) / 10.0; }
}
