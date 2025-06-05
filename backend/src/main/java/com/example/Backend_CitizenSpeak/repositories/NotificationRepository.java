package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Notification;
import com.example.Backend_CitizenSpeak.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserOrderBySentDateDesc(User user);

    List<Notification> findByUserAndIsReadFalseOrderBySentDateDesc(User user);

    long countByUserAndIsReadFalse(User user);

    @Query(value = "{ $or: [ { 'createdDate': { $lt: ?0 } }, { 'sentDate': { $lt: ?0 } } ] }", delete = true)
    void deleteOldNotifications(Date beforeDate);

    List<Notification> findByRecipientOrderByCreatedDateDesc(User recipient);

    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedDateDesc(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    List<Notification> findByRecipientAndTypeOrderByCreatedDateDesc(User recipient, String type);

    List<Notification> findByRecipientAndPriorityOrderByCreatedDateDesc(User recipient, String priority);

    List<Notification> findByNotificationTypeOrderBySentDateDesc(String notificationType);

    List<Notification> findByComplaintIdOrderBySentDateDesc(String complaintId);

    List<Notification> findAllByOrderBySentDateDesc();

    List<Notification> findTop50ByOrderBySentDateDesc();
}