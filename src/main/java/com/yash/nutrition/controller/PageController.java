package com.yash.nutrition.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String home() {
        // If user is already authenticated, redirect to dashboard
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return "redirect:/dashboard";
        }
        // Otherwise, show the public landing page
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        model.addAttribute("username", username);
        return "dashboard"; // templates/dashboard.html
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
