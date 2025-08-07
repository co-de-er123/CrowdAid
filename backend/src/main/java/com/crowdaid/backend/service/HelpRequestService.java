package com.crowdaid.backend.service;

import com.crowdaid.backend.dto.HelpRequestRequest;
import com.crowdaid.backend.dto.HelpRequestResponse;
import com.crowdaid.backend.security.UserPrincipal;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface HelpRequestService {
    HelpRequestResponse createHelpRequest(HelpRequestRequest helpRequestRequest, UserPrincipal currentUser);
    HelpRequestResponse getHelpRequestById(Long id, UserPrincipal currentUser);
    List<HelpRequestResponse> getUserHelpRequests(UserPrincipal currentUser);
    List<HelpRequestResponse> getNearbyHelpRequests(Double lat, Double lng, Double radiusInKm, UserPrincipal currentUser);
    HelpRequestResponse acceptHelpRequest(Long id, UserPrincipal currentUser);
    HelpRequestResponse updateHelpRequestStatus(Long id, String status, UserPrincipal currentUser);
    ResponseEntity<?> deleteHelpRequest(Long id, UserPrincipal currentUser);
}
