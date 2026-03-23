package com.yash.nutrition.controller;

import com.yash.nutrition.dto.BMIRequest;
import com.yash.nutrition.dto.BMIResponse;
import com.yash.nutrition.entity.BMIRecord;
import com.yash.nutrition.entity.User;
import com.yash.nutrition.repository.BMIRepository;
import com.yash.nutrition.repository.UserRepository;
import com.yash.nutrition.service.BmiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bmi")
public class BmiController {

    private final BmiService bmiService;
    private final UserRepository userRepository;
    private final BMIRepository bmiRepository;

    public BmiController(BmiService bmiService, UserRepository userRepository, BMIRepository bmiRepository) {
        this.bmiService = bmiService;
        this.userRepository = userRepository;
        this.bmiRepository = bmiRepository;
    }

    @PostMapping
    public ResponseEntity<BMIResponse> bmi(@RequestBody BMIRequest req, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        
        double bmi = bmiService.calcBMI(req.weightKg(), req.heightCm());
        String cat = bmiService.bmiCategory(bmi);

        BMIRecord record = new BMIRecord(req.weightKg(), req.heightCm(), bmiService.round1(bmi), cat);
        record.setUser(currentUser);
        bmiRepository.save(record);

        return ResponseEntity.ok(new BMIResponse(bmiService.round1(bmi), cat));
    }

    @GetMapping("/history")
    public ResponseEntity<List<BMIRecord>> allBmi(Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        return ResponseEntity.ok(bmiRepository.findByUserOrderByCreatedAtAsc(currentUser));
    }
}
