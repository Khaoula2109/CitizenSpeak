package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.DeviceToken;
import com.example.Backend_CitizenSpeak.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceTokenRepository extends MongoRepository<DeviceToken, String> {

    DeviceToken findByUserAndToken(User user, String token);

    List<DeviceToken> findByUserAndActiveTrue(User user);

}