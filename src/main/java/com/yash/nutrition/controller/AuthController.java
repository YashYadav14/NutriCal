package com.yash.nutrition.controller;

import com.yash.nutrition.dto.UserRegistrationDto;
import com.yash.nutrition.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login")
    public String login() {
        return "login"; // templates/login.html
    }

    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new UserRegistrationDto());
        return "register"; // templates/register.html
    }

    @PostMapping("/register")
    public String registerUserAccount(@ModelAttribute("user") UserRegistrationDto registrationDto, Model model) {
        try {
            userService.save(registrationDto);
            return "redirect:/login?success";
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }
}
