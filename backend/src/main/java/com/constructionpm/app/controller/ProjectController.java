package com.constructionpm.app.controller;

import com.constructionpm.app.dto.*;
import com.constructionpm.app.entity.User;
import com.constructionpm.app.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<ProjectDto> updateProgress(@PathVariable Long id,
                                                     @RequestParam Integer progress,
                                                     @RequestParam(required = false) String notes,
                                                     @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.updateProgress(id, progress, notes, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/milestones")
    public ResponseEntity<List<MilestoneDto>> getMilestones(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getMilestones(id));
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<MilestoneDto> createMilestone(@PathVariable Long id, @Valid @RequestBody MilestoneDto dto) {
        return ResponseEntity.ok(projectService.createMilestone(id, dto));
    }

    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<MilestoneDto> updateMilestone(@PathVariable Long milestoneId, @Valid @RequestBody MilestoneDto dto) {
        return ResponseEntity.ok(projectService.updateMilestone(milestoneId, dto));
    }
}
