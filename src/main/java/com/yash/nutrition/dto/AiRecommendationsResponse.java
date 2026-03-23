package com.yash.nutrition.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiRecommendationsResponse {
    private boolean success = true;
    private String message;
    private String error;
    private String summary;
    private List<String> actionable_steps;
    private List<String> food_to_avoid;

    public static AiRecommendationsResponse error(String message, String errorDetail) {
        AiRecommendationsResponse res = new AiRecommendationsResponse();
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


    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getActionable_steps() { return actionable_steps; }
    public void setActionable_steps(List<String> actionable_steps) { this.actionable_steps = actionable_steps; }

    public List<String> getFood_to_avoid() { return food_to_avoid; }
    public void setFood_to_avoid(List<String> food_to_avoid) { this.food_to_avoid = food_to_avoid; }
}
