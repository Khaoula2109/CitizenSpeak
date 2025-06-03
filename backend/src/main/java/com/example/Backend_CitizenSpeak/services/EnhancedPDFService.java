package com.example.Backend_CitizenSpeak.services;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class EnhancedPDFService {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, BaseColor.DARK_GRAY);
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.BLACK);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
    private static final Font SMALL_FONT = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.GRAY);
    private static final Font BOLD_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.BLACK);

    private static final BaseColor PRIMARY_COLOR = new BaseColor(139, 90, 43);
    private static final BaseColor SECONDARY_COLOR = new BaseColor(218, 165, 32);
    private static final BaseColor ACCENT_COLOR = new BaseColor(255, 140, 0);

    public byte[] generateAnalysisReport(Map<String, Object> reportData) throws DocumentException, IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        HeaderFooterPageEvent event = new HeaderFooterPageEvent();
        writer.setPageEvent(event);

        document.open();

        try {
            addCoverPage(document, reportData);
            document.newPage();
            addTableOfContents(document, reportData);
            document.newPage();
            addExecutiveSummary(document, reportData);
            document.newPage();
            if (reportData.containsKey("statistics")) {
                addStatisticsSection(document, (Map<String, Object>) reportData.get("statistics"));
                document.newPage();
            }
            if (reportData.containsKey("categoryDistribution")) {
                addCategorySection(document, (List<Map<String, Object>>) reportData.get("categoryDistribution"));
                document.newPage();
            }
            if (reportData.containsKey("monthlyTrends")) {
                addTrendsSection(document, (List<Map<String, Object>>) reportData.get("monthlyTrends"));
                document.newPage();
            }
            if (reportData.containsKey("geographicalData")) {
                addGeographicalSection(document, (List<Map<String, Object>>) reportData.get("geographicalData"));
                document.newPage();
            }
            if (reportData.containsKey("resolutionAnalysis")) {
                addResolutionSection(document, (List<Map<String, Object>>) reportData.get("resolutionAnalysis"));
                document.newPage();
            }
            if (reportData.containsKey("priorityAnalysis")) {
                addPrioritySection(document, (Map<String, Object>) reportData.get("priorityAnalysis"));
                document.newPage();
            }
            if (reportData.containsKey("recommendations")) {
                addRecommendationsSection(document, (List<Map<String, Object>>) reportData.get("recommendations"));
            }

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void addCoverPage(Document document, Map<String, Object> reportData) throws DocumentException {
        Paragraph logo = new Paragraph("CitizenSpeak", new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, PRIMARY_COLOR));
        logo.setAlignment(Element.ALIGN_CENTER);
        logo.setSpacingAfter(30);
        document.add(logo);
        Paragraph title = new Paragraph((String) reportData.getOrDefault("title", "Rapport d'analyse des plaintes"), TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);
        Paragraph subtitle = new Paragraph("Analyse complète pour l'année " + reportData.getOrDefault("year", "N/A"),
                new Font(Font.FontFamily.HELVETICA, 14, Font.NORMAL, BaseColor.GRAY));
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(50);
        document.add(subtitle);
        PdfPTable infoTable = new PdfPTable(1);
        infoTable.setWidthPercentage(60);
        infoTable.setHorizontalAlignment(Element.ALIGN_CENTER);
        infoTable.setSpacingBefore(100);

        PdfPCell infoCell = new PdfPCell();
        infoCell.setBorderColor(PRIMARY_COLOR);
        infoCell.setBorderWidth(2);
        infoCell.setPadding(20);
        infoCell.setBackgroundColor(new BaseColor(248, 249, 250));

        SimpleDateFormat sdf = new SimpleDateFormat("dd MMMM yyyy 'à' HH:mm");
        String infoContent = String.format(
                "Date de génération: %s\n\n" +
                        "Année d'analyse: %s\n\n" +
                        "Système: CitizenSpeak Analytics\n\n" +
                        "Type: Rapport automatisé",
                sdf.format(new Date()),
                reportData.getOrDefault("year", "N/A")
        );

        Paragraph infoParagraph = new Paragraph(infoContent, NORMAL_FONT);
        infoParagraph.setAlignment(Element.ALIGN_CENTER);
        infoCell.addElement(infoParagraph);
        infoTable.addCell(infoCell);

        document.add(infoTable);
        Paragraph confidentiality = new Paragraph(
                "Ce rapport contient des informations analytiques basées sur les données des plaintes citoyennes. " +
                        "Il est destiné à un usage interne pour l'amélioration des services publics.",
                SMALL_FONT
        );
        confidentiality.setAlignment(Element.ALIGN_CENTER);
        confidentiality.setSpacingBefore(100);
        document.add(confidentiality);
    }

    private void addTableOfContents(Document document, Map<String, Object> reportData) throws DocumentException {
        addSectionTitle(document, "TABLE DES MATIÈRES");

        List<String> contents = List.of(
                "1. SOMMAIRE EXÉCUTIF ......................................................... 3",
                "2. STATISTIQUES GÉNÉRALES .................................................. 4",
                "3. ANALYSE PAR CATÉGORIE .................................................. 5",
                "4. TENDANCES MENSUELLES .................................................. 6",
                "5. DISTRIBUTION GÉOGRAPHIQUE ............................................ 7",
                "6. TEMPS DE RÉSOLUTION ................................................... 8",
                "7. ANALYSE DES PRIORITÉS ................................................. 9",
                "8. RECOMMANDATIONS ...................................................... 10"
        );

        for (String content : contents) {
            Paragraph item = new Paragraph(content, NORMAL_FONT);
            item.setSpacingAfter(8);
            document.add(item);
        }
    }

    private void addExecutiveSummary(Document document, Map<String, Object> reportData) throws DocumentException {
        addSectionTitle(document, "1. SOMMAIRE EXÉCUTIF");

        Map<String, Object> stats = (Map<String, Object>) reportData.get("statistics");
        if (stats != null) {
            PdfPTable summaryFrame = new PdfPTable(1);
            summaryFrame.setWidthPercentage(100);
            summaryFrame.setSpacingAfter(20);

            PdfPCell frameCell = new PdfPCell();
            frameCell.setBorderColor(ACCENT_COLOR);
            frameCell.setBorderWidth(2);
            frameCell.setPadding(15);
            frameCell.setBackgroundColor(new BaseColor(255, 248, 220));

            StringBuilder summary = new StringBuilder();
            summary.append(String.format("ANNÉE D'ANALYSE: %s\n\n", reportData.getOrDefault("year", "N/A")));
            summary.append(String.format("TOTAL DES PLAINTES: %s\n", stats.getOrDefault("totalComplaints", 0)));
            summary.append(String.format("PLAINTES RÉSOLUES: %s\n", stats.getOrDefault("resolvedComplaints", 0)));
            summary.append(String.format("TAUX DE RÉSOLUTION: %.1f%%\n\n", stats.getOrDefault("resolutionRate", 0.0)));

            double resolutionRate = (Double) stats.getOrDefault("resolutionRate", 0.0);
            String performance = resolutionRate >= 80 ? "EXCELLENTE" :
                    resolutionRate >= 60 ? "BONNE" :
                            resolutionRate >= 40 ? "MOYENNE" : "À AMÉLIORER";
            summary.append(String.format("ÉVALUATION GLOBALE: %s", performance));

            Paragraph summaryText = new Paragraph(summary.toString(), BOLD_FONT);
            frameCell.addElement(summaryText);
            summaryFrame.addCell(frameCell);

            document.add(summaryFrame);

            if (reportData.containsKey("categoryDistribution")) {
                try {
                    addCategoryPieChart(document, (List<Map<String, Object>>) reportData.get("categoryDistribution"));
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'ajout du graphique: " + e.getMessage());
                }
            }
        }
    }

    private void addCategoryPieChart(Document document, List<Map<String, Object>> categories) throws DocumentException {
        try {
            DefaultPieDataset dataset = new DefaultPieDataset();
            for (Map<String, Object> category : categories) {
                String label = (String) category.getOrDefault("label", "Inconnu");
                Integer count = (Integer) category.getOrDefault("count", 0);
                dataset.setValue(label, count);
            }

            JFreeChart chart = ChartFactory.createPieChart(
                    "Répartition des plaintes par catégorie",
                    dataset,
                    true, true, false
            );

            chart.setBackgroundPaint(Color.WHITE);
            chart.getTitle().setPaint(Color.DARK_GRAY);

            ByteArrayOutputStream chartStream = new ByteArrayOutputStream();
            org.jfree.chart.ChartUtils.writeChartAsPNG(chartStream, chart, 400, 300);

            Image chartImage = Image.getInstance(chartStream.toByteArray());
            chartImage.setAlignment(Element.ALIGN_CENTER);
            chartImage.scaleToFit(400, 300);

            document.add(chartImage);

        } catch (Exception e) {
            System.err.println("Erreur création graphique: " + e.getMessage());
        }
    }

    private static class HeaderFooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfPTable header = new PdfPTable(1);
            header.setWidthPercentage(100);
            header.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            header.getDefaultCell().setHorizontalAlignment(Element.ALIGN_CENTER);

            Phrase headerPhrase = new Phrase("CitizenSpeak - Rapport d'Analyse", SMALL_FONT);
            header.addCell(headerPhrase);
            header.writeSelectedRows(0, -1, 40, document.top() + 20, writer.getDirectContent());

            PdfPTable footer = new PdfPTable(3);
            footer.setWidthPercentage(100);
            footer.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            footer.getDefaultCell().setHorizontalAlignment(Element.ALIGN_LEFT);
            footer.addCell(new Phrase(new SimpleDateFormat("dd/MM/yyyy").format(new Date()), SMALL_FONT));

            footer.getDefaultCell().setHorizontalAlignment(Element.ALIGN_CENTER);
            footer.addCell(new Phrase("Confidentiel", SMALL_FONT));

            footer.getDefaultCell().setHorizontalAlignment(Element.ALIGN_RIGHT);
            footer.addCell(new Phrase("Page " + writer.getPageNumber(), SMALL_FONT));

            footer.writeSelectedRows(0, -1, 40, document.bottom() - 10, writer.getDirectContent());

        }
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        Paragraph sectionTitle = new Paragraph(title, HEADER_FONT);
        sectionTitle.setSpacingBefore(20);
        sectionTitle.setSpacingAfter(15);
        document.add(sectionTitle);
    }

    private void addStatisticsSection(Document document, Map<String, Object> stats) throws DocumentException {
        addSectionTitle(document, "2. STATISTIQUES GÉNÉRALES");
    }

    private void addCategorySection(Document document, List<Map<String, Object>> categories) throws DocumentException {
    }

    private void addTrendsSection(Document document, List<Map<String, Object>> trends) throws DocumentException {
    }

    private void addGeographicalSection(Document document, List<Map<String, Object>> geoData) throws DocumentException {
    }

    private void addResolutionSection(Document document, List<Map<String, Object>> resolutionData) throws DocumentException {
    }

    private void addPrioritySection(Document document, Map<String, Object> priorityData) throws DocumentException {
    }

    private void addRecommendationsSection(Document document, List<Map<String, Object>> recommendations) throws DocumentException {
    }
}