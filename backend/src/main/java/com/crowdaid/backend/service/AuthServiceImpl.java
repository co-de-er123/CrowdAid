package com.crowdaid.backend.service;

import com.crowdaid.backend.dto.*;
import com.crowdaid.backend.exception.AppException;
import com.crowdaid.backend.model.Role;
import com.crowdaid.backend.model.RoleName;
import com.crowdaid.backend.model.User;
import com.crowdaid.backend.repository.RoleRepository;
import com.crowdaid.backend.repository.UserRepository;
import com.crowdaid.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtTokenProvider tokenProvider;

    @Override
    public ResponseEntity<?> authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsernameOrEmail(), 
                loginRequest.getUsernameOrEmail())
                .orElseThrow(() -> new AppException("User not found with username or email : " + 
                        loginRequest.getUsernameOrEmail()));

        return ResponseEntity.ok(new JwtAuthenticationResponse(
                jwt, 
                user.getId(),
                user.getUsername(),
                user.getEmail()
        ));
    }

    @Override
    public ResponseEntity<?> registerUser(SignUpRequest signUpRequest) {
        if(userRepository.existsByUsername(signUpRequest.getUsername())) {
            return new ResponseEntity<>(new ApiResponse(false, "Username is already taken!"),
                    HttpStatus.BAD_REQUEST);
        }

        if(userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new ResponseEntity<>(new ApiResponse(false, "Email Address already in use!"),
                    HttpStatus.BAD_REQUEST);
        }

        // Creating user's account
        User user = new User(signUpRequest.getName(), signUpRequest.getUsername(),
                signUpRequest.getEmail(), signUpRequest.getPassword());

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setPhoneNumber(signUpRequest.getPhoneNumber());
        user.setAddress(signUpRequest.getAddress());
        user.setLatitude(signUpRequest.getLatitude());
        user.setLongitude(signUpRequest.getLongitude());

        Set<RoleName> roles = new HashSet<>();
        
        if(signUpRequest.getRoles() == null || signUpRequest.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new AppException("User Role not set."));
            roles.add(userRole.getName());
        } else {
            signUpRequest.getRoles().forEach(role -> {
                switch(role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                                .orElseThrow(() -> new AppException("Admin Role not set."));
                        roles.add(adminRole.getName());
                        break;
                    case "volunteer":
                        Role volunteerRole = roleRepository.findByName(RoleName.ROLE_VOLUNTEER)
                                .orElseThrow(() -> new AppException("Volunteer Role not set."));
                        roles.add(volunteerRole.getName());
                        break;
                    default:
                        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                                .orElseThrow(() -> new AppException("User Role not set."));
                        roles.add(userRole.getName());
                }
            });
        }
        
        user.setRoles(roles);
        User result = userRepository.save(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/api/users/{username}")
                .buildAndExpand(result.getUsername()).toUri();

        return ResponseEntity.created(location).body(new ApiResponse(true, "User registered successfully"));
    }

    @Override
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new ApiResponse(true, "Logout successful"));
    }
}
