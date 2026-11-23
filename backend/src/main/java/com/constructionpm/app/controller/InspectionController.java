package com.constructionpm.app.controller;

import com.constructionpm.app.dto.InspectionDto;
import com.constructionpm.app.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping
    public ResponseEntity<List<InspectionDto>> getAllInspections() {
        return ResponseEntity.ok(inspectionService.getAllInspections());
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<List<InspectionDto>> getProjectInspections(@PathVariable Long projectId) {
        return ResponseEntity.ok(inspectionService.getProjectInspections(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InspectionDto> getInspection(@PathVariable Long id) {
        return ResponseEntity.ok(inspectionService.getInspection(id));
    }

    @PostMapping
    public ResponseEntity<InspectionDto> createInspection(@Valid @RequestBody InspectionDto dto) {
        return ResponseEntity.ok(inspectionService.createInspection(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InspectionDto> updateInspection(@PathVariable Long id, @Valid @RequestBody InspectionDto dto) {
        return ResponseEntity.ok(inspectionService.updateInspection(id, dto));
    }
}
