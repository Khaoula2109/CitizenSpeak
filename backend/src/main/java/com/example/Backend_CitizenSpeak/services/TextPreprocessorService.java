package com.example.Backend_CitizenSpeak.services;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TextPreprocessorService {

    private static final Set<String> STOP_WORDS = Set.of(
            // Français
            "le", "de", "et", "à", "un", "il", "être", "en", "avoir", "que", "pour",
            "dans", "ce", "son", "une", "sur", "avec", "ne", "se", "pas", "tout", "plus",
            "par", "grand", "bien", "autre", "comme", "sans", "pouvoir", "dire", "chaque",
            "où", "très", "notre", "leur", "si", "ces", "mais", "ou", "quand", "qui",
            "comment", "pourquoi", "est", "du", "la", "les", "des", "au", "aux", "cette",
            "ses", "mes", "tes", "nos", "vos", "leurs", "lui", "elle", "nous", "vous",
            "ils", "elles", "sa", "ta", "mon", "ton", "ma", "votre", "celui", "celle",
            "ceux", "celles", "quel", "quelle", "quels", "quelles", "dont", "peu", "beaucoup",
            // Anglais
            "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her",
            "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man",
            "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let",
            "put", "say", "she", "too", "use", "this", "that", "with", "have", "from",
            "they", "know", "want", "been", "good", "much", "some", "time", "very", "when",
            "come", "here", "just", "like", "long", "make", "many", "over", "such", "take",
            "than", "them", "well", "were", "what", "will", "would", "there", "could", "other"
    );

    private static final Map<Integer, Set<String>> URGENCY_KEYWORDS = Map.of(
            1, Set.of(
                    // Français - Haute priorité
                    "urgence", "urgent", "dangereux", "danger", "accident", "blessé", "fuite",
                    "effondrement", "inondation", "incendie", "explosion", "cassé", "bloqué",
                    "fermeture", "interrompu", "panne", "coupure", "catastrophe", "grave",
                    "immédiat", "critique", "prioritaire", "sécurité", "risque",
                    // Anglais - Haute priorité (SANS répéter "urgent", "danger", etc.)
                    "emergency", "dangerous", "injured", "leak", "collapse", "flood", "fire",
                    "broken", "blocked", "closure", "interrupted", "outage", "blackout",
                    "severe", "immediate", "critical", "priority", "security", "safety", "hazard"
            ),
            2, Set.of(
                    // Français - Moyenne priorité
                    "défaillant", "problème", "dysfonctionnement", "détérioré", "abîmé",
                    "dérangement", "gêne", "inconvénient", "réparation", "maintenance",
                    "amélioration", "dégradé", "usé", "vieux", "défectueux",
                    // Anglais - Moyenne priorité
                    "faulty", "problem", "issue", "malfunction", "deteriorated", "damaged",
                    "disturbance", "inconvenience", "repair", "improvement",
                    "degraded", "worn", "defective", "needs", "fixing"
            ),
            3, Set.of(
                    // Français - Faible priorité
                    "suggestion", "conseil", "proposition", "idée", "esthétique",
                    "confort", "optimisation", "embellissement", "modernisation",
                    // Anglais - Faible priorité (SANS répéter "improvement")
                    "advice", "proposal", "aesthetic", "comfort", "beautification",
                    "modernization", "enhancement", "upgrade", "recommendation"
            )
    );

    public String preprocessText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        // Normalisation et suppression des accents
        String normalized = Normalizer.normalize(text.toLowerCase(), Normalizer.Form.NFD);
        normalized = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");

        // Suppression de la ponctuation et caractères spéciaux
        normalized = normalized.replaceAll("[^a-zA-Z0-9\\s]", " ");

        // Suppression des espaces multiples
        normalized = normalized.replaceAll("\\s+", " ").trim();

        return normalized;
    }

    public List<String> tokenize(String text) {
        String processed = preprocessText(text);
        if (processed.isEmpty()) {
            return new ArrayList<>();
        }

        return Arrays.stream(processed.split("\\s+"))
                .filter(word -> word.length() > 2)
                .filter(word -> !STOP_WORDS.contains(word))
                .collect(Collectors.toList());
    }

    public int predictPriorityByKeywords(String text) {
        String processedText = preprocessText(text);

        int urgencyScore1 = 0, urgencyScore2 = 0, urgencyScore3 = 0;

        // Comptage des mots-clés de haute priorité (score x3)
        for (String keyword : URGENCY_KEYWORDS.get(1)) {
            if (processedText.contains(keyword)) {
                urgencyScore1 += 3;
            }
        }

        // Comptage des mots-clés de moyenne priorité (score x2)
        for (String keyword : URGENCY_KEYWORDS.get(2)) {
            if (processedText.contains(keyword)) {
                urgencyScore2 += 2;
            }
        }

        // Comptage des mots-clés de faible priorité (score x1)
        for (String keyword : URGENCY_KEYWORDS.get(3)) {
            if (processedText.contains(keyword)) {
                urgencyScore3 += 1;
            }
        }

        System.out.println("🔍 Scores par mots-clés: Haute=" + urgencyScore1 +
                ", Moyenne=" + urgencyScore2 +
                ", Faible=" + urgencyScore3);

        if (urgencyScore1 > urgencyScore2 && urgencyScore1 > urgencyScore3) {
            return 1; // Haute priorité
        } else if (urgencyScore2 > urgencyScore3) {
            return 2; // Moyenne priorité
        } else if (urgencyScore3 > 0) {
            return 3; // Faible priorité
        }

        return 2;
    }

    public Set<String> extractKeywords(String text, int maxKeywords) {
        List<String> tokens = tokenize(text);

        Map<String, Integer> wordCount = new HashMap<>();
        for (String token : tokens) {
            wordCount.put(token, wordCount.getOrDefault(token, 0) + 1);
        }

        return wordCount.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(maxKeywords)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    public String detectLanguage(String text) {
        String processedText = preprocessText(text);
        String[] words = processedText.split("\\s+");

        int frenchWords = 0;
        int englishWords = 0;

        Set<String> frenchStopWords = Set.of(
                "le", "de", "et", "à", "un", "il", "être", "en", "avoir", "que",
                "pour", "dans", "ce", "son", "une", "sur", "avec", "ne", "se", "pas"
        );

        Set<String> englishStopWords = Set.of(
                "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
                "her", "was", "one", "our", "out", "this", "that", "with", "have", "from"
        );

        for (String word : words) {
            if (frenchStopWords.contains(word)) {
                frenchWords++;
            }
            if (englishStopWords.contains(word)) {
                englishWords++;
            }
        }

        return frenchWords > englishWords ? "fr" : "en";
    }
}