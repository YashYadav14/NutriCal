package com.yash.nutrition.controller;

import com.yash.nutrition.dto.AiDietResponse;
import com.yash.nutrition.dto.AiRecommendationsResponse;
import com.yash.nutrition.dto.AiRequest;
import com.yash.nutrition.entity.SavedDietPlan;
import com.yash.nutrition.repository.SavedDietPlanRepository;
import com.yash.nutrition.service.GeminiAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final GeminiAiService geminiAiService;
    private final SavedDietPlanRepository savedDietPlanRepository;

    @Autowired
    public AiAssistantController(GeminiAiService geminiAiService, SavedDietPlanRepository savedDietPlanRepository) {
        this.geminiAiService = geminiAiService;
        this.savedDietPlanRepository = savedDietPlanRepository;
    }

    @PostMapping("/diet")
    public Mono<ResponseEntity<AiDietResponse>> getDietPlan(@RequestBody AiRequest request, Principal principal) {
        String username = principal != null ? principal.getName() : "guest";
        return geminiAiService.generateDietPlan(request, username)
                .map(ResponseEntity::ok);
    }

    @PostMapping("/recommendations")
    public Mono<ResponseEntity<AiRecommendationsResponse>> getRecommendations(@RequestBody AiRequest request) {
        return geminiAiService.generateRecommendations(request)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/diet/history")
    public ResponseEntity<List<SavedDietPlan>> getDietHistory(Principal principal) {
        String username = principal != null ? principal.getName() : "guest";
        List<SavedDietPlan> history = savedDietPlanRepository.findByUserIdOrderByCreatedAtDesc(username);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/chat")
    public Mono<ResponseEntity<com.yash.nutrition.dto.AiChatResponse>> chatWithAi(@RequestBody AiRequest request, Principal principal) {
        String username = principal != null ? principal.getName() : "guest";
        return geminiAiService.generateChatResponse(request, username)
                .map(ResponseEntity::ok);
    }
}
