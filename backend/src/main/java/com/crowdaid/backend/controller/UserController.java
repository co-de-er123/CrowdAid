package com.crowdaid.backend.controller;

import com.crowdaid.backend.dto.ApiResponse;
import com.crowdaid.backend.dto.UserProfile;
import com.crowdaid.backend.model.User;
import com.crowdaid.backend.repository.UserRepository;
import com.crowdaid.backend.security.CurrentUser;
import com.crowdaid.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));
        
        return ResponseEntity.ok(createUserProfile(user));
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable(value = "username") String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        return ResponseEntity.ok(createUserProfile(user));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateUserProfile(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody UserProfile updatedProfile) {
        
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));
        
        // Update user profile fields
        if (updatedProfile.getName() != null) {
            user.setName(updatedProfile.getName());
        }
        if (updatedProfile.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedProfile.getPhoneNumber());
        }
        if (updatedProfile.getAddress() != null) {
            user.setAddress(updatedProfile.getAddress());
        }
        if (updatedProfile.getLatitude() != null) {
            user.setLatitude(updatedProfile.getLatitude());
        }
        if (updatedProfile.getLongitude() != null) {
            user.setLongitude(updatedProfile.getLongitude());
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully"));
    }

    @PutMapping("/me/availability")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> updateAvailability(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam boolean available) {
        
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));
        
        user.setAvailable(available);
        userRepository.save(user);
        
        String message = available ? "You are now available to help" : "You are no longer available to help";
        return ResponseEntity.ok(new ApiResponse(true, message));
    }

    private UserProfile createUserProfile(User user) {
        return new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getLatitude(),
                user.getLongitude(),
                user.isAvailable()
        );
    }
}
