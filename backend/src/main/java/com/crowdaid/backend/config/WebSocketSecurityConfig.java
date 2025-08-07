package com.crowdaid.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99) // Ensure this runs before the main security config
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            // Allow all messages to be sent to these endpoints without authentication
            .simpSubscribeDestMatchers(
                "/topic/public/**",
                "/queue/errors/**"
            ).permitAll()
            // All other message types require authentication
            .anyMessage().authenticated();
    }

    @Override
    protected boolean sameOriginDisabled() {
        // Disable CSRF for WebSockets for now
        // In production, you might want to enable this and properly configure it
        return true;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Configure message broker
        registry.enableSimpleBroker(
            "/topic",  // For broadcasting to all subscribers
            "/queue"   // For sending to a specific user
        );
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the /ws endpoint for WebSocket connections
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Configure the channel to use our custom interceptor
        registration.interceptors(new WebSocketAuthChannelInterceptor());
    }
}
