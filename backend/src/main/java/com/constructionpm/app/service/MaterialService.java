package com.constructionpm.app.service;

import com.constructionpm.app.dto.MaterialDto;
import com.constructionpm.app.dto.MaterialTransactionDto;
import com.constructionpm.app.entity.*;
import com.constructionpm.app.exception.BusinessException;
import com.constructionpm.app.exception.ResourceNotFoundException;
import com.constructionpm.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialService {

    private final MaterialRepository materialRepo;
    private final MaterialTransactionRepository transactionRepo;
    private final ProjectRepository projectRepo;
    private final NotificationService notificationService;

    public List<MaterialDto> getAllMaterials() {
        return materialRepo.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    public MaterialDto getMaterial(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public MaterialDto createMaterial(MaterialDto dto) {
        Material material = Material.builder()
                .name(dto.getName()).category(dto.getCategory()).unit(dto.getUnit())
                .availableQuantity(dto.getAvailableQuantity() != null ? dto.getAvailableQuantity() : BigDecimal.ZERO)
                .reorderLevel(dto.getReorderLevel()).unitCost(dto.getUnitCost()).supplier(dto.getSupplier())
                .build();
        return toDto(materialRepo.save(material));
    }

    @Transactional
    public MaterialDto updateMaterial(Long id, MaterialDto dto) {
        Material material = findById(id);
        material.setName(dto.getName()); material.setCategory(dto.getCategory());
        material.setUnit(dto.getUnit()); material.setReorderLevel(dto.getReorderLevel());
        material.setUnitCost(dto.getUnitCost()); material.setSupplier(dto.getSupplier());
        return toDto(materialRepo.save(material));
    }

    @Transactional
    public MaterialTransactionDto recordTransaction(MaterialTransactionDto dto, User user) {
        Material material = findById(dto.getMaterialId());
        Project project = dto.getProjectId() != null ?
                projectRepo.findById(dto.getProjectId()).orElse(null) : null;

        if (dto.getType() == MaterialTransaction.TransactionType.CONSUMPTION) {
            if (material.getAvailableQuantity().compareTo(dto.getQuantity()) < 0)
                throw new BusinessException("Insufficient stock. Available: " + material.getAvailableQuantity() + " " + material.getUnit());
            material.setAvailableQuantity(material.getAvailableQuantity().subtract(dto.getQuantity()));
        } else if (dto.getType() == MaterialTransaction.TransactionType.PURCHASE) {
            material.setAvailableQuantity(material.getAvailableQuantity().add(dto.getQuantity()));
        } else if (dto.getType() == MaterialTransaction.TransactionType.RETURN) {
            material.setAvailableQuantity(material.getAvailableQuantity().add(dto.getQuantity()));
        }

        materialRepo.save(material);

        if (material.getAvailableQuantity().compareTo(material.getReorderLevel()) <= 0) {
            notificationService.createSystemNotification(
                    "Low Stock Alert",
                    "Material '" + material.getName() + "' is running low. Available: " + material.getAvailableQuantity() + " " + material.getUnit(),
                    Notification.NotificationType.LOW_STOCK, Notification.NotificationPriority.HIGH, material.getId()
            );
        }

        MaterialTransaction tx = MaterialTransaction.builder()
                .material(material).project(project).recordedBy(user)
                .type(dto.getType()).quantity(dto.getQuantity())
                .unitCost(dto.getUnitCost() != null ? dto.getUnitCost() : material.getUnitCost())
                .notes(dto.getNotes()).build();
        transactionRepo.save(tx);
        return toTransactionDto(tx);
    }

    public List<MaterialTransactionDto> getTransactionsByProject(Long projectId) {
        return transactionRepo.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(this::toTransactionDto).collect(Collectors.toList());
    }

    public List<Material> getLowStockMaterials() {
        return materialRepo.findLowStockMaterials();
    }

    private Material findById(Long id) {
        return materialRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Material", id));
    }

    public MaterialDto toDto(Material m) {
        MaterialDto dto = new MaterialDto();
        dto.setId(m.getId()); dto.setName(m.getName()); dto.setCategory(m.getCategory());
        dto.setUnit(m.getUnit()); dto.setAvailableQuantity(m.getAvailableQuantity());
        dto.setReorderLevel(m.getReorderLevel()); dto.setUnitCost(m.getUnitCost());
        dto.setSupplier(m.getSupplier()); dto.setActive(m.isActive()); dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    private MaterialTransactionDto toTransactionDto(MaterialTransaction tx) {
        MaterialTransactionDto dto = new MaterialTransactionDto();
        dto.setId(tx.getId()); dto.setMaterialId(tx.getMaterial().getId());
        dto.setMaterialName(tx.getMaterial().getName());
        if (tx.getProject() != null) { dto.setProjectId(tx.getProject().getId()); dto.setProjectName(tx.getProject().getName()); }
        dto.setType(tx.getType()); dto.setQuantity(tx.getQuantity());
        dto.setUnitCost(tx.getUnitCost()); dto.setNotes(tx.getNotes()); dto.setCreatedAt(tx.getCreatedAt());
        return dto;
    }
}
