package com.yash.nutrition.controller;

import com.yash.nutrition.dto.CaloriesRequest;
import com.yash.nutrition.dto.CaloriesResponse;
import com.yash.nutrition.entity.CaloriesRecord;
import com.yash.nutrition.entity.User;
import com.yash.nutrition.repository.CaloriesRepository;
import com.yash.nutrition.repository.UserRepository;
import com.yash.nutrition.service.CaloriesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/calories")
public class CaloriesController {

    private final CaloriesService caloriesService;
    private final UserRepository userRepository;
    private final CaloriesRepository caloriesRepository;

    public CaloriesController(CaloriesService caloriesService, UserRepository userRepository, CaloriesRepository caloriesRepository) {
        this.caloriesService = caloriesService;
        this.userRepository = userRepository;
        this.caloriesRepository = caloriesRepository;
    }

    @PostMapping
    public ResponseEntity<CaloriesResponse> calories(@RequestBody CaloriesRequest req, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        double bmr = caloriesService.bmr(req.sex(), req.weightKg(), req.heightCm(), req.age());
        double af = caloriesService.activityFactor(req.activityLevel());
        double tdee = bmr * af;
        double goal = caloriesService.adjustForGoal(tdee, req.goal());

        CaloriesRecord rec = new CaloriesRecord(
                req.sex(), req.age(), req.weightKg(), req.heightCm(), req.activityLevel(), req.goal(),
                caloriesService.round1(bmr), caloriesService.round1(af), caloriesService.round1(tdee), caloriesService.round1(goal)
        );
        rec.setUser(currentUser);
        caloriesRepository.save(rec);

        return ResponseEntity.ok(new CaloriesResponse(
                caloriesService.round1(bmr), caloriesService.round1(af), caloriesService.round1(tdee), caloriesService.round1(goal)
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CaloriesRecord>> allCalories(Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        return ResponseEntity.ok(caloriesRepository.findByUserOrderByCreatedAtAsc(currentUser));
    }
}
