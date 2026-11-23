package com.constructionpm.app.repository;

import com.constructionpm.app.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByActiveTrue();
    List<Equipment> findByStatus(Equipment.EquipmentStatus status);
    List<Equipment> findByCurrentProjectId(Long projectId);
    long countByStatus(Equipment.EquipmentStatus status);
}
