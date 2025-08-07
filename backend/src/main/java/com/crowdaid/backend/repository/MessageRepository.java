package com.crowdaid.backend.repository;

import com.crowdaid.backend.model.HelpRequest;
import com.crowdaid.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByHelpRequestOrderByCreatedAtAsc(HelpRequest helpRequest);
    
    List<Message> findByHelpRequestIdOrderByCreatedAtAsc(Long helpRequestId);
    
    long countByHelpRequestAndSenderIdNotAndReadFalse(HelpRequest helpRequest, Long senderId);
}
