package com.example.Backend_CitizenSpeak.config;

import com.example.Backend_CitizenSpeak.services.AnalystService;
import com.example.Backend_CitizenSpeak.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class NotificationScheduler {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AnalystService analystService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanOldNotifications() {
        System.out.println("Nettoyage des anciennes notifications...");
        notificationService.cleanOldNotifications();
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void performDailyAnalysis() {
        System.out.println("Analyse quotidienne des données...");
        analystService.performPeriodicAnalysis();
    }

    @Scheduled(cron = "0 0 9 * * MON")
    public void weeklyAnalystNotification() {
        System.out.println("Notification hebdomadaire aux analystes...");
        analystService.performPeriodicAnalysis();
    }
}