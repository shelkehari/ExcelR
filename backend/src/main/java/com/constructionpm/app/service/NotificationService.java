package com.constructionpm.app.service;

import com.constructionpm.app.dto.NotificationDto;
import com.constructionpm.app.entity.Notification;
import com.constructionpm.app.entity.User;
import com.constructionpm.app.repository.NotificationRepository;
import com.constructionpm.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;

    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationDto::from).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepo.markAllReadByUserId(userId);
    }

    @Transactional
    public void createNotification(User user, String title, String message,
                                    Notification.NotificationType type,
                                    Notification.NotificationPriority priority, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user).title(title).message(message).type(type).priority(priority)
                .referenceId(referenceId).build();
        notificationRepo.save(notification);
    }

    @Transactional
    public void createSystemNotification(String title, String message,
                                          Notification.NotificationType type,
                                          Notification.NotificationPriority priority, Long referenceId) {
        // Send to all admins and project managers
        userRepo.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole.ADMIN || u.getRole() == User.UserRole.PROJECT_MANAGER)
                .forEach(u -> createNotification(u, title, message, type, priority, referenceId));
    }
}
