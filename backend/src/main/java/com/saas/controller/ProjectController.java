package com.saas.controller;

import com.saas.entity.Project;
import com.saas.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.saas.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

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
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails, @AuthenticationPrincipal User user) {
        return projectRepository.findById(id).map(project -> {
            if (user != null && project.getUserId() != null && !project.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).<Project>build();
            }
            project.setName(projectDetails.getName() != null ? projectDetails.getName() : project.getName());
            project.setDescription(projectDetails.getDescription() != null ? projectDetails.getDescription() : project.getDescription());
            return ResponseEntity.ok(projectRepository.save(project));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return projectRepository.findById(id).map(project -> {
            if (user != null && project.getUserId() != null && !project.getUserId().equals(user.getId())) {
                return ResponseEntity.status(403).<Void>build();
            }
            projectRepository.deleteById(id);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
