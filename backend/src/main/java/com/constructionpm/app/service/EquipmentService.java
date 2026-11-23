package com.constructionpm.app.service;

import com.constructionpm.app.dto.EquipmentDto;
import com.constructionpm.app.entity.*;
import com.constructionpm.app.exception.BusinessException;
import com.constructionpm.app.exception.ResourceNotFoundException;
import com.constructionpm.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipmentService {

    private final EquipmentRepository equipmentRepo;
    private final EquipmentMaintenanceRepository maintenanceRepo;
    private final ProjectRepository projectRepo;

    public List<EquipmentDto> getAllEquipment() {
        return equipmentRepo.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public EquipmentDto createEquipment(EquipmentDto dto) {
        Equipment equipment = Equipment.builder()
                .name(dto.getName()).equipmentCode(dto.getEquipmentCode())
                .category(dto.getCategory()).model(dto.getModel())
                .manufacturer(dto.getManufacturer()).location(dto.getLocation()).notes(dto.getNotes())
                .build();
        return toDto(equipmentRepo.save(equipment));
    }

    @Transactional
    public EquipmentDto updateEquipment(Long id, EquipmentDto dto) {
        Equipment equipment = findById(id);
        equipment.setName(dto.getName()); equipment.setCategory(dto.getCategory());
        equipment.setModel(dto.getModel()); equipment.setManufacturer(dto.getManufacturer());
        equipment.setLocation(dto.getLocation()); equipment.setNotes(dto.getNotes());
        if (dto.getStatus() != null) equipment.setStatus(dto.getStatus());
        return toDto(equipmentRepo.save(equipment));
    }

    @Transactional
    public EquipmentDto assignToProject(Long equipmentId, Long projectId) {
        Equipment equipment = findById(equipmentId);
        if (equipment.getStatus() != Equipment.EquipmentStatus.AVAILABLE)
            throw new BusinessException("Equipment is not available for assignment");
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        equipment.setCurrentProject(project);
        equipment.setStatus(Equipment.EquipmentStatus.IN_USE);
        return toDto(equipmentRepo.save(equipment));
    }

    @Transactional
    public EquipmentDto releaseFromProject(Long equipmentId) {
        Equipment equipment = findById(equipmentId);
        equipment.setCurrentProject(null);
        equipment.setStatus(Equipment.EquipmentStatus.AVAILABLE);
        return toDto(equipmentRepo.save(equipment));
    }

    @Transactional
    public EquipmentMaintenance scheduleMaintenance(Long equipmentId, EquipmentMaintenance maintenance) {
        Equipment equipment = findById(equipmentId);
        maintenance.setEquipment(equipment);
        equipment.setStatus(Equipment.EquipmentStatus.MAINTENANCE);
        equipmentRepo.save(equipment);
        return maintenanceRepo.save(maintenance);
    }

    private Equipment findById(Long id) {
        return equipmentRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Equipment", id));
    }

    public EquipmentDto toDto(Equipment e) {
        EquipmentDto dto = new EquipmentDto();
        dto.setId(e.getId()); dto.setName(e.getName()); dto.setEquipmentCode(e.getEquipmentCode());
        dto.setCategory(e.getCategory()); dto.setModel(e.getModel()); dto.setManufacturer(e.getManufacturer());
        dto.setStatus(e.getStatus());
        if (e.getCurrentProject() != null) {
            dto.setCurrentProjectId(e.getCurrentProject().getId());
            dto.setCurrentProjectName(e.getCurrentProject().getName());
        }
        dto.setLocation(e.getLocation()); dto.setNotes(e.getNotes());
        dto.setActive(e.isActive()); dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
