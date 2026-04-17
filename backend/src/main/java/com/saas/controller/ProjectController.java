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
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private com.saas.repository.TaskRepository taskRepository;

    // Organization members can view all projects in their org
    // Regular users can view projects they are assigned to (or their org's projects)
    @GetMapping({"/api/org/projects", "/api/user/projects"})
    public List<Project> getAllProjects(@AuthenticationPrincipal User user) {
        if (user == null || user.getOrganization() == null) {
            return projectRepository.findAll(); // Admin fallback or unauthenticated
        }
        return projectRepository.findByOrganizationId(user.getOrganization().getId());
    }

    // Only Admins & Orgs can create projects
    @PostMapping("/api/org/projects")
    public ResponseEntity<Project> createProject(@RequestBody Project project, @AuthenticationPrincipal User user) {
        if (user != null && user.getOrganization() != null) {
            project.setOrganization(user.getOrganization());
        }
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    // Only Admins & Orgs can update projects
    @PutMapping("/api/org/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Project projectDetails, @AuthenticationPrincipal User user) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
            
        if (user != null && user.getOrganization() != null && project.getOrganization() != null 
                && !project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new ForbiddenException("Forbidden: You do not have permission to update this project.");
        }
        
        project.setName(projectDetails.getName() != null ? projectDetails.getName() : project.getName());
        project.setDescription(projectDetails.getDescription() != null ? projectDetails.getDescription() : project.getDescription());
        return ResponseEntity.ok(projectRepository.save(project));
    }

    // Only Admins & Orgs can delete projects
    @DeleteMapping("/api/org/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found."));

        if (user != null && user.getOrganization() != null && project.getOrganization() != null 
                && !project.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new ForbiddenException("Forbidden: You do not have permission to delete this project.");
        }
        
        // Delete associated tasks first to avoid foreign key constraints
        taskRepository.deleteByProjectId(id);
        
        projectRepository.deleteById(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Project and associated tasks successfully deleted."));
    }
}
