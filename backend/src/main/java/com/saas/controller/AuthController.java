package com.saas.controller;

import com.saas.dto.AuthRequest;
import com.saas.dto.AuthResponse;
import com.saas.entity.User;
import com.saas.repository.UserRepository;
import com.saas.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            AuthResponse error = new AuthResponse();
            error.setMessage("Email already registered.");
            return ResponseEntity.badRequest().body(error);
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            AuthResponse error = new AuthResponse();
            error.setMessage("Password must be at least 6 characters.");
            return ResponseEntity.badRequest().body(error);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt
        user.setRole("Member");
        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId());

        AuthResponse res = new AuthResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
        res.setToken(token);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return userRepository.findByEmail(request.getEmail())
            .map(user -> {
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                    AuthResponse error = new AuthResponse();
                    error.setMessage("Wrong username or password.");
                    return ResponseEntity.status(401).body(error);
                }
                String token = jwtUtil.generateToken(user.getEmail(), user.getId());
                AuthResponse res = new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
                res.setToken(token);
                return ResponseEntity.ok(res);
            })
            .orElseGet(() -> {
                AuthResponse error = new AuthResponse();
                error.setMessage("Wrong username or password.");
                return ResponseEntity.status(401).body(error);
            });
    }
}
