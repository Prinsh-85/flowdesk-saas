package com.saas.controller;

import com.saas.entity.Task;
import com.saas.kafka.KafkaProducerService;
import com.saas.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import com.saas.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    // Regular users can view tasks assigned strictly to them
    // Orgs can view all tasks (if they request tasks for their projects, they should filter by project, but we'll return all here for simplicity)
    @GetMapping({"/api/org/tasks", "/api/user/tasks"})
    public List<Task> getAllTasks(@AuthenticationPrincipal User user) {
        if (user == null) {
            return taskRepository.findAll(); // Fallback
        }
        return taskRepository.findByAssigneeId(user.getId()); // Note: Need to update TaskRepository to findByAssigneeId
    }

    // Only Admins & Orgs can create tasks
    @PostMapping("/api/org/tasks")
    public Task createTask(@RequestBody Task task, @AuthenticationPrincipal User user) {
        // Optional: Could check if user is an assignee here, but orgs create tasks
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);

        // Publish to Kafka
        kafkaProducerService.sendTaskUpdate(saved, "CREATED");
        kafkaProducerService.sendActivityLog("Task created: " + saved.getTitle());

        return saved;
    }

    // Users update their assigned task status. Orgs can update everything.
    @PutMapping({"/api/org/tasks/{id}", "/api/user/tasks/{id}"})
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task taskDetails,
            @AuthenticationPrincipal User user) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new com.saas.exception.ResourceNotFoundException("Task not found."));

        // If it's a regular user, verify they are assigned to it
        if (user != null && "USER".equals(user.getRole().toUpperCase())) {
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(user.getId())) {
                throw new com.saas.exception.ForbiddenException("Forbidden: You are not assigned to this task.");
            }
        }

        boolean statusChanged = taskDetails.getStatus() != null
                && !taskDetails.getStatus().equals(task.getStatus());

        if (taskDetails.getTitle() != null) task.setTitle(taskDetails.getTitle());
        if (taskDetails.getDescription() != null) task.setDescription(taskDetails.getDescription());
        if (taskDetails.getStatus() != null) task.setStatus(taskDetails.getStatus());
        if (taskDetails.getPriority() != null) task.setPriority(taskDetails.getPriority());
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);

        // Publish to Kafka
        kafkaProducerService.sendTaskUpdate(updatedTask, "UPDATED");

        if (statusChanged) {
            kafkaProducerService.sendNotification(
                    "Task '" + updatedTask.getTitle() + "' moved to " + updatedTask.getStatus(), updatedTask);
            kafkaProducerService.sendActivityLog("Task moved to " + updatedTask.getStatus());
        }

        return ResponseEntity.ok(updatedTask);
    }

    // Only Admins & Orgs can delete tasks
    @DeleteMapping("/api/org/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new com.saas.exception.ResourceNotFoundException("Task not found."));

        // Organization verification could be done here based on Project's organization
        taskRepository.deleteById(id);
        kafkaProducerService.sendTaskUpdate(id, "DELETED");
        kafkaProducerService.sendActivityLog("Task deleted");
        return ResponseEntity.ok(java.util.Map.of("message", "Task successfully deleted."));
    }
}
