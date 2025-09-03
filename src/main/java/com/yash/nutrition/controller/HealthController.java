package com.yash.nutrition.controller;

import com.yash.nutrition.dto.*;
import com.yash.nutrition.entity.*;
import com.yash.nutrition.repository.*;
import com.yash.nutrition.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final HealthService svc;
    private final BMIRepository bmiRepository;
    private final CaloriesRepository caloriesRepository;
    private final MacrosRepository macrosRepository;

    public HealthController(HealthService svc,
                            BMIRepository bmiRepository,
                            CaloriesRepository caloriesRepository,
                            MacrosRepository macrosRepository) {
        this.svc = svc;
        this.bmiRepository = bmiRepository;
        this.caloriesRepository = caloriesRepository;
        this.macrosRepository = macrosRepository;
    }

    @PostMapping("/bmi")
    public ResponseEntity<BMIResponse> bmi(@RequestBody BMIRequest req) {
        double bmi = svc.calcBMI(req.weightKg(), req.heightCm());
        String cat = svc.bmiCategory(bmi);

        BMIRecord record = new BMIRecord(
                req.weightKg(),
                req.heightCm(),
                svc.round1(bmi),
                cat
        );
        bmiRepository.save(record);

        return ResponseEntity.ok(new BMIResponse(svc.round1(bmi), cat));
    }

    @GetMapping("/bmi")
    public ResponseEntity<List<BMIRecord>> allBmi() {
        return ResponseEntity.ok(bmiRepository.findAll());
    }

    @PostMapping("/calories")
    public ResponseEntity<CaloriesResponse> calories(@RequestBody CaloriesRequest req) {
        double bmr = svc.bmr(req.sex(), req.weightKg(), req.heightCm(), req.age());
        double af  = svc.activityFactor(req.activityLevel());
        double tdee = bmr * af;
        double goal = svc.adjustForGoal(tdee, req.goal());

        // Save record
        CaloriesRecord rec = new CaloriesRecord(
                req.sex(),
                req.age(),
                req.weightKg(),
                req.heightCm(),
                req.activityLevel(),
                req.goal(),
                svc.round1(bmr),
                svc.round1(af),
                svc.round1(tdee),
                svc.round1(goal)
        );
        caloriesRepository.save(rec);

        return ResponseEntity.ok(new CaloriesResponse(
                svc.round1(bmr), svc.round1(af), svc.round1(tdee), svc.round1(goal)
        ));
    }

    @GetMapping("/calories")
    public ResponseEntity<List<CaloriesRecord>> allCalories() {
        return ResponseEntity.ok(caloriesRepository.findAll());
    }

    @PostMapping("/macros")
    public ResponseEntity<?> macros(@RequestBody MacrosRequest req) {
        double sum = req.proteinPercent() + req.fatPercent() + req.carbPercent();
        if (Math.abs(sum - 100.0) > 0.0001) {
            return ResponseEntity.badRequest().body("proteinPercent + fatPercent + carbPercent must equal 100");
        }
        double[] grams = svc.macrosGrams(req.calories(),
                req.proteinPercent(), req.fatPercent(), req.carbPercent());

        MacrosRecord rec = new MacrosRecord(
                req.calories(),
                req.proteinPercent(),
                req.fatPercent(),
                req.carbPercent(),
                svc.round1(grams[0]),
                svc.round1(grams[1]),
                svc.round1(grams[2])
        );
        macrosRepository.save(rec);

        return ResponseEntity.ok(new MacrosResponse(
                req.calories(),
                svc.round1(grams[0]),
                svc.round1(grams[1]),
                svc.round1(grams[2])
        ));
    }

    @GetMapping("/macros")
    public ResponseEntity<List<MacrosRecord>> allMacros() {
        return ResponseEntity.ok(macrosRepository.findAll());
    }
}
