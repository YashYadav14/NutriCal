package com.yash.nutrition.controller;

import com.yash.nutrition.dto.*;
import com.yash.nutrition.entity.*;
import com.yash.nutrition.repository.*;
import com.yash.nutrition.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final HealthService svc;
    // --- FIX: Use UserRepository to find users, not UserService ---
    private final UserRepository userRepository;
    private final BMIRepository bmiRepository;
    private final CaloriesRepository caloriesRepository;
    private final MacrosRepository macrosRepository;

    // --- FIX: Update the constructor ---
    public HealthController(HealthService svc, UserRepository userRepository, BMIRepository bmiRepository,
                            CaloriesRepository caloriesRepository, MacrosRepository macrosRepository) {
        this.svc = svc;
        this.userRepository = userRepository;
        this.bmiRepository = bmiRepository;
        this.caloriesRepository = caloriesRepository;
        this.macrosRepository = macrosRepository;
    }

    @PostMapping("/bmi")
    public ResponseEntity<BMIResponse> bmi(@RequestBody BMIRequest req, Principal principal) {
        // --- FIX: Find user via the repository and handle the Optional ---
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        
        double bmi = svc.calcBMI(req.weightKg(), req.heightCm());
        String cat = svc.bmiCategory(bmi);

        BMIRecord record = new BMIRecord(req.weightKg(), req.heightCm(), svc.round1(bmi), cat);
        record.setUser(currentUser); // Link the record to the user
        bmiRepository.save(record);

        return ResponseEntity.ok(new BMIResponse(svc.round1(bmi), cat));
    }

    @GetMapping("/bmi/history")
    public ResponseEntity<List<BMIRecord>> allBmi(Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        return ResponseEntity.ok(currentUser.getBmiRecords());
    }

    @PostMapping("/calories")
    public ResponseEntity<CaloriesResponse> calories(@RequestBody CaloriesRequest req, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        double bmr = svc.bmr(req.sex(), req.weightKg(), req.heightCm(), req.age());
        double af = svc.activityFactor(req.activityLevel());
        double tdee = bmr * af;
        double goal = svc.adjustForGoal(tdee, req.goal());

        CaloriesRecord rec = new CaloriesRecord(
                req.sex(), req.age(), req.weightKg(), req.heightCm(), req.activityLevel(), req.goal(),
                svc.round1(bmr), svc.round1(af), svc.round1(tdee), svc.round1(goal)
        );
        rec.setUser(currentUser); // Link the record to the user
        caloriesRepository.save(rec);

        return ResponseEntity.ok(new CaloriesResponse(
                svc.round1(bmr), svc.round1(af), svc.round1(tdee), svc.round1(goal)
        ));
    }

    @GetMapping("/calories/history")
    public ResponseEntity<List<CaloriesRecord>> allCalories(Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        return ResponseEntity.ok(currentUser.getCaloriesRecords());
    }

    @PostMapping("/macros")
    public ResponseEntity<?> macros(@RequestBody MacrosRequest req, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        double sum = req.proteinPercent() + req.fatPercent() + req.carbPercent();
        if (Math.abs(sum - 100.0) > 0.0001) {
            return ResponseEntity.badRequest().body("proteinPercent + fatPercent + carbPercent must equal 100");
        }
        double[] grams = svc.macrosGrams(req.calories(),
                req.proteinPercent(), req.fatPercent(), req.carbPercent());

        MacrosRecord rec = new MacrosRecord(
                req.calories(), req.proteinPercent(), req.fatPercent(), req.carbPercent(),
                svc.round1(grams[0]), svc.round1(grams[1]), svc.round1(grams[2])
        );
        rec.setUser(currentUser); // Link the record to the user
        macrosRepository.save(rec);

        return ResponseEntity.ok(new MacrosResponse(
                req.calories(), svc.round1(grams[0]), svc.round1(grams[1]), svc.round1(grams[2])
        ));
    }

    @GetMapping("/macros/history")
    public ResponseEntity<List<MacrosRecord>> allMacros(Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        return ResponseEntity.ok(currentUser.getMacrosRecords());
    }
}