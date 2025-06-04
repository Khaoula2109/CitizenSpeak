package com.example.Backend_CitizenSpeak.config;

import com.example.Backend_CitizenSpeak.services.PriorityClassificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AIInitializationConfig implements CommandLineRunner {

    @Autowired
    private PriorityClassificationService priorityClassificationService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 Initialisation du système IA de priorisation des plaintes...");

        try {
            var stats = priorityClassificationService.getModelStatistics();
            System.out.println("✅ Système IA initialisé avec succès !");
            System.out.println("📊 Statistiques du modèle : " + stats);

        } catch (Exception e) {

            System.err.println("❌ Erreur lors de l'initialisation de l'IA : " + e.getMessage());
            e.printStackTrace();
        }
    }
}