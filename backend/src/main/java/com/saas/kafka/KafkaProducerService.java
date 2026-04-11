package com.saas.kafka;

import com.saas.dto.EventPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerService.class);

    private static final String TOPIC_TASKS = "task-updates";
    private static final String TOPIC_NOTIFICATIONS = "notifications";
    private static final String TOPIC_ACTIVITY = "activity-logs";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendTaskUpdate(Object taskData, String action) {
        try {
            EventPayload payload = new EventPayload("TASK_UPDATE", "Task " + action, taskData);
            kafkaTemplate.send(TOPIC_TASKS, payload);
            log.info("Published task update event: {}", action);
        } catch (Exception e) {
            log.warn("Kafka unavailable, skipping task update event: {}", e.getMessage());
        }
    }

    public void sendNotification(String message, Object metadata) {
        try {
            EventPayload payload = new EventPayload("NOTIFICATION", message, metadata);
            kafkaTemplate.send(TOPIC_NOTIFICATIONS, payload);
            log.info("Published notification: {}", message);
        } catch (Exception e) {
            log.warn("Kafka unavailable, skipping notification event: {}", e.getMessage());
        }
    }

    public void sendActivityLog(String userAction) {
        try {
            EventPayload payload = new EventPayload("ACTIVITY_LOG", userAction, null);
            kafkaTemplate.send(TOPIC_ACTIVITY, payload);
            log.info("Published activity log: {}", userAction);
        } catch (Exception e) {
            log.warn("Kafka unavailable, skipping activity log event: {}", e.getMessage());
        }
    }
}
