package com.crowdaid.backend.controller;

import com.crowdaid.backend.dto.MessageRequest;
import com.crowdaid.backend.dto.MessageResponse;
import com.crowdaid.backend.security.CurrentUser;
import com.crowdaid.backend.security.UserPrincipal;
import com.crowdaid.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public MessageController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendMessage(
            @Valid @RequestBody MessageRequest messageRequest,
            @CurrentUser UserPrincipal currentUser) {
        
        MessageResponse response = messageService.sendMessage(messageRequest, currentUser);
        
        // Notify the recipient via WebSocket if they are online
        Long recipientId = getRecipientId(messageRequest.getHelpRequestId(), currentUser);
        if (recipientId != null) {
            String destination = "/queue/messages/" + recipientId;
            messagingTemplate.convertAndSend(destination, response);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{helpRequestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMessagesByHelpRequestId(
            @PathVariable Long helpRequestId,
            @CurrentUser UserPrincipal currentUser) {
        
        List<MessageResponse> messages = messageService.getMessagesByHelpRequestId(helpRequestId, currentUser);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{helpRequestId}/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUnreadMessageCount(
            @PathVariable Long helpRequestId,
            @CurrentUser UserPrincipal currentUser) {
        
        long count = messageService.getUnreadMessageCount(helpRequestId, currentUser);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{helpRequestId}/mark-as-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markMessagesAsRead(
            @PathVariable Long helpRequestId,
            @CurrentUser UserPrincipal currentUser) {
        
        messageService.markMessagesAsRead(helpRequestId, currentUser);
        return ResponseEntity.ok().build();
    }

    // WebSocket message handler for real-time messaging
    @MessageMapping("/chat/{helpRequestId}/send")
    public void handleChatMessage(
            @DestinationVariable Long helpRequestId,
            @Payload MessageRequest messageRequest,
            @CurrentUser UserPrincipal currentUser) {
        
        // Save the message and get the response
        MessageResponse response = messageService.sendMessage(messageRequest, currentUser);
        
        // Determine the recipient and send the message
        Long recipientId = getRecipientId(helpRequestId, currentUser);
        if (recipientId != null) {
            String destination = "/queue/messages/" + recipientId;
            messagingTemplate.convertAndSend(destination, response);
        }
        
        // Also send to the room for real-time updates
        String roomDestination = "/topic/chat/" + helpRequestId;
        messagingTemplate.convertAndSend(roomDestination, response);
    }

    // Helper method to determine the recipient of a message
    private Long getRecipientId(Long helpRequestId, UserPrincipal currentUser) {
        // In a real implementation, you would fetch the help request and determine the other participant
        // For now, we'll return null and handle the logic in the service layer
        return null;
    }
}
