import React, { useState } from 'react';
import { StatsCards } from '../../components/analyst/StatsCards';
import { Recommendations } from '../../components/analyst/Recommendations';
import { ReportGenerator } from '../../components/analyst/ReportGenerator';
import { DashboardHeader } from '../../components/analyst/DashboardHeader';
import { ErrorBanner } from '../../components/analyst/ErrorBanner';
import { ControlsPanel } from '../../components/analyst/ControlsPanel';
import { YearInfoBanner } from '../../components/analyst/YearInfoBanner';
import { InteractiveMapSection } from '../../components/analyst/InteractiveMapSection';
import { ChartsGrid } from '../../components/analyst/ChartsGrid';
import { NoDataMessage } from '../../components/analyst/NoDataMessage';
import { LoadingState } from '../../components/analyst/LoadingState';
import { useAnalystDashboard } from '../../hooks/useAnalystDashboard';
import { useReportActions } from '../../hooks/useReportActions';

export function AnalystDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const {
    stats,
    categoryData,
    monthlyTrends,
    geographicalData,
    resolutionData,
    priorityAnalysis,
    recommendations,
    complaints,
    loading,
    error,
    loadDashboardData,
    handleRetry
  } = useAnalystDashboard(selectedYear);

  const { isGeneratingReport, generateYearlyReport } = useReportActions();

  const currentYear = new Date().getFullYear();

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleGenerateReport = () => {
    generateYearlyReport(selectedYear, stats);
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  const handleBackToCurrent = () => {
    setSelectedYear(currentYear);
  };

  if (loading) {
    return <LoadingState selectedYear={selectedYear} />;
  }

  const hasStats = Boolean(stats && stats.totalComplaints > 0);
  const hasError = Boolean(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader />

        {error && (
          <ErrorBanner error={error} onRetry={handleRetry} />
        )}

        <ControlsPanel
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onRefresh={handleRefresh}
          showMap={showMap}
          onToggleMap={toggleMapView}
          onGenerateReport={handleGenerateReport}
          loading={loading}
          isGeneratingReport={isGeneratingReport}
          hasStats={hasStats}
          hasError={hasError}
        />

        {!error && (
          <YearInfoBanner 
            selectedYear={selectedYear}
            totalComplaints={stats?.totalComplaints}
          />
        )}

        {stats && !error && <StatsCards stats={stats} />}

        {showMap && !error && (
          <InteractiveMapSection
            selectedYear={selectedYear}
            complaints={complaints}
            loading={loading}
          />
        )}

        {!error && (
          <ChartsGrid
            categoryData={categoryData}
            monthlyTrends={monthlyTrends}
            geographicalData={geographicalData}
            resolutionData={resolutionData}
            loading={loading}
            showMap={showMap}
          />
        )}

        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <Recommendations 
                recommendations={recommendations} 
                priorityAnalysis={priorityAnalysis} 
              />
            </div>
          </div>
        )}

        {showReportModal && (
          <ReportGenerator 
            onClose={() => setShowReportModal(false)}
            stats={stats}
            categoryData={categoryData}
            monthlyTrends={monthlyTrends}
            geographicalData={geographicalData}
            resolutionData={resolutionData}
            priorityAnalysis={priorityAnalysis}
            recommendations={recommendations}
            selectedYear={selectedYear}
          />
        )}

        {!loading && !error && (!stats || stats.totalComplaints === 0) && (
          <NoDataMessage 
            selectedYear={selectedYear}
            onBackToCurrent={handleBackToCurrent}
          />
        )}
      </div>
    </div>
  );
}