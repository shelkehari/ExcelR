package com.constructionpm.app.controller;

import com.constructionpm.app.dto.WorkerDto;
import com.constructionpm.app.entity.WorkerAssignment;
import com.constructionpm.app.entity.WorkerAttendance;
import com.constructionpm.app.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<List<WorkerDto>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerDto> getWorker(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorker(id));
    }

    @PostMapping
    public ResponseEntity<WorkerDto> createWorker(@Valid @RequestBody WorkerDto dto) {
        return ResponseEntity.ok(workerService.createWorker(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerDto> updateWorker(@PathVariable Long id, @Valid @RequestBody WorkerDto dto) {
        return ResponseEntity.ok(workerService.updateWorker(id, dto));
    }

    @PostMapping("/{workerId}/assign")
    public ResponseEntity<WorkerAssignment> assignWorker(@PathVariable Long workerId,
                                                         @RequestParam Long projectId,
                                                         @RequestParam String role) {
        return ResponseEntity.ok(workerService.assignWorker(workerId, projectId, role));
    }

    @PostMapping("/assignments/{assignmentId}/release")
    public ResponseEntity<Void> releaseWorker(@PathVariable Long assignmentId) {
        workerService.releaseWorker(assignmentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/attendance")
    public ResponseEntity<WorkerAttendance> recordAttendance(@RequestParam Long workerId,
                                                             @RequestParam Long projectId,
                                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                             @RequestParam WorkerAttendance.AttendanceStatus status,
                                                             @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(workerService.recordAttendance(workerId, projectId, date, status, notes));
    }

    @GetMapping("/projects/{projectId}/assignments")
    public ResponseEntity<List<WorkerAssignment>> getProjectAssignments(@PathVariable Long projectId) {
        return ResponseEntity.ok(workerService.getProjectAssignments(projectId));
    }
}
