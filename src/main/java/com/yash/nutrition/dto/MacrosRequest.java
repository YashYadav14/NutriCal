package com.yash.nutrition.dto;

public record MacrosRequest(
        int calories,
        double proteinPercent, // e.g. 30
        double fatPercent,     // e.g. 25
        double carbPercent     // e.g. 45  (must sum to 100)
) {}
