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
}
