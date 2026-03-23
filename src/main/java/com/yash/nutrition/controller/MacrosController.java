package com.yash.nutrition.controller;

import com.yash.nutrition.dto.MacrosRequest;
import com.yash.nutrition.dto.MacrosResponse;
import com.yash.nutrition.entity.MacrosRecord;
import com.yash.nutrition.entity.User;
import com.yash.nutrition.repository.MacrosRepository;
import com.yash.nutrition.repository.UserRepository;
import com.yash.nutrition.service.MacrosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/macros")
public class MacrosController {

    private final MacrosService macrosService;
    private final UserRepository userRepository;
    private final MacrosRepository macrosRepository;

    public MacrosController(MacrosService macrosService, UserRepository userRepository, MacrosRepository macrosRepository) {
        this.macrosService = macrosService;
        this.userRepository = userRepository;
        this.macrosRepository = macrosRepository;
    }

    @PostMapping
    public ResponseEntity<?> macros(@RequestBody MacrosRequest req, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));

        double sum = req.proteinPercent() + req.fatPercent() + req.carbPercent();
        if (Math.abs(sum - 100.0) > 0.0001) {
            return ResponseEntity.badRequest().body("proteinPercent + fatPercent + carbPercent must equal 100");
        }
        double[] grams = macrosService.macrosGrams(req.calories(),
                req.proteinPercent(), req.fatPercent(), req.carbPercent());

        MacrosRecord rec = new MacrosRecord(
                req.calories(), req.proteinPercent(), req.fatPercent(), req.carbPercent(),
                macrosService.round1(grams[0]), macrosService.round1(grams[1]), macrosService.round1(grams[2])
        );
        rec.setUser(currentUser);
        macrosRepository.save(rec);

        return ResponseEntity.ok(new MacrosResponse(
                req.calories(), macrosService.round1(grams[0]), macrosService.round1(grams[1]), macrosService.round1(grams[2])
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<List<MacrosRecord>> allMacros(Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        return ResponseEntity.ok(macrosRepository.findByUserOrderByCreatedAtAsc(currentUser));
    }
}
