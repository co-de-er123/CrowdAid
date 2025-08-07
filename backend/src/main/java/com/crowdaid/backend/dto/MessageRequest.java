package com.crowdaid.backend.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class MessageRequest {
    @NotBlank
    private String content;
    
    @NotNull
    private Long helpRequestId;

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getHelpRequestId() {
        return helpRequestId;
    }

    public void setHelpRequestId(Long helpRequestId) {
        this.helpRequestId = helpRequestId;
    }
}
