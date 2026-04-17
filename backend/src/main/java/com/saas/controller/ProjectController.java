package com.saas.controller;

import com.saas.entity.Project;
import com.saas.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.saas.exception.ForbiddenException;
import com.saas.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.saas.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private com.saas.repository.TaskRepository taskRepository;

    @GetMapping
    public List<Project> getAllProjects(@AuthenticationPrincipal User user) {
        if (user == null) {
            return projectRepository.findAll(); // Fallback if no auth context
        }
        return projectRepository.findByUserId(user.getId());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project, @AuthenticationPrincipal User user) {
        if (user != null) {
            project.setUserId(user.getId());
        }
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Project projectDetails, @AuthenticationPrincipal User user) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
            
        if (user != null && project.getUserId() != null && !project.getUserId().equals(user.getId())) {
            throw new ForbiddenException("Forbidden: You do not have permission to update this project.");
        }
        
        project.setName(projectDetails.getName() != null ? projectDetails.getName() : project.getName());
        project.setDescription(projectDetails.getDescription() != null ? projectDetails.getDescription() : project.getDescription());
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (user != null && project.getUserId() != null && !project.getUserId().equals(user.getId())) {
            throw new ForbiddenException("Forbidden: You do not have permission to delete this project.");
        }
        
        // Delete associated tasks first to avoid foreign key constraints
        taskRepository.deleteByProjectId(id);
        
        projectRepository.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Project and associated tasks successfully deleted."));
    }
}
