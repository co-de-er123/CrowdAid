package com.crowdaid.backend.controller;

import com.crowdaid.backend.dto.MessageResponse;
import com.crowdaid.backend.security.CurrentUser;
import com.crowdaid.backend.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Objects;

@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    private final SimpMessageSendingOperations messagingTemplate;

    @Autowired
    public WebSocketController(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handle incoming chat messages
     */
    @MessageMapping("/chat/{helpRequestId}/send")
    public void sendMessage(
            @DestinationVariable Long helpRequestId,
            @Payload MessageResponse message,
            Principal principal) {
        
        if (principal == null) {
            logger.warn("Unauthorized message attempt");
            return;
        }

        logger.info("Received message for help request {}: {}", helpRequestId, message);
        
        // The actual message is already saved via the REST API, we just need to forward it
        // to the other participant(s)
        String destination = "/topic/chat/" + helpRequestId;
        messagingTemplate.convertAndSend(destination, message);
        
        // Also send a notification to the recipient's private queue if they're online
        Long recipientId = message.getSender().getId().equals(principal.getName()) ? 
                message.getRecipientId() : Long.parseLong(principal.getName());
        
        if (recipientId != null) {
            String notificationDestination = "/queue/messages/" + recipientId;
            messagingTemplate.convertAndSendToUser(
                    recipientId.toString(), 
                    notificationDestination, 
                    message);
        }
    }

    /**
     * Handle typing indicators
     */
    @MessageMapping("/chat/{helpRequestId}/typing")
    public void typing(
            @DestinationVariable Long helpRequestId,
            @Payload String userId,
            Principal principal) {
        
        if (principal == null || !principal.getName().equals(userId)) {
            logger.warn("Unauthorized typing indicator from user: {}", userId);
            return;
        }

        // Forward the typing indicator to all participants except the sender
        String destination = "/topic/chat/" + helpRequestId + "/typing";
        messagingTemplate.convertAndSend(destination, userId);
    }

    /**
     * Handle read receipts
     */
    @MessageMapping("/chat/{helpRequestId}/read")
    public void markAsRead(
            @DestinationVariable Long helpRequestId,
            @Payload Long messageId,
            Principal principal) {
        
        if (principal == null) {
            return;
        }

        // In a real app, you would update the message status in the database here
        logger.info("Message {} marked as read by user {}", messageId, principal.getName());
        
        // Notify the sender that their message was read
        String destination = "/queue/messages/" + principal.getName() + "/read";
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                destination,
                messageId);
    }

    /**
     * Handle user presence (online/offline status)
     */
    @MessageMapping("/user/online")
    @SendToUser("/queue/online")
    public String handleUserOnline(Principal principal) {
        if (principal != null) {
            logger.info("User {} is online", principal.getName());
            return "ONLINE";
        }
        return "OFFLINE";
    }

    /**
     * Handle help request status updates
     */
    @MessageMapping("/request/{helpRequestId}/status")
    public void updateRequestStatus(
            @DestinationVariable Long helpRequestId,
            @Payload String status,
            Principal principal) {
        
        if (principal == null) {
            return;
        }

        logger.info("Help request {} status updated to: {} by user {}", 
                   helpRequestId, status, principal.getName());
        
        // Notify all interested parties about the status change
        String destination = "/topic/request/" + helpRequestId + "/status";
        messagingTemplate.convertAndSend(destination, status);
    }
}
