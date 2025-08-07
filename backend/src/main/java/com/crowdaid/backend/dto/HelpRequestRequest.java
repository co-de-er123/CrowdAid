package com.crowdaid.backend.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class HelpRequestRequest {
    @NotBlank
    private String description;
    
    @NotBlank
    private String address;
    
    @NotNull
    private Double latitude;
    
    @NotNull
    private Double longitude;

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}
