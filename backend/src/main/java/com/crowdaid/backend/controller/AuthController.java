package com.crowdaid.backend.controller;

import com.crowdaid.backend.dto.ApiResponse;
import com.crowdaid.backend.dto.JwtAuthenticationResponse;
import com.crowdaid.backend.dto.LoginRequest;
import com.crowdaid.backend.dto.SignUpRequest;
import com.crowdaid.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.authenticateUser(loginRequest);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        return authService.registerUser(signUpRequest);
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        return authService.logoutUser();
    }
}
