package com.crowdaid.backend.service;

import com.crowdaid.backend.dto.MessageRequest;
import com.crowdaid.backend.dto.MessageResponse;
import com.crowdaid.backend.exception.AppException;
import com.crowdaid.backend.exception.ResourceNotFoundException;
import com.crowdaid.backend.model.HelpRequest;
import com.crowdaid.backend.model.Message;
import com.crowdaid.backend.model.User;
import com.crowdaid.backend.repository.HelpRequestRepository;
import com.crowdaid.backend.repository.MessageRepository;
import com.crowdaid.backend.repository.UserRepository;
import com.crowdaid.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public MessageResponse sendMessage(MessageRequest messageRequest, UserPrincipal currentUser) {
        User sender = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        HelpRequest helpRequest = helpRequestRepository.findById(messageRequest.getHelpRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", messageRequest.getHelpRequestId()));

        // Check if the user is part of this help request (either requester or volunteer)
        if (!helpRequest.getRequester().getId().equals(currentUser.getId()) &&
            (helpRequest.getVolunteer() == null || !helpRequest.getVolunteer().getId().equals(currentUser.getId()))) {
            throw new AppException("You are not part of this help request");
        }

        Message message = new Message();
        message.setContent(messageRequest.getContent());
        message.setSender(sender);
        message.setHelpRequest(helpRequest);
        message.setRead(false);

        Message savedMessage = messageRepository.save(message);

        // Notify the other participant via WebSocket
        Long recipientId = helpRequest.getRequester().getId().equals(currentUser.getId()) ?
                (helpRequest.getVolunteer() != null ? helpRequest.getVolunteer().getId() : null) :
                helpRequest.getRequester().getId();

        if (recipientId != null) {
            String destination = "/queue/messages/" + recipientId;
            messagingTemplate.convertAndSend(destination, new MessageResponse(savedMessage));
        }

        return new MessageResponse(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesByHelpRequestId(Long helpRequestId, UserPrincipal currentUser) {
        HelpRequest helpRequest = helpRequestRepository.findById(helpRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", helpRequestId));

        // Check if the user is part of this help request
        if (!helpRequest.getRequester().getId().equals(currentUser.getId()) &&
            (helpRequest.getVolunteer() == null || !helpRequest.getVolunteer().getId().equals(currentUser.getId()))) {
            throw new AppException("You are not part of this help request");
        }

        // Mark messages as read when they are retrieved
        markMessagesAsRead(helpRequestId, currentUser);

        return messageRepository.findByHelpRequestOrderByCreatedAtAsc(helpRequest).stream()
                .map(MessageResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadMessageCount(Long helpRequestId, UserPrincipal currentUser) {
        HelpRequest helpRequest = helpRequestRepository.findById(helpRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", helpRequestId));

        // Check if the user is part of this help request
        if (!helpRequest.getRequester().getId().equals(currentUser.getId()) &&
            (helpRequest.getVolunteer() == null || !helpRequest.getVolunteer().getId().equals(currentUser.getId()))) {
            throw new AppException("You are not part of this help request");
        }

        // Count unread messages where the sender is not the current user
        return messageRepository.countByHelpRequestAndSenderIdNotAndReadFalse(
                helpRequest, currentUser.getId());
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long helpRequestId, UserPrincipal currentUser) {
        HelpRequest helpRequest = helpRequestRepository.findById(helpRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("HelpRequest", "id", helpRequestId));

        // Check if the user is part of this help request
        if (!helpRequest.getRequester().getId().equals(currentUser.getId()) &&
            (helpRequest.getVolunteer() == null || !helpRequest.getVolunteer().getId().equals(currentUser.getId()))) {
            throw new AppException("You are not part of this help request");
        }

        // Mark all messages from the other participant as read
        List<Message> unreadMessages = messageRepository.findByHelpRequest(helpRequest).stream()
                .filter(message -> !message.getSender().getId().equals(currentUser.getId()) && !message.isRead())
                .peek(message -> message.setRead(true))
                .collect(Collectors.toList());

        if (!unreadMessages.isEmpty()) {
            messageRepository.saveAll(unreadMessages);
        }
    }
}
