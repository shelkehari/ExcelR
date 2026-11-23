package com.constructionpm.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Column(nullable = false)
    @Builder.Default
    private boolean read = false;

    private Long referenceId;
    private String referenceType;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum NotificationType {
        PROJECT_DELAYED, BUDGET_EXCEEDED, LOW_STOCK, INSPECTION_SCHEDULED,
        INSPECTION_ISSUE, EQUIPMENT_MAINTENANCE, MILESTONE_COMPLETED, GENERAL
    }

    public enum NotificationPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
