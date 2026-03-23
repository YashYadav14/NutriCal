package com.yash.nutrition.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiDietResponse {
    private boolean success = true;
    private String message;
    private String error;
    private int calories;
    private Macros macros;
    private MealPlan meal_plan;
    private java.util.Map<String, DailyPlan> weekly_plan;
    private List<String> tips;

    public static AiDietResponse error(String message, String errorDetail) {
        AiDietResponse res = new AiDietResponse();
        res.setSuccess(false);
        res.setMessage(message);
        res.setError(errorDetail);
        return res;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }


    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }

    public Macros getMacros() { return macros; }
    public void setMacros(Macros macros) { this.macros = macros; }

    public MealPlan getMeal_plan() { return meal_plan; }
    public void setMeal_plan(MealPlan meal_plan) { this.meal_plan = meal_plan; }

    public List<String> getTips() { return tips; }
    public void setTips(List<String> tips) { this.tips = tips; }

    public java.util.Map<String, DailyPlan> getWeekly_plan() { return weekly_plan; }
    public void setWeekly_plan(java.util.Map<String, DailyPlan> weekly_plan) { this.weekly_plan = weekly_plan; }

    public static class DailyPlan {
        private Object breakfast;
        private Object lunch;
        private Object dinner;
        private Object snacks;
        private int calories;

        public Object getBreakfast() { return breakfast; }
        public void setBreakfast(Object breakfast) { this.breakfast = breakfast; }
        public Object getLunch() { return lunch; }
        public void setLunch(Object lunch) { this.lunch = lunch; }
        public Object getDinner() { return dinner; }
        public void setDinner(Object dinner) { this.dinner = dinner; }
        public Object getSnacks() { return snacks; }
        public void setSnacks(Object snacks) { this.snacks = snacks; }
        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }
    }

    public static class Macros {
        private int protein;
        private int carbs;
        private int fats;

        public int getProtein() { return protein; }
        public void setProtein(int protein) { this.protein = protein; }
        public int getCarbs() { return carbs; }
        public void setCarbs(int carbs) { this.carbs = carbs; }
        public int getFats() { return fats; }
        public void setFats(int fats) { this.fats = fats; }
    }

    public static class MealPlan {
        private Object breakfast;
        private Object lunch;
        private Object dinner;
        private Object snacks;

        public Object getBreakfast() { return breakfast; }
        public void setBreakfast(Object breakfast) { this.breakfast = breakfast; }
        public Object getLunch() { return lunch; }
        public void setLunch(Object lunch) { this.lunch = lunch; }
        public Object getDinner() { return dinner; }
        public void setDinner(Object dinner) { this.dinner = dinner; }
        public Object getSnacks() { return snacks; }
        public void setSnacks(Object snacks) { this.snacks = snacks; }
    }
}
