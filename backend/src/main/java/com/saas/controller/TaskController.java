package com.saas.controller;

import com.saas.entity.Task;
import com.saas.kafka.KafkaProducerService;
import com.saas.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        
        // Publish to Kafka
        kafkaProducerService.sendTaskUpdate(saved, "CREATED");
        kafkaProducerService.sendActivityLog("User created task: " + saved.getTitle());
        
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        return taskRepository.findById(id).map(task -> {
            boolean statusChanged = taskDetails.getStatus() != null && !taskDetails.getStatus().equals(task.getStatus());
            
            task.setTitle(taskDetails.getTitle() != null ? taskDetails.getTitle() : task.getTitle());
            task.setDescription(taskDetails.getDescription() != null ? taskDetails.getDescription() : task.getDescription());
            task.setStatus(taskDetails.getStatus() != null ? taskDetails.getStatus() : task.getStatus());
            task.setPriority(taskDetails.getPriority() != null ? taskDetails.getPriority() : task.getPriority());
            task.setUpdatedAt(LocalDateTime.now());
            
            Task updatedTask = taskRepository.save(task);
            
            // Publish to Kafka
            kafkaProducerService.sendTaskUpdate(updatedTask, "UPDATED");
            
            if (statusChanged) {
                kafkaProducerService.sendNotification("Task '" + updatedTask.getTitle() + "' moved to " + updatedTask.getStatus(), updatedTask);
                kafkaProducerService.sendActivityLog("Task moved to " + updatedTask.getStatus());
            }
            
            return ResponseEntity.ok(updatedTask);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if(taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            kafkaProducerService.sendTaskUpdate(id, "DELETED");
            kafkaProducerService.sendActivityLog("Task deleted");
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
