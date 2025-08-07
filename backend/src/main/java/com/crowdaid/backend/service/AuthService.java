package com.crowdaid.backend.service;

import com.crowdaid.backend.dto.JwtAuthenticationResponse;
import com.crowdaid.backend.dto.LoginRequest;
import com.crowdaid.backend.dto.SignUpRequest;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<?> authenticateUser(LoginRequest loginRequest);
    ResponseEntity<?> registerUser(SignUpRequest signUpRequest);
    ResponseEntity<?> logoutUser();
}
