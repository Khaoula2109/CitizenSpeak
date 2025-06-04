package com.example.Backend_CitizenSpeak.services;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.plot.PiePlot;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

@Service
public class PDFService {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, new BaseColor(41, 128, 185));
    private static final Font SUBTITLE_FONT = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(52, 73, 94));
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.BLACK);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
    private static final Font SMALL_FONT = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, new BaseColor(127, 140, 141));
    private static final Font ACCENT_FONT = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, new BaseColor(231, 76, 60));

    private static final BaseColor PRIMARY_COLOR = new BaseColor(52, 152, 219);
    private static final BaseColor SECONDARY_COLOR = new BaseColor(46, 204, 113);
    private static final BaseColor ACCENT_COLOR = new BaseColor(231, 76, 60);
    private static final BaseColor WARNING_COLOR = new BaseColor(241, 196, 15);
    private static final BaseColor LIGHT_GRAY = new BaseColor(248, 249, 250);
    private static final BaseColor DARK_HEADER = new BaseColor(52, 73, 94);

    private static final Map<String, String> MONTH_NAMES;
    static {
        Map<String, String> tempMap = new HashMap<>();
        tempMap.put("JANUARY", "Janvier");
        tempMap.put("FEBRUARY", "Février");
        tempMap.put("MARCH", "Mars");
        tempMap.put("APRIL", "Avril");
        tempMap.put("MAY", "Mai");
        tempMap.put("JUNE", "Juin");
        tempMap.put("JULY", "Juillet");
        tempMap.put("AUGUST", "Août");
        tempMap.put("SEPTEMBER", "Septembre");
        tempMap.put("OCTOBER", "Octobre");
        tempMap.put("NOVEMBER", "Novembre");
        tempMap.put("DECEMBER", "Décembre");
        MONTH_NAMES = Collections.unmodifiableMap(tempMap);
    }

    public byte[] generateAnalysisReport(Map<String, Object> reportData) throws DocumentException, IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        document.open();

        try {
            addImprovedReportHeader(document, reportData);
            addImprovedExecutiveSummary(document, reportData);
            if (reportData.containsKey("statistics")) {
                addImprovedStatisticsSection(document, (Map<String, Object>) reportData.get("statistics"));
            }
            if (reportData.containsKey("categoryDistribution")) {
                addImprovedCategorySection(document, (List<Map<String, Object>>) reportData.get("categoryDistribution"));
            }
            if (reportData.containsKey("monthlyTrends")) {
                addImprovedTrendsSection(document, (List<Map<String, Object>>) reportData.get("monthlyTrends"));
            }
            if (reportData.containsKey("geographicalData")) {
                addImprovedGeographicalSection(document, (List<Map<String, Object>>) reportData.get("geographicalData"));
            }
            if (reportData.containsKey("resolutionAnalysis")) {
                addImprovedResolutionSection(document, (List<Map<String, Object>>) reportData.get("resolutionAnalysis"));
            }
            if (reportData.containsKey("priorityAnalysis")) {
                addImprovedPrioritySection(document, (Map<String, Object>) reportData.get("priorityAnalysis"));
            }

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void addImprovedReportHeader(Document document, Map<String, Object> reportData) throws DocumentException {
        PdfPTable headerBg = new PdfPTable(1);
        headerBg.setWidthPercentage(100);
        PdfPCell bgCell = new PdfPCell();
        bgCell.setBackgroundColor(PRIMARY_COLOR);
        bgCell.setBorder(Rectangle.NO_BORDER);
        bgCell.setFixedHeight(15);
        headerBg.addCell(bgCell);
        document.add(headerBg);

        Paragraph title = new Paragraph((String) reportData.getOrDefault("title", "Rapport d'analyse des plaintes Citoyennes"), TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(70);
        headerTable.setSpacingAfter(25);
        headerTable.setHorizontalAlignment(Element.ALIGN_CENTER);

        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy à HH:mm");
        addStyledInfoCell(headerTable, " Date de génération", sdf.format(new Date()));
        addStyledInfoCell(headerTable, " Période d'analyse", "Année " + reportData.getOrDefault("year", "N/A").toString());

        document.add(headerTable);
        addColoredSeparator(document);
    }

    private void addImprovedExecutiveSummary(Document document, Map<String, Object> reportData) throws DocumentException, IOException {
        addStyledSectionTitle(document, "📈 SOMMAIRE EXÉCUTIF");

        Map<String, Object> stats = (Map<String, Object>) reportData.get("statistics");
        if (stats != null) {
            PdfPTable metricsTable = new PdfPTable(4);
            metricsTable.setWidthPercentage(100);
            metricsTable.setSpacingAfter(20);

            int totalComplaints = (Integer) stats.getOrDefault("totalComplaints", 0);
            int newComplaints = (Integer) stats.getOrDefault("newComplaints", 0);
            int resolvedComplaints = (Integer) stats.getOrDefault("resolvedComplaints", 0);
            double resolutionRate = totalComplaints > 0 ? (resolvedComplaints * 100.0 / totalComplaints) : 0.0;

            addMetricCard(metricsTable, "Total Plaintes", String.valueOf(totalComplaints), PRIMARY_COLOR);
            addMetricCard(metricsTable, "Nouvelles", String.valueOf(newComplaints), WARNING_COLOR);
            addMetricCard(metricsTable, "Résolues", String.valueOf(resolvedComplaints), SECONDARY_COLOR);
            addMetricCard(metricsTable, "Taux Résolution", String.format("%.1f%%", resolutionRate), ACCENT_COLOR);

            document.add(metricsTable);
            try {
                int inProgressComplaints = totalComplaints - newComplaints - resolvedComplaints;
                if (inProgressComplaints < 0) inProgressComplaints = 0;

                Map<String, Integer> statusData = new LinkedHashMap<>();
                if (newComplaints > 0) statusData.put("Nouvelles", newComplaints);
                if (resolvedComplaints > 0) statusData.put("Résolues", resolvedComplaints);
                if (inProgressComplaints > 0) statusData.put("En cours", inProgressComplaints);

                if (!statusData.isEmpty()) {
                    Image pieChart = createPieChart(statusData, "Distribution des Statuts", 450, 300);
                    pieChart.setAlignment(Element.ALIGN_CENTER);
                    document.add(pieChart);
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la création du graphique: " + e.getMessage());
            }
        }

        addColoredSeparator(document);
    }

    private void addImprovedStatisticsSection(Document document, Map<String, Object> stats) throws DocumentException {
    }

    private void addImprovedCategorySection(Document document, List<Map<String, Object>> categories) throws DocumentException, IOException {
        addStyledSectionTitle(document, "🏷️ ANALYSE PAR CATÉGORIE");

        if (categories != null && !categories.isEmpty()) {
            categories.sort((a, b) -> Integer.compare((Integer) b.get("count"), (Integer) a.get("count")));
            try {
                Image barChart = createBarChart(categories, "Répartition des Plaintes par Catégorie", "Catégories", "Nombre de Plaintes");
                barChart.setAlignment(Element.ALIGN_CENTER);
                barChart.scaleToFit(500, 300);
                document.add(barChart);

                document.add(new Paragraph(" ", NORMAL_FONT));
            } catch (Exception e) {
                System.err.println("Erreur lors de la création du graphique en barres: " + e.getMessage());
            }

            PdfPTable categoryTable = new PdfPTable(3);
            categoryTable.setWidthPercentage(100);
            categoryTable.setWidths(new float[]{3, 1, 4});
            categoryTable.setSpacingBefore(15);

            addStyledHeaderCell(categoryTable, "Catégorie");
            addStyledHeaderCell(categoryTable, "Nombre");
            addStyledHeaderCell(categoryTable, "Description");

            boolean alternate = false;
            for (Map<String, Object> category : categories) {
                BaseColor bgColor = alternate ? LIGHT_GRAY : BaseColor.WHITE;

                addStyledDataCell(categoryTable, (String) category.getOrDefault("label", "N/A"), bgColor);
                addStyledDataCell(categoryTable, category.getOrDefault("count", 0).toString(), bgColor);
                addStyledDataCell(categoryTable, (String) category.getOrDefault("description", ""), bgColor);

                alternate = !alternate;
            }

            document.add(categoryTable);
        }

        addColoredSeparator(document);
    }

    private void addImprovedTrendsSection(Document document, List<Map<String, Object>> trends) throws DocumentException, IOException {
        addStyledSectionTitle(document, "📅 TENDANCES MENSUELLES");

        if (trends != null && !trends.isEmpty()) {
            try {
                Image lineChart = createLineChart(trends, "Évolution Mensuelle des Plaintes", "Mois", "Nombre de Plaintes");
                lineChart.setAlignment(Element.ALIGN_CENTER);
                lineChart.scaleToFit(500, 300);
                document.add(lineChart);

                document.add(new Paragraph(" ", NORMAL_FONT));
            } catch (Exception e) {
                System.err.println("Erreur lors de la création du graphique linéaire: " + e.getMessage());
            }

            PdfPTable trendsTable = new PdfPTable(2);
            trendsTable.setWidthPercentage(60);
            trendsTable.setHorizontalAlignment(Element.ALIGN_CENTER);

            addStyledHeaderCell(trendsTable, "Mois");
            addStyledHeaderCell(trendsTable, "Plaintes");

            boolean alternate = false;
            for (Map<String, Object> trend : trends) {
                String monthKey = (String) trend.getOrDefault("monthName", "N/A");
                String monthName = MONTH_NAMES.getOrDefault(monthKey, monthKey);
                int currentCount = (Integer) trend.getOrDefault("totalComplaints", 0);

                BaseColor bgColor = alternate ? LIGHT_GRAY : BaseColor.WHITE;
                addStyledDataCell(trendsTable, monthName, bgColor);
                addStyledDataCell(trendsTable, String.valueOf(currentCount), bgColor);

                alternate = !alternate;
            }

            document.add(trendsTable);
        }

        addColoredSeparator(document);
    }
    private void addImprovedGeographicalSection(Document document, List<Map<String, Object>> geoData) throws DocumentException {
        addStyledSectionTitle(document, "🗺️ DISTRIBUTION GÉOGRAPHIQUE");

        if (geoData != null && !geoData.isEmpty()) {
            PdfPTable geoTable = new PdfPTable(3);
            geoTable.setWidthPercentage(90);
            geoTable.setHorizontalAlignment(Element.ALIGN_CENTER);

            addStyledHeaderCell(geoTable, "Zone Géographique");
            addStyledHeaderCell(geoTable, "Nombre de Plaintes");
            addStyledHeaderCell(geoTable, "Catégorie Dominante");

            geoData.sort((a, b) -> Integer.compare((Integer) b.get("count"), (Integer) a.get("count")));

            boolean alternate = false;
            for (Map<String, Object> zone : geoData) {
                BaseColor bgColor = alternate ? LIGHT_GRAY : BaseColor.WHITE;
                addStyledDataCell(geoTable, (String) zone.getOrDefault("zone", "N/A"), bgColor);
                addStyledDataCell(geoTable, zone.getOrDefault("count", 0).toString(), bgColor);
                addStyledDataCell(geoTable, (String) zone.getOrDefault("dominantCategory", "N/A"), bgColor);
                alternate = !alternate;
            }

            document.add(geoTable);
        }

        addColoredSeparator(document);
    }

    private void addImprovedResolutionSection(Document document, List<Map<String, Object>> resolutionData) throws DocumentException {
        addStyledSectionTitle(document, "⏱️ ANALYSE DES TEMPS DE RÉSOLUTION");

        if (resolutionData != null && !resolutionData.isEmpty()) {
            PdfPTable resolutionTable = new PdfPTable(4);
            resolutionTable.setWidthPercentage(100);

            addStyledHeaderCell(resolutionTable, "Catégorie");
            addStyledHeaderCell(resolutionTable, "Temps Moyen");
            addStyledHeaderCell(resolutionTable, "Plage (Min - Max)");
            addStyledHeaderCell(resolutionTable, "Nb Résolues");

            boolean alternate = false;
            for (Map<String, Object> resolution : resolutionData) {
                String category = (String) resolution.getOrDefault("category", "N/A");
                double avgTime = (Double) resolution.getOrDefault("averageResolutionTime", 0.0);
                long minTime = (Long) resolution.getOrDefault("minResolutionTime", 0L);
                long maxTime = (Long) resolution.getOrDefault("maxResolutionTime", 0L);
                int totalResolved = (Integer) resolution.getOrDefault("totalResolved", 0);

                BaseColor bgColor = alternate ? LIGHT_GRAY : BaseColor.WHITE;
                addStyledDataCell(resolutionTable, category, bgColor);
                addStyledDataCell(resolutionTable, String.format("%.1f jours", avgTime), bgColor);
                addStyledDataCell(resolutionTable, minTime + " - " + maxTime + " jours", bgColor);
                addStyledDataCell(resolutionTable, String.valueOf(totalResolved), bgColor);
                alternate = !alternate;
            }

            document.add(resolutionTable);
        }

        addColoredSeparator(document);
    }

    private void addImprovedPrioritySection(Document document, Map<String, Object> priorityData) throws DocumentException, IOException {
        addStyledSectionTitle(document, "⚡ ANALYSE DES PRIORITÉS");

        if (priorityData != null) {
            try {
                List<Map<String, Object>> priorityList = Arrays.asList(
                        Map.of("label", "Priorité Haute", "count", priorityData.getOrDefault("high", 0)),
                        Map.of("label", "Priorité Moyenne", "count", priorityData.getOrDefault("medium", 0)),
                        Map.of("label", "Priorité Basse", "count", priorityData.getOrDefault("low", 0))
                );

                Image priorityChart = createBarChart(priorityList, "Répartition par Priorité", "Niveau de Priorité", "Nombre de Plaintes");
                priorityChart.setAlignment(Element.ALIGN_CENTER);
                priorityChart.scaleToFit(400, 250);
                document.add(priorityChart);

                document.add(new Paragraph(" ", NORMAL_FONT));
            } catch (Exception e) {
                System.err.println("Erreur lors de la création du graphique des priorités: " + e.getMessage());
            }

            PdfPTable priorityTable = new PdfPTable(2);
            priorityTable.setWidthPercentage(60);
            priorityTable.setHorizontalAlignment(Element.ALIGN_CENTER);

            addStyledTableRow(priorityTable, "🔴 Priorité Haute", priorityData.getOrDefault("high", 0).toString(), false);
            addStyledTableRow(priorityTable, "🟡 Priorité Moyenne", priorityData.getOrDefault("medium", 0).toString(), true);
            addStyledTableRow(priorityTable, "🟢 Priorité Basse", priorityData.getOrDefault("low", 0).toString(), false);

            document.add(priorityTable);
        }

        addColoredSeparator(document);
    }

    private void addImprovedRecommendationsSection(Document document, List<Map<String, Object>> recommendations) throws DocumentException {
        addStyledSectionTitle(document, "💡 RECOMMANDATIONS STRATÉGIQUES");

        if (recommendations != null && !recommendations.isEmpty()) {
            int counter = 1;
            for (Map<String, Object> recommendation : recommendations) {
                Paragraph recTitle = new Paragraph(
                        counter + ". " + recommendation.getOrDefault("title", "Recommandation " + counter),
                        SUBTITLE_FONT
                );
                recTitle.setSpacingBefore(15);
                recTitle.setSpacingAfter(5);
                document.add(recTitle);

                String description = (String) recommendation.getOrDefault("description", "");
                if (!description.isEmpty()) {
                    Paragraph recDesc = new Paragraph(description, NORMAL_FONT);
                    recDesc.setIndentationLeft(20);
                    recDesc.setSpacingAfter(10);
                    recDesc.setAlignment(Element.ALIGN_JUSTIFIED);
                    document.add(recDesc);
                }

                counter++;
            }
        }
    }

    private void addStyledSectionTitle(Document document, String title) throws DocumentException {
        PdfPTable titleBg = new PdfPTable(1);
        titleBg.setWidthPercentage(100);
        titleBg.setSpacingBefore(20);
        titleBg.setSpacingAfter(15);

        PdfPCell titleCell = new PdfPCell(new Phrase(title, new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.WHITE)));
        titleCell.setBackgroundColor(DARK_HEADER);
        titleCell.setPadding(12);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleBg.addCell(titleCell);

        document.add(titleBg);
    }

    private void addColoredSeparator(Document document) throws DocumentException {
        PdfPTable separator = new PdfPTable(1);
        separator.setWidthPercentage(100);
        separator.setSpacingBefore(15);
        separator.setSpacingAfter(15);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(SECONDARY_COLOR);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setFixedHeight(3);
        separator.addCell(cell);

        document.add(separator);
    }

    private void addStyledInfoCell(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, HEADER_FONT));
        labelCell.setBackgroundColor(LIGHT_GRAY);
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(10);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, NORMAL_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(10);
        table.addCell(valueCell);
    }

    private void addMetricCard(PdfPTable table, String label, String value, BaseColor color) {
        PdfPTable cardTable = new PdfPTable(1);
        cardTable.setWidthPercentage(100);

        PdfPCell headerCell = new PdfPCell(new Phrase(label, new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE)));
        headerCell.setBackgroundColor(color);
        headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerCell.setPadding(8);
        headerCell.setBorder(Rectangle.NO_BORDER);
        cardTable.addCell(headerCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, color)));
        valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        valueCell.setPadding(12);
        valueCell.setBorder(Rectangle.LEFT | Rectangle.RIGHT | Rectangle.BOTTOM);
        valueCell.setBorderColor(color);
        cardTable.addCell(valueCell);

        PdfPCell containerCell = new PdfPCell(cardTable);
        containerCell.setBorder(Rectangle.NO_BORDER);
        containerCell.setPadding(5);
        table.addCell(containerCell);
    }

    private void addStyledHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE)));
        cell.setBackgroundColor(DARK_HEADER);
        cell.setPadding(10);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addStyledDataCell(PdfPTable table, String text, BaseColor backgroundColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(8);
        cell.setBorderColor(new BaseColor(220, 221, 225));
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }

    private void addStyledTableRow(PdfPTable table, String label, String value, boolean alternate) {
        BaseColor bgColor = alternate ? LIGHT_GRAY : BaseColor.WHITE;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, NORMAL_FONT));
        labelCell.setBackgroundColor(bgColor);
        labelCell.setPadding(8);
        labelCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, PRIMARY_COLOR)));
        valueCell.setBackgroundColor(bgColor);
        valueCell.setPadding(8);
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(valueCell);
    }

    private Image createPieChart(Map<String, Integer> data, String title, int width, int height) throws DocumentException, IOException {
        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
        data.forEach(dataset::setValue);

        JFreeChart chart = ChartFactory.createPieChart(title, dataset, true, true, false);

        chart.setBackgroundPaint(Color.WHITE);
        chart.getTitle().setPaint(Color.DARK_GRAY);
        chart.getTitle().setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 14));

        PiePlot plot = (PiePlot) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setLabelFont(new java.awt.Font("Arial", java.awt.Font.PLAIN, 10));

        plot.setSectionPaint("Résolues", new Color(46, 204, 113));
        plot.setSectionPaint("En cours", new Color(241, 196, 15));
        plot.setSectionPaint("Nouvelles", new Color(52, 152, 219));

        ByteArrayOutputStream chartStream = new ByteArrayOutputStream();
        ChartUtils.writeChartAsPNG(chartStream, chart, width, height);

        return Image.getInstance(chartStream.toByteArray());
    }

    private Image createBarChart(List<Map<String, Object>> data, String title, String xLabel, String yLabel) throws DocumentException, IOException {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        for (Map<String, Object> item : data) {
            String category = (String) item.getOrDefault("label", "N/A");
            Number value = (Number) item.getOrDefault("count", 0);
            dataset.addValue(value, "Plaintes", category);
        }

        JFreeChart chart = ChartFactory.createBarChart(title, xLabel, yLabel, dataset);

        chart.setBackgroundPaint(Color.WHITE);
        chart.getTitle().setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 14));

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setDomainGridlinesVisible(false);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);

        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, new Color(52, 152, 219));

        ByteArrayOutputStream chartStream = new ByteArrayOutputStream();
        ChartUtils.writeChartAsPNG(chartStream, chart, 500, 300);

        return Image.getInstance(chartStream.toByteArray());
    }

    private Image createLineChart(List<Map<String, Object>> trends, String title, String xLabel, String yLabel) throws DocumentException, IOException {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        for (Map<String, Object> trend : trends) {
            String monthKey = (String) trend.getOrDefault("monthName", "N/A");
            String monthName = MONTH_NAMES.getOrDefault(monthKey, monthKey);
            Number value = (Number) trend.getOrDefault("totalComplaints", 0);
            dataset.addValue(value, "Plaintes", monthName);
        }

        JFreeChart chart = ChartFactory.createLineChart(title, xLabel, yLabel, dataset);

        chart.setBackgroundPaint(Color.WHITE);
        chart.getTitle().setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 14));

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setDomainGridlinesVisible(false);
        plot.setRangeGridlinePaint(Color.LIGHT_GRAY);
        plot.getRenderer().setSeriesPaint(0, new Color(231, 76, 60));

        ByteArrayOutputStream chartStream = new ByteArrayOutputStream();
        ChartUtils.writeChartAsPNG(chartStream, chart, 500, 300);

        return Image.getInstance(chartStream.toByteArray());
    }
}