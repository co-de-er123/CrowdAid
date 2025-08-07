package com.crowdaid.backend.repository;

import com.crowdaid.backend.model.HelpRequest;
import com.crowdaid.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {
    List<HelpRequest> findByRequesterId(Long requesterId);
    List<HelpRequest> findByVolunteerId(Long volunteerId);
    
    @Query("SELECT hr FROM HelpRequest hr WHERE hr.status = 'PENDING' AND " +
           "(hr.latitude BETWEEN :minLat AND :maxLat) AND " +
           "(hr.longitude BETWEEN :minLng AND :maxLng)")
    List<HelpRequest> findNearbyPendingRequests(
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng
    );
    
    @Query("SELECT hr FROM HelpRequest hr WHERE hr.requester = :user OR hr.volunteer = :user")
    List<HelpRequest> findUserRequests(@Param("user") User user);
    
    long countByRequesterAndStatusIn(User requester, List<HelpRequest.Status> statuses);
    long countByVolunteerAndStatusIn(User volunteer, List<HelpRequest.Status> statuses);
}
