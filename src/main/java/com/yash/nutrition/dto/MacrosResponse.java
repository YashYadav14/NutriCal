package com.yash.nutrition.dto;

public record MacrosResponse(
        int calories,
        double proteinGrams,
        double fatGrams,
        double carbGrams
) {}
