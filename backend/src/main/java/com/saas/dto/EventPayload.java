package com.saas.dto;

import java.time.LocalDateTime;

public class EventPayload {
    private String type;
    private String message;
    private Object data;
    private LocalDateTime timestamp = LocalDateTime.now();

    public EventPayload() {}

    public EventPayload(String type, String message, Object data) {
        this.type = type;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public EventPayload(String type, String message, Object data, LocalDateTime timestamp) {
        this.type = type;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
