package com.yash.nutrition.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yash.nutrition.dto.AiDietResponse;
import com.yash.nutrition.dto.AiRecommendationsResponse;
import com.yash.nutrition.dto.AiRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class GeminiAiService {

    private static final Logger logger = Logger.getLogger(GeminiAiService.class.getName());

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private static final String TIMEOUT_MSG = "AI is taking longer than expected. Please try again.";
    private static final String UNAVAILABLE_MSG = "AI service is currently unavailable. Please configure the API key to enable this feature.";

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final com.yash.nutrition.repository.SavedDietPlanRepository savedDietPlanRepository;

    public GeminiAiService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            com.yash.nutrition.repository.SavedDietPlanRepository savedDietPlanRepository
    ) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.savedDietPlanRepository = savedDietPlanRepository;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public Mono<AiDietResponse> generateDietPlan(AiRequest request, String username) {
        if (isApiKeyMissing()) {
            logger.warning("Gemini API key is missing. Returning fallback.");
            return Mono.just(getFallbackDietResponse());
        }

        String prompt = buildDietPrompt(request);
        return callWithRetry(prompt)
                .map(jsonResponse -> {
                    try {
                        AiDietResponse response = objectMapper.readValue(jsonResponse, AiDietResponse.class);
                        if (response == null || response.getCalories() <= 0 || response.getMacros() == null
                                || response.getMeal_plan() == null || response.getMeal_plan().getBreakfast() == null) {
                            return AiDietResponse.error("Validation failed", "Invalid JSON format returned by AI.");
                        }

                        // Persist
                        com.yash.nutrition.entity.SavedDietPlan saved = new com.yash.nutrition.entity.SavedDietPlan();
                        saved.setUserId(username != null ? username : "guest");
                        saved.setCalories(response.getCalories());
                        saved.setProtein(response.getMacros().getProtein());
                        saved.setCarbs(response.getMacros().getCarbs());
                        saved.setFats(response.getMacros().getFats());
                        saved.setMealPlanJson(objectMapper.writeValueAsString(response.getMeal_plan()));
                        if (response.getWeekly_plan() != null) {
                            saved.setWeeklyPlanJson(objectMapper.writeValueAsString(response.getWeekly_plan()));
                        }
                        saved.setTipsJson(objectMapper.writeValueAsString(response.getTips()));
                        savedDietPlanRepository.save(saved);

                        response.setSuccess(true);
                        return response;
                    } catch (Exception e) {
                        logger.warning("Error parsing diet plan: " + e.getMessage());
                        return AiDietResponse.error("Parsing failed", e.getMessage());
                    }
                })
                .onErrorResume(e -> {
                    logger.severe("Gemini AI API Failed: " + e.getMessage());
                    return Mono.just(AiDietResponse.error("Gemini API failed", e.getMessage()));
                });
    }

    public Mono<AiDietResponse> generateWeeklyPlan(AiRequest request) {
        return generateDietPlan(request, "guest");
    }

    public Mono<AiRecommendationsResponse> generateRecommendations(AiRequest request) {
        if (isApiKeyMissing()) {
            return Mono.just(getFallbackRecommendationsResponse());
        }

        String prompt = buildRecommendationsPrompt(request);
        return callWithRetry(prompt)
                .map(jsonResponse -> {
                    try {
                        AiRecommendationsResponse response = objectMapper.readValue(jsonResponse, AiRecommendationsResponse.class);
                        if (response == null || response.getSummary() == null
                                || response.getActionable_steps() == null || response.getActionable_steps().isEmpty()) {
                            return AiRecommendationsResponse.error("Validation failed", "Invalid JSON format returned by AI.");
                        }
                        response.setSuccess(true);
                        return response;
                    } catch (Exception e) {
                        return AiRecommendationsResponse.error("Parsing failed", e.getMessage());
                    }
                })
                .onErrorResume(e -> {
                    logger.severe("Gemini AI API Failed: " + e.getMessage());
                    return Mono.just(AiRecommendationsResponse.error("Gemini API failed", e.getMessage()));
                });
    }

    public Mono<com.yash.nutrition.dto.AiChatResponse> generateChatResponse(
            AiRequest request, String username) {

        if (isApiKeyMissing()) {
            return Mono.just(com.yash.nutrition.dto.AiChatResponse.error("API Key Missing", UNAVAILABLE_MSG));
        }

        List<com.yash.nutrition.entity.SavedDietPlan> pastPlans =
                savedDietPlanRepository.findByUserIdOrderByCreatedAtDesc(username);
        com.yash.nutrition.entity.SavedDietPlan latestPlan =
                pastPlans.isEmpty() ? null : pastPlans.get(0);

        String prompt = buildChatPrompt(request, latestPlan);

        return callWithRetry(prompt)
                .map(jsonResponse -> {
                    try {
                        com.yash.nutrition.dto.AiChatResponse parsed = objectMapper.readValue(jsonResponse, com.yash.nutrition.dto.AiChatResponse.class);
                        String replyText = parsed != null && parsed.getReply() != null ? parsed.getReply() : "No response";
                        return com.yash.nutrition.dto.AiChatResponse.success(replyText, 0);
                    } catch (Exception e) {
                        // Fallback: try reading as raw string if JSON parsing to DTO fails
                        // The user prompt builder instructs Gemini to return JSON with { "reply": "..." }
                        try {
                            Map<String, String> map = objectMapper.readValue(jsonResponse, Map.class);
                            if (map.containsKey("reply")) {
                                return com.yash.nutrition.dto.AiChatResponse.success(map.get("reply"), 0);
                            }
                        } catch(Exception ignored) {}
                        
                        logger.warning("Error parsing chat response: " + e.getMessage());
                        return com.yash.nutrition.dto.AiChatResponse.error("Parsing failed", e.getMessage());
                    }
                })
                .onErrorResume(e -> {
                    logger.severe("Gemini AI API Failed: " + e.getMessage());
                    return Mono.just(com.yash.nutrition.dto.AiChatResponse.error("Gemini API failed", e.getMessage()));
                });
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private boolean isApiKeyMissing() {
        return apiKey == null || apiKey.isBlank();
    }

    @SuppressWarnings("unchecked")
    private Mono<String> callWithRetry(String prompt) {
        String url = apiUrl + "?key=" + apiKey;
        String sanitizedPrompt = prompt.replace("\"", "\\\"").replace("\n", " ");

        String requestBody = """
            {
              "contents": [
                {
                  "parts": [
                    {
                      "text": "%s"
                    }
                  ]
                }
              ]
            }
            """.formatted(sanitizedPrompt);

        return webClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(15))
                .retryWhen(reactor.util.retry.Retry.fixedDelay(2, Duration.ofSeconds(2))
                        .filter(throwable -> {
                            if (throwable instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                                return ((org.springframework.web.reactive.function.client.WebClientResponseException) throwable).getStatusCode().value() == 429;
                            }
                            return false;
                        }))
                .map(body -> {
                    if (body == null || !body.containsKey("candidates")
                            || ((List<?>) body.get("candidates")).isEmpty()) {
                        throw new RuntimeException("Invalid or empty response format from Gemini API");
                    }
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    String textResponse = (String) parts.get(0).get("text");

                    String cleanResponse = textResponse
                            .replaceAll("```json", "")
                            .replaceAll("```", "")
                            .replaceAll("`json", "")
                            .replaceAll("`", "")
                            .trim();
                    System.out.println("========== RAW GEMINI API RESPONSE ==========");
                    System.out.println(cleanResponse);
                    System.out.println("=============================================");
                    return cleanResponse;
                });
    }

    // ── Prompt builders ───────────────────────────────────────────────────────

    private String buildDietPrompt(AiRequest request) {
        return "You are a professional nutritionist.\n" +
               "Generate a personalized diet plan based on the following user profile:\n" +
               "Weight: " + request.getWeight() + " kg\n" +
               "Height: " + request.getHeight() + " cm\n" +
               "Age: " + request.getAge() + " years\n" +
               "Gender: " + request.getGender() + "\n" +
               "Activity Level: " + request.getActivityLevel() + "\n" +
               "Goal: " + request.getGoal() + "\n" +
               "Dietary Preferences: " + request.getDietaryPreferences() + "\n\n" +
               "IMPORTANT DATA RULES:\n" +
               "- All numeric values MUST be integers (no quotes, no units like \"150g\").\n" +
               "- Ensure macros (protein, carbs, fats) are strictly integer numbers.\n" +
               "- Ensure calories is strictly an integer number.\n\n" +
               "Return ONLY valid JSON. No explanation. No markdown. No backticks.\n" +
               "Output must strictly follow this structure:\n" +
               "{\n" +
               "  \"calories\": number,\n" +
               "  \"macros\": {\n" +
               "    \"protein\": number,\n" +
               "    \"carbs\": number,\n" +
               "    \"fats\": number\n" +
               "  },\n" +
               "  \"meal_plan\": {\n" +
               "    \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number },\n" +
               "    \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number },\n" +
               "    \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number },\n" +
               "    \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }\n" +
               "  },\n" +
               "  \"tips\": [\"string\"],\n" +
               "  \"weekly_plan\": {\n" +
               "    \"monday\": { \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"calories\": number },\n" +
               "    \"tuesday\": { \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"calories\": number },\n" +
               "    \"wednesday\": { \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"calories\": number },\n" +
               "    \"thursday\": { \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"calories\": number },\n" +
               "    \"friday\": { \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"calories\": number },\n" +
               "    \"saturday\": { \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"calories\": number },\n" +
               "    \"sunday\": { \"breakfast\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"lunch\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"dinner\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"snacks\": { \"name\": \"string\", \"grams\": \"string\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"calories\": number }\n" +
               "  }\n" +
               "}";
    }

    private String buildRecommendationsPrompt(AiRequest request) {
        return "You are a professional nutritionist giving general advice.\n" +
               "Based on the following user profile, provide a summary and actionable steps.\n\n" +
               "Age: " + request.getAge() + "\n" +
               "Gender: " + request.getGender() + "\n" +
               "Weight: " + request.getWeight() + " kg\n" +
               "Height: " + request.getHeight() + " cm\n" +
               "Activity Level: " + request.getActivityLevel() + "\n" +
               "Goal: " + request.getGoal() + "\n" +
               "Dietary Preferences: " + request.getDietaryPreferences() + "\n\n" +
               "Return ONLY valid JSON. No explanation. No markdown. No backticks.\n" +
               "Output must strictly follow this structure:\n" +
               "{\n" +
               "  \"summary\": \"string\",\n" +
               "  \"actionable_steps\": [\"string\"],\n" +
               "  \"food_to_avoid\": [\"string\"]\n" +
               "}";
    }

    private String buildChatPrompt(
            AiRequest request,
            com.yash.nutrition.entity.SavedDietPlan latestPlan) {

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a professional, motivating AI Nutrition Coach.\n");
        prompt.append("Keep responses short, conversational, helpful, and practical.\n");
        prompt.append("CRITICAL RULE: NEVER exceed 4-5 short sentences in your reply.\n\n");

        if (latestPlan != null) {
            prompt.append("--- USER'S LATEST SAVED DIET PLAN ---\n");
            prompt.append("Target Calories: ").append(latestPlan.getCalories()).append(" kcal\n");
            prompt.append("Protein: ").append(latestPlan.getProtein()).append("g, ");
            prompt.append("Carbs: ").append(latestPlan.getCarbs()).append("g, ");
            prompt.append("Fats: ").append(latestPlan.getFats()).append("g\n");
            prompt.append("Meal Plan: ").append(latestPlan.getMealPlanJson()).append("\n");
            prompt.append("--------------------------------------\n\n");
        } else {
            if (request.getGoal() != null && !request.getGoal().isBlank()) {
                prompt.append("User's goal: ").append(request.getGoal()).append(".\n");
            }
            if (request.getCaloriesTarget() != null && request.getCaloriesTarget() > 0) {
                prompt.append("Daily target: ").append(request.getCaloriesTarget()).append(" calories.\n");
            }
        }

        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            prompt.append("--- CONVERSATION HISTORY ---\n");
            for (com.yash.nutrition.dto.ChatMessage msg : request.getHistory()) {
                prompt.append(msg.getRole().toUpperCase()).append(": ").append(msg.getContent()).append("\n");
            }
            prompt.append("----------------------------\n\n");
        }

        prompt.append("User's latest message: \"").append(request.getMessage()).append("\"\n\n");
        prompt.append("Return ONLY valid JSON. No markdown. No backticks.\n");
        prompt.append("Output must strictly follow this structure:\n");
        prompt.append("{\n  \"reply\": \"your conversational response here\"\n}");

        return prompt.toString();
    }

    // ── Fallback responses ────────────────────────────────────────────────────

    private AiDietResponse getFallbackDietResponse() {
        AiDietResponse fallback = new AiDietResponse();
        fallback.setCalories(2000);

        AiDietResponse.Macros macros = new AiDietResponse.Macros();
        macros.setProtein(150);
        macros.setCarbs(200);
        macros.setFats(66);
        fallback.setMacros(macros);

        AiDietResponse.MealPlan mealPlan = new AiDietResponse.MealPlan();
        mealPlan.setBreakfast("Oatmeal with berries and protein powder");
        mealPlan.setLunch("Grilled chicken salad with quinoa");
        mealPlan.setDinner("Salmon with roasted vegetables and sweet potato");
        mealPlan.setSnacks("Greek yogurt with almonds");
        fallback.setMeal_plan(mealPlan);

        List<String> tips = new ArrayList<>();
        tips.add("Stay hydrated — aim for at least 2 litres of water daily.");
        tips.add("Consistent sleep patterns support optimal recovery.");
        tips.add("This is a generic fallback plan. Please try again for a personalised result.");
        fallback.setTips(tips);

        return fallback;
    }

    private AiRecommendationsResponse getFallbackRecommendationsResponse() {
        AiRecommendationsResponse fallback = new AiRecommendationsResponse();
        fallback.setSummary("General healthy living advice — personalised recommendations unavailable right now.");

        List<String> steps = new ArrayList<>();
        steps.add("Maintain a balanced diet rich in whole foods.");
        steps.add("Aim for at least 150 minutes of moderate aerobic activity per week.");
        fallback.setActionable_steps(steps);

        List<String> avoid = new ArrayList<>();
        avoid.add("Highly processed foods");
        avoid.add("Excessive added sugars");
        fallback.setFood_to_avoid(avoid);

        return fallback;
    }
}
