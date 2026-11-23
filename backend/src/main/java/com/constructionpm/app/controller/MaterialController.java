package com.constructionpm.app.controller;

import com.constructionpm.app.dto.MaterialDto;
import com.constructionpm.app.dto.MaterialTransactionDto;
import com.constructionpm.app.entity.Material;
import com.constructionpm.app.entity.User;
import com.constructionpm.app.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<MaterialDto>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialDto> getMaterial(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterial(id));
    }

    @PostMapping
    public ResponseEntity<MaterialDto> createMaterial(@Valid @RequestBody MaterialDto dto) {
        return ResponseEntity.ok(materialService.createMaterial(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialDto> updateMaterial(@PathVariable Long id, @Valid @RequestBody MaterialDto dto) {
        return ResponseEntity.ok(materialService.updateMaterial(id, dto));
    }

    @PostMapping("/transactions")
    public ResponseEntity<MaterialTransactionDto> recordTransaction(@Valid @RequestBody MaterialTransactionDto dto,
                                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.recordTransaction(dto, user));
    }

    @GetMapping("/projects/{projectId}/transactions")
    public ResponseEntity<List<MaterialTransactionDto>> getProjectTransactions(@PathVariable Long projectId) {
        return ResponseEntity.ok(materialService.getTransactionsByProject(projectId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Material>> getLowStockMaterials() {
        return ResponseEntity.ok(materialService.getLowStockMaterials());
    }
}
