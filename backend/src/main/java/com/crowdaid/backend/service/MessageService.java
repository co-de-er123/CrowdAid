package com.crowdaid.backend.service;

import com.crowdaid.backend.dto.MessageRequest;
import com.crowdaid.backend.dto.MessageResponse;
import com.crowdaid.backend.security.UserPrincipal;

import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(MessageRequest messageRequest, UserPrincipal currentUser);
    List<MessageResponse> getMessagesByHelpRequestId(Long helpRequestId, UserPrincipal currentUser);
    long getUnreadMessageCount(Long helpRequestId, UserPrincipal currentUser);
    void markMessagesAsRead(Long helpRequestId, UserPrincipal currentUser);
}
