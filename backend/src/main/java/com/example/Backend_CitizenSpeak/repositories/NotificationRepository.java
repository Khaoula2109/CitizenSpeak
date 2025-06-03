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

    List<Notification> findByRecipientOrderByCreatedDateDesc(User recipient);
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedDateDesc(User recipient);
    long countByRecipientAndIsReadFalse(User recipient);
    List<Notification> findByRecipientAndTypeOrderByCreatedDateDesc(User recipient, String type);
    List<Notification> findByRecipientAndPriorityOrderByCreatedDateDesc(User recipient, String priority);
    @Query("{}")
    List<Notification> findAllNotifications();
    @Query("{ 'recipient.$id' : ?0 }")
    List<Notification> findByRecipientId(String userId);
    @Query("{ 'recipient.$id' : ?0, 'createdDate' : { $gte: ?1 } }")
    List<Notification> findRecentNotificationsByUser(String userId, Date since);
    @Query("{ 'relatedComplaint.$id' : ?0 }")
    List<Notification> findByRelatedComplaintId(String complaintId);
    @Query(value = "{ 'createdDate' : { $lt: ?0 } }", delete = true)
    void deleteOldNotifications(Date beforeDate);
}