package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Notification;
import com.example.Backend_CitizenSpeak.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserOrderBySentDateDesc(User user);

    List<Notification> findByUserAndIsReadFalseOrderBySentDateDesc(User user);

    long countByUserAndIsReadFalse(User user);

    List<Notification> findByNotificationTypeOrderBySentDateDesc(String notificationType);


    List<Notification> findByComplaintIdOrderBySentDateDesc(String complaintId);

    List<Notification> findAllByOrderBySentDateDesc();

    List<Notification> findTop50ByOrderBySentDateDesc();

}
