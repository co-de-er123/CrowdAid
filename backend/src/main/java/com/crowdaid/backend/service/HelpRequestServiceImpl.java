package com.crowdaid.backend.service;

import com.crowdaid.backend.dto.HelpRequestRequest;
import com.crowdaid.backend.dto.HelpRequestResponse;
import com.crowdaid.backend.exception.AppException;
import com.crowdaid.backend.exception.ResourceNotFoundException;
import com.crowdaid.backend.model.HelpRequest;
import com.crowdaid.backend.model.User;
import com.crowdaid.backend.repository.HelpRequestRepository;
import com.crowdaid.backend.repository.UserRepository;
import com.crowdaid.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HelpRequestServiceImpl implements HelpRequestService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double DEFAULT_RADIUS_KM = 10.0; // Default 10km radius

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public HelpRequestResponse createHelpRequest(HelpRequestRequest helpRequestRequest, UserPrincipal currentUser) {
        User requester = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        HelpRequest helpRequest = new HelpRequest();
        helpRequest.setDescription(helpRequestRequest.getDescription());
        helpRequest.setRequester(requester);
        helpRequest.setAddress(helpRequestRequest.getAddress());
        helpRequest.setLatitude(helpRequestRequest.getLatitude());
        helpRequest.setLongitude(helpRequestRequest.getLongitude());
        helpRequest.setStatus(HelpRequest.Status.PENDING);

        HelpRequest savedHelpRequest = helpRequestRepository.save(helpRequest);
        return new HelpRequestResponse(savedHelpRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public HelpRequestResponse getHelpRequestById(Long id, UserPrincipal currentUser) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", id));

        // Check if the current user is the requester or the assigned volunteer
        if (!helpRequest.getRequester().getId().equals(currentUser.getId()) &&
            (helpRequest.getVolunteer() == null || !helpRequest.getVolunteer().getId().equals(currentUser.getId()))) {
            throw new AppException("You don't have permission to view this help request");
        }

        return new HelpRequestResponse(helpRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HelpRequestResponse> getUserHelpRequests(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        List<HelpRequest> helpRequests = helpRequestRepository.findUserRequests(user);
        return helpRequests.stream()
                .map(HelpRequestResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HelpRequestResponse> getNearbyHelpRequests(Double lat, Double lng, Double radiusInKm, UserPrincipal currentUser) {
        if (lat == null || lng == null) {
            throw new AppException("Latitude and longitude are required");
        }

        // If radius is not provided, use the default
        double radius = radiusInKm != null ? radiusInKm : DEFAULT_RADIUS_KM;

        // Calculate bounding box coordinates for the search area
        double[] boundingBox = calculateBoundingBox(lat, lng, radius);
        
        // Get pending requests within the bounding box
        List<HelpRequest> nearbyRequests = helpRequestRepository.findNearbyPendingRequests(
                boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);

        // Filter by distance and map to response DTOs
        return nearbyRequests.stream()
                .filter(request -> calculateDistance(lat, lng, request.getLatitude(), request.getLongitude()) <= radius)
                .map(HelpRequestResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HelpRequestResponse acceptHelpRequest(Long id, UserPrincipal currentUser) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", id));

        // Check if the help request is already accepted
        if (helpRequest.getStatus() != HelpRequest.Status.PENDING) {
            throw new AppException("This help request is no longer available");
        }

        // Check if the current user is a volunteer
        if (!currentUser.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_VOLUNTEER"))) {
            throw new AppException("Only volunteers can accept help requests");
        }

        User volunteer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        helpRequest.setVolunteer(volunteer);
        helpRequest.setStatus(HelpRequest.Status.ACCEPTED);
        
        HelpRequest updatedRequest = helpRequestRepository.save(helpRequest);
        return new HelpRequestResponse(updatedRequest);
    }

    @Override
    @Transactional
    public HelpRequestResponse updateHelpRequestStatus(Long id, String status, UserPrincipal currentUser) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", id));

        // Check if the current user is the requester or the assigned volunteer
        if (!helpRequest.getRequester().getId().equals(currentUser.getId()) &&
            (helpRequest.getVolunteer() == null || !helpRequest.getVolunteer().getId().equals(currentUser.getId()))) {
            throw new AppException("You don't have permission to update this help request");
        }

        try {
            HelpRequest.Status newStatus = HelpRequest.Status.valueOf(status.toUpperCase());
            helpRequest.setStatus(newStatus);
            HelpRequest updatedRequest = helpRequestRepository.save(helpRequest);
            return new HelpRequestResponse(updatedRequest);
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid status: " + status);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteHelpRequest(Long id, UserPrincipal currentUser) {
        HelpRequest helpRequest = helpRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", id));

        // Only the requester can delete the help request
        if (!helpRequest.getRequester().getId().equals(currentUser.getId())) {
            throw new AppException("You don't have permission to delete this help request");
        }

        helpRequestRepository.delete(helpRequest);
        return ResponseEntity.ok().build();
    }

    // Helper method to calculate bounding box coordinates for a point and radius
    private double[] calculateBoundingBox(double lat, double lng, double radiusInKm) {
        // Convert latitude and longitude from degrees to radians
        double latRad = Math.toRadians(lat);
        double lngRad = Math.toRadians(lng);
        double angularDistance = radiusInKm / EARTH_RADIUS_KM;

        // Calculate minimum and maximum latitude
        double minLat = Math.toDegrees(latRad - angularDistance);
        double maxLat = Math.toDegrees(latRad + angularDistance);

        // Calculate minimum and maximum longitude (compensating for latitude)
        double deltaLng = Math.asin(Math.sin(angularDistance) / Math.cos(latRad));
        double minLng = Math.toDegrees(lngRad - deltaLng);
        double maxLng = Math.toDegrees(lngRad + deltaLng);

        return new double[]{minLat, maxLat, minLng, maxLng};
    }

    // Helper method to calculate distance between two points using Haversine formula
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
