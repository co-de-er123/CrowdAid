package com.crowdaid.backend.controller;

import com.crowdaid.backend.dto.HelpRequestRequest;
import com.crowdaid.backend.dto.HelpRequestResponse;
import com.crowdaid.backend.security.CurrentUser;
import com.crowdaid.backend.security.UserPrincipal;
import com.crowdaid.backend.service.HelpRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/help-requests")
public class HelpRequestController {

    private final HelpRequestService helpRequestService;

    @Autowired
    public HelpRequestController(HelpRequestService helpRequestService) {
        this.helpRequestService = helpRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createHelpRequest(
            @Valid @RequestBody HelpRequestRequest helpRequestRequest,
            @CurrentUser UserPrincipal currentUser) {
        
        HelpRequestResponse response = helpRequestService.createHelpRequest(helpRequestRequest, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getHelpRequestById(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        
        HelpRequestResponse response = helpRequestService.getHelpRequestById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserHelpRequests(@CurrentUser UserPrincipal currentUser) {
        List<HelpRequestResponse> response = helpRequestService.getUserHelpRequests(currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nearby")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> getNearbyHelpRequests(
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng,
            @RequestParam(value = "radius", required = false) Double radiusInKm,
            @CurrentUser UserPrincipal currentUser) {
        
        List<HelpRequestResponse> response = helpRequestService.getNearbyHelpRequests(
            lat, lng, radiusInKm, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> acceptHelpRequest(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        
        HelpRequestResponse response = helpRequestService.acceptHelpRequest(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateHelpRequestStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @CurrentUser UserPrincipal currentUser) {
        
        HelpRequestResponse response = helpRequestService.updateHelpRequestStatus(id, status, currentUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteHelpRequest(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        
        return helpRequestService.deleteHelpRequest(id, currentUser);
    }
}
