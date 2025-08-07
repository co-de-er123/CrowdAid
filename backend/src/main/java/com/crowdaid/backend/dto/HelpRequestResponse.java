package com.crowdaid.backend.dto;

import com.crowdaid.backend.model.HelpRequest;
import com.crowdaid.backend.model.User;

import java.time.Instant;

public class HelpRequestResponse {
    private Long id;
    private String description;
    private UserProfile requester;
    private UserProfile volunteer;
    private String address;
    private Double latitude;
    private Double longitude;
    private HelpRequest.Status status;
    private Instant createdAt;
    private Instant updatedAt;

    public HelpRequestResponse(HelpRequest helpRequest) {
        this.id = helpRequest.getId();
        this.description = helpRequest.getDescription();
        this.requester = new UserProfile(helpRequest.getRequester());
        if (helpRequest.getVolunteer() != null) {
            this.volunteer = new UserProfile(helpRequest.getVolunteer());
        }
        this.address = helpRequest.getAddress();
        this.latitude = helpRequest.getLatitude();
        this.longitude = helpRequest.getLongitude();
        this.status = helpRequest.getStatus();
        this.createdAt = helpRequest.getCreatedAt();
        this.updatedAt = helpRequest.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UserProfile getRequester() {
        return requester;
    }

    public void setRequester(UserProfile requester) {
        this.requester = requester;
    }

    public UserProfile getVolunteer() {
        return volunteer;
    }

    public void setVolunteer(UserProfile volunteer) {
        this.volunteer = volunteer;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public HelpRequest.Status getStatus() {
        return status;
    }

    public void setStatus(HelpRequest.Status status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
