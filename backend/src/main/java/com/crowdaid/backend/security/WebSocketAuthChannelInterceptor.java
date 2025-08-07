package com.crowdaid.backend.security;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final String TOKEN_HEADER = "X-Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    private final JwtDecoder jwtDecoder;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthChannelInterceptor(JwtDecoder jwtDecoder, UserDetailsService userDetailsService) {
        this.jwtDecoder = jwtDecoder;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Get the Authorization header
            List<String> authHeaders = accessor.getNativeHeader(TOKEN_HEADER);
            String token = null;
            
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String bearerToken = authHeaders.get(0);
                if (bearerToken != null && bearerToken.startsWith(TOKEN_PREFIX)) {
                    token = bearerToken.substring(TOKEN_PREFIX.length());
                }
            }

            if (token != null) {
                try {
                    // Validate the token
                    Jwt jwt = jwtDecoder.decode(token);
                    
                    // Extract user identity from the token
                    String username = jwt.getSubject();
                    
                    if (username != null) {
                        // Load user details
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        
                        // Create authentication object
                        UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                userDetails, 
                                null, 
                                userDetails.getAuthorities()
                            );
                        
                        // Set the authentication in the SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        // Set the user in the session
                        accessor.setUser(authentication);
                    }
                } catch (JwtException e) {
                    // Token validation failed
                    throw new RuntimeException("Invalid JWT token");
                }
            } else {
                // No token provided
                throw new RuntimeException("No JWT token found");
            }
        }
        
        return message;
    }
}
