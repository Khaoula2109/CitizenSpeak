package com.example.Backend_CitizenSpeak.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.Backend_CitizenSpeak.services.PriorityClassificationService;

@Configuration
@EnableScheduling
public class AIConfig {

    @Autowired
    private PriorityClassificationService priorityClassificationService;

    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledModelRetraining() {
        try {
            System.out.println("🔄 Début du ré-entraînement automatique du modèle IA...");
            priorityClassificationService.trainModel();
            System.out.println("✅ Ré-entraînement automatique terminé avec succès !");
        } catch (Exception e) {
            System.err.println("❌ Erreur lors du ré-entraînement automatique : " + e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 8 * * *") // 8h du matin
    public void dailyModelStatistics() {
        try {
            var stats = priorityClassificationService.getModelStatistics();
            System.out.println("📊 Statistiques quotidiennes du modèle IA : " + stats);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la génération des statistiques : " + e.getMessage());
        }
    }
}