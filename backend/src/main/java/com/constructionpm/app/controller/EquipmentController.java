package com.constructionpm.app.controller;

import com.constructionpm.app.dto.EquipmentDto;
import com.constructionpm.app.entity.EquipmentMaintenance;
import com.constructionpm.app.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<List<EquipmentDto>> getAllEquipment() {
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @PostMapping
    public ResponseEntity<EquipmentDto> createEquipment(@Valid @RequestBody EquipmentDto dto) {
        return ResponseEntity.ok(equipmentService.createEquipment(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDto> updateEquipment(@PathVariable Long id, @Valid @RequestBody EquipmentDto dto) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, dto));
    }

    @PostMapping("/{equipmentId}/assign")
    public ResponseEntity<EquipmentDto> assignToProject(@PathVariable Long equipmentId,
                                                        @RequestParam Long projectId) {
        return ResponseEntity.ok(equipmentService.assignToProject(equipmentId, projectId));
    }

    @PostMapping("/{equipmentId}/release")
    public ResponseEntity<EquipmentDto> releaseFromProject(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(equipmentService.releaseFromProject(equipmentId));
    }

    @PostMapping("/{equipmentId}/maintenance")
    public ResponseEntity<EquipmentMaintenance> scheduleMaintenance(@PathVariable Long equipmentId,
                                                                    @RequestBody EquipmentMaintenance maintenance) {
        return ResponseEntity.ok(equipmentService.scheduleMaintenance(equipmentId, maintenance));
    }
}
