package com.yash.nutrition.controller;

import com.yash.nutrition.entity.User;
import com.yash.nutrition.repository.UserRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public String adminPanel(Model model) {
        List<User> users = userRepository.findAll();
        model.addAttribute("users", users);
        return "admin-panel"; // Renders templates/admin-panel.html
    }

    @PostMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable("id") Long id) {
        userRepository.deleteById(id);
        return "redirect:/admin?deleted";
    }
}