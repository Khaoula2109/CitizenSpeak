package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.models.TrainingData;
import com.example.Backend_CitizenSpeak.repositories.TrainingDataRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import weka.classifiers.functions.SMO;
import weka.core.*;
import weka.core.converters.ConverterUtils.DataSource;
import weka.filters.Filter;
import weka.filters.unsupervised.attribute.StringToWordVector;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PriorityClassificationService {

    @Autowired
    private TrainingDataRepository trainingDataRepository;

    @Autowired
    private TextPreprocessorService textPreprocessorService;

    private SMO classifier;
    private StringToWordVector filter;
    private Instances trainingInstances;
    private boolean modelTrained = false;

    @PostConstruct
    public void initialize() {
        try {
            initializeTrainingData();
            trainModel();
        } catch (Exception e) {
            System.err.println("Erreur lors de l'initialisation du modèle ML: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void initializeTrainingData() {
        if (trainingDataRepository.count() == 0) {
            createInitialTrainingData();
        }
    }

    private void createInitialTrainingData() {
        List<TrainingData> initialData = Arrays.asList(
                // Haute priorité (1) - Français
                new TrainingData("Fuite d'eau majeure dans la rue principale, circulation bloquée", "Infrastructure", 1, "fuite,eau,circulation,bloque"),
                new TrainingData("Effondrement partiel du pont, danger imminent pour les usagers", "Infrastructure", 1, "effondrement,pont,danger,imminent"),
                new TrainingData("Panne d'électricité générale dans le quartier depuis 3 heures", "Energie", 1, "panne,electricite,generale,quartier"),
                new TrainingData("Accident grave sur l'autoroute, intervention urgente nécessaire", "Transport", 1, "accident,grave,autoroute,urgent"),
                new TrainingData("Incendie dans le bâtiment public, évacuation en cours", "Sécurité", 1, "incendie,batiment,evacuation,cours"),
                new TrainingData("Explosion de canalisation de gaz, périmètre de sécurité établi", "Sécurité", 1, "explosion,gaz,securite,perimetre"),
                new TrainingData("Inondation soudaine bloque les accès au centre-ville", "Environnement", 1, "inondation,acces,centre,ville"),
                new TrainingData("Fissure importante sur la chaussée, risque d'accident", "Infrastructure", 1, "fissure,chaussee,risque,accident"),

                // Haute priorité (1) - Anglais
                new TrainingData("Major water leak on main street, traffic blocked", "Infrastructure", 1, "major,water,leak,traffic,blocked"),
                new TrainingData("Partial bridge collapse, imminent danger for users", "Infrastructure", 1, "partial,bridge,collapse,imminent,danger"),
                new TrainingData("General power outage in the neighborhood for 3 hours", "Energy", 1, "general,power,outage,neighborhood,hours"),
                new TrainingData("Serious accident on highway, urgent intervention needed", "Transport", 1, "serious,accident,highway,urgent,intervention"),
                new TrainingData("Fire in public building, evacuation in progress", "Security", 1, "fire,public,building,evacuation,progress"),
                new TrainingData("Gas pipeline explosion, security perimeter established", "Security", 1, "gas,pipeline,explosion,security,perimeter"),
                new TrainingData("Sudden flood blocks access to city center", "Environment", 1, "sudden,flood,blocks,access,city,center"),
                new TrainingData("Major crack on roadway, accident risk", "Infrastructure", 1, "major,crack,roadway,accident,risk"),

                // Moyenne priorité (2) - Français
                new TrainingData("Nid de poule sur la route départementale, gêne la circulation", "Infrastructure", 2, "nid,poule,route,gene"),
                new TrainingData("Éclairage public défaillant dans plusieurs rues du quartier", "Energie", 2, "eclairage,defaillant,rues,quartier"),
                new TrainingData("Fuite d'eau mineure au niveau du trottoir", "Infrastructure", 2, "fuite,eau,mineure,trottoir"),
                new TrainingData("Poubelles non collectées depuis une semaine", "Environnement", 2, "poubelles,collectees,semaine"),
                new TrainingData("Dégradation de la signalisation routière, visibilité réduite", "Transport", 2, "degradation,signalisation,visibilite"),
                new TrainingData("Problème de chauffage dans l'école primaire", "Education", 2, "probleme,chauffage,ecole,primaire"),
                new TrainingData("Dysfonctionnement du système de vidange des égouts", "Infrastructure", 2, "dysfonctionnement,vidange,egouts"),
                new TrainingData("Dégâts causés par la tempête sur les équipements publics", "Infrastructure", 2, "degats,tempete,equipements,publics"),

                // Moyenne priorité (2) - Anglais
                new TrainingData("Pothole on departmental road, hinders traffic", "Infrastructure", 2, "pothole,departmental,road,hinders,traffic"),
                new TrainingData("Public lighting faulty in several neighborhood streets", "Energy", 2, "public,lighting,faulty,several,streets"),
                new TrainingData("Minor water leak at sidewalk level", "Infrastructure", 2, "minor,water,leak,sidewalk,level"),
                new TrainingData("Garbage not collected for a week", "Environment", 2, "garbage,not,collected,week"),
                new TrainingData("Road signage degradation, reduced visibility", "Transport", 2, "road,signage,degradation,reduced,visibility"),
                new TrainingData("Heating problem in elementary school", "Education", 2, "heating,problem,elementary,school"),
                new TrainingData("Sewer drainage system malfunction", "Infrastructure", 2, "sewer,drainage,system,malfunction"),
                new TrainingData("Storm damage on public equipment", "Infrastructure", 2, "storm,damage,public,equipment"),

                // Faible priorité (3) - Français
                new TrainingData("Suggestion d'installation de bancs dans le parc municipal", "Aménagement", 3, "suggestion,bancs,parc,municipal"),
                new TrainingData("Demande d'amélioration de l'aménagement paysager", "Aménagement", 3, "amelioration,amenagement,paysager"),
                new TrainingData("Proposition d'ajout de jeux pour enfants dans l'aire de loisirs", "Aménagement", 3, "proposition,jeux,enfants,loisirs"),
                new TrainingData("Demande de modernisation de l'éclairage décoratif", "Aménagement", 3, "modernisation,eclairage,decoratif"),
                new TrainingData("Suggestion de plantation d'arbres supplémentaires", "Environnement", 3, "plantation,arbres,supplementaires"),
                new TrainingData("Proposition d'amélioration esthétique de la façade", "Aménagement", 3, "amelioration,esthetique,facade"),
                new TrainingData("Demande d'installation de fontaines décoratives", "Aménagement", 3, "installation,fontaines,decoratives"),
                new TrainingData("Suggestion d'organisation d'événements culturels", "Culture", 3, "organisation,evenements,culturels"),

                // Faible priorité (3) - Anglais
                new TrainingData("Suggestion to install benches in municipal park", "Development", 3, "suggestion,install,benches,municipal,park"),
                new TrainingData("Request for landscape improvement", "Development", 3, "request,landscape,improvement"),
                new TrainingData("Proposal to add children's playground equipment", "Development", 3, "proposal,add,children,playground,equipment"),
                new TrainingData("Request for decorative lighting modernization", "Development", 3, "request,decorative,lighting,modernization"),
                new TrainingData("Suggestion for additional tree planting", "Environment", 3, "suggestion,additional,tree,planting"),
                new TrainingData("Proposal for aesthetic facade improvement", "Development", 3, "proposal,aesthetic,facade,improvement"),
                new TrainingData("Request for decorative fountain installation", "Development", 3, "request,decorative,fountain,installation"),
                new TrainingData("Suggestion for cultural events organization", "Culture", 3, "suggestion,cultural,events,organization")
        );

        trainingDataRepository.saveAll(initialData);
        System.out.println("Données d'entraînement initiales créées: " + initialData.size() + " exemples (FR/EN)");
    }

    public void trainModel() throws Exception {
        List<TrainingData> trainingData = trainingDataRepository.findAll();

        if (trainingData.isEmpty()) {
            throw new RuntimeException("Aucune donnée d'entraînement disponible");
        }

        ArrayList<Attribute> attributes = new ArrayList<>();
        attributes.add(new Attribute("text", (ArrayList<String>) null)); // Attribut texte

        ArrayList<String> classValues = new ArrayList<>();
        classValues.add("1"); // Haute
        classValues.add("2"); // Moyenne
        classValues.add("3"); // Faible
        attributes.add(new Attribute("priority", classValues));

        trainingInstances = new Instances("ComplaintPriority", attributes, trainingData.size());
        trainingInstances.setClassIndex(trainingInstances.numAttributes() - 1);

        for (TrainingData data : trainingData) {
            String preprocessedText = textPreprocessorService.preprocessText(
                    data.getText() + " " + (data.getKeywords() != null ? data.getKeywords() : "")
            );

            DenseInstance instance = new DenseInstance(2);
            instance.setValue(attributes.get(0), preprocessedText);
            instance.setValue(attributes.get(1), String.valueOf(data.getPriority()));
            instance.setDataset(trainingInstances);
            trainingInstances.add(instance);
        }

        filter = new StringToWordVector();
        filter.setAttributeIndices("1");
        filter.setWordsToKeep(1500);
        filter.setDoNotOperateOnPerClassBasis(true);
        filter.setLowerCaseTokens(true);
        filter.setTFTransform(true);
        filter.setIDFTransform(true);
        filter.setInputFormat(trainingInstances);

        Instances filteredData = Filter.useFilter(trainingInstances, filter);

        classifier = new SMO();
        classifier.buildClassifier(filteredData);

        modelTrained = true;
        System.out.println("Modèle ML bilingue (FR/EN) entraîné avec succès sur " + trainingData.size() + " exemples");
    }

    public int predictPriority(String title, String description, String category) {
        if (!modelTrained) {
            System.out.println("Modèle non entraîné, utilisation de la classification par mots-clés bilingue");
            return textPreprocessorService.predictPriorityByKeywords(title + " " + description);
        }

        try {
            String combinedText = textPreprocessorService.preprocessText(
                    title + " " + description + " " + (category != null ? category : "")
            );

            String detectedLanguage = textPreprocessorService.detectLanguage(combinedText);

            ArrayList<Attribute> attributes = new ArrayList<>();
            attributes.add(new Attribute("text", (ArrayList<String>) null));

            ArrayList<String> classValues = new ArrayList<>();
            classValues.add("1");
            classValues.add("2");
            classValues.add("3");
            attributes.add(new Attribute("priority", classValues));

            Instances testInstances = new Instances("Test", attributes, 1);
            testInstances.setClassIndex(testInstances.numAttributes() - 1);

            DenseInstance testInstance = new DenseInstance(2);
            testInstance.setValue(attributes.get(0), combinedText);
            testInstance.setDataset(testInstances);
            testInstances.add(testInstance);

            Instances filteredTest = Filter.useFilter(testInstances, filter);

            double prediction = classifier.classifyInstance(filteredTest.instance(0));
            int predictedPriority = (int) prediction + 1;

            System.out.println("Prédiction ML bilingue (" + detectedLanguage + "): priorité " + predictedPriority +
                    " pour le texte: " + combinedText.substring(0, Math.min(50, combinedText.length())));

            return predictedPriority;

        } catch (Exception e) {
            System.err.println("Erreur lors de la prédiction: " + e.getMessage());
            return textPreprocessorService.predictPriorityByKeywords(title + " " + description);
        }
    }

    public void addTrainingExample(String text, String category, int priority) {
        Set<String> keywords = textPreprocessorService.extractKeywords(text, 5);
        String keywordString = String.join(",", keywords);

        TrainingData newData = new TrainingData(text, category, priority, keywordString);
        trainingDataRepository.save(newData);

        try {
            if (trainingDataRepository.count() % 10 == 0) {
                trainModel();
                System.out.println("Modèle bilingue ré-entraîné avec les nouvelles données");
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du ré-entraînement: " + e.getMessage());
        }
    }

    public Map<String, Object> getModelStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("modelTrained", modelTrained);
        stats.put("trainingDataCount", trainingDataRepository.count());
        stats.put("supportedLanguages", Arrays.asList("fr", "en"));

        if (trainingDataRepository.count() > 0) {
            List<TrainingData> data = trainingDataRepository.findAll();
            Map<Integer, Long> priorityDistribution = data.stream()
                    .collect(Collectors.groupingBy(TrainingData::getPriority, Collectors.counting()));
            stats.put("priorityDistribution", priorityDistribution);

            Map<String, Long> languageDistribution = data.stream()
                    .collect(Collectors.groupingBy(
                            d -> textPreprocessorService.detectLanguage(d.getText()),
                            Collectors.counting()
                    ));
            stats.put("languageDistribution", languageDistribution);
        }

        return stats;
    }

}