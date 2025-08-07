package com.crowdaid.backend.websocket;

import com.crowdaid.backend.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final SimpMessageSendingOperations messagingTemplate;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal != null && principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken authentication = (UsernamePasswordAuthenticationToken) principal;
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                logger.info("User connected: " + userPrincipal.getUsername());
                
                // You can add logic here to notify other users about this user's online status
                // For example, notify the user's contacts that they are now online
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        
        if (principal != null && principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken authentication = (UsernamePasswordAuthenticationToken) principal;
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                logger.info("User disconnected: " + userPrincipal.getUsername());
                
                // You can add logic here to notify other users about this user's offline status
                // For example, notify the user's contacts that they are now offline
                
                // Notify about disconnection
                String username = userPrincipal.getUsername();
                if (username != null) {
                    messagingTemplate.convertAndSend(
                        "/topic/user/" + username + "/disconnect", 
                        "Disconnected: " + username
                    );
                }
            }
        }
    }
}
