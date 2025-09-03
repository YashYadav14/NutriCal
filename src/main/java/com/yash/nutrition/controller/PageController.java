package com.yash.nutrition.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String home() {
        return "index";   // templates/index.html
    }

    @GetMapping("/bmi")
    public String bmiPage() {
        return "bmi";     // templates/bmi.html
    }

    @GetMapping("/calories")
    public String caloriesPage() {
        return "calories"; // templates/calories.html
    }

    @GetMapping("/macros")
    public String macrosPage() {
        return "macros";  // templates/macros.html
    }
}
