package com.crowdaid.backend.dto;

import com.crowdaid.backend.model.Message;

import java.time.Instant;

public class MessageResponse {
    private Long id;
    private String content;
    private UserProfile sender;
    private Long helpRequestId;
    private Instant createdAt;
    private boolean isRead;

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.sender = new UserProfile(message.getSender());
        this.helpRequestId = message.getHelpRequest().getId();
        this.createdAt = message.getCreatedAt();
        this.isRead = message.isRead();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public UserProfile getSender() {
        return sender;
    }

    public void setSender(UserProfile sender) {
        this.sender = sender;
    }

    public Long getHelpRequestId() {
        return helpRequestId;
    }

    public void setHelpRequestId(Long helpRequestId) {
        this.helpRequestId = helpRequestId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}
