package com.example.Backend_CitizenSpeak.config;

import com.example.Backend_CitizenSpeak.models.Category;
import com.example.Backend_CitizenSpeak.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Autowired
    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            List<Category> categories = Arrays.asList(
                    new Category("Déchets", "Signaler des ordures, des déchets ou des problèmes liés à la collecte des déchets"),
                    new Category("Routes", "Signaler des nids-de-poule, des dégradations de route ou des problèmes de voirie"),
                    new Category("Éclairage", "Signaler des lampadaires cassés ou des problèmes d'éclairage public"),
                    new Category("Vandalisme", "Signaler des graffitis, du vandalisme ou des dégradations de biens publics"),
                    new Category("Eau", "Signaler des fuites d'eau, des inondations ou des problèmes liés à l'eau"),
                    new Category("Végétation", "Signaler des problèmes liés aux arbres, aux espaces verts ou à la végétation"),
                    new Category("Bruit", "Signaler des nuisances sonores ou des problèmes de bruit"),
                    new Category("Autre", "Signaler tout autre problème non catégorisé")
            );

            categoryRepository.saveAll(categories);
            System.out.println("Categories initialized successfully");
        }
    }
}