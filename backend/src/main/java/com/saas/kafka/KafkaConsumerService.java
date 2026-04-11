package com.saas.kafka;

import com.saas.dto.EventPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "task-updates", groupId = "saas-group")
    public void consumeTaskUpdate(EventPayload event) {
        log.info("Received Task Update Event: {}", event);
        // Broadcast over WebSocket to all clients subscribed to /topic/tasks
        messagingTemplate.convertAndSend("/topic/tasks", event);
    }

    @KafkaListener(topics = "notifications", groupId = "saas-group")
    public void consumeNotification(EventPayload event) {
        log.info("Received Notification Event: {}", event);
        messagingTemplate.convertAndSend("/topic/notifications", event);
    }

    @KafkaListener(topics = "activity-logs", groupId = "saas-group")
    public void consumeActivityLog(EventPayload event) {
        log.info("Received Activity Log Event: {}", event);
        messagingTemplate.convertAndSend("/topic/activity", event);
    }
}
