import React from 'react';
import { useDashboardData } from '../../hooks/useDashboard';
import { LoadingState, ErrorState } from '../../components/dashboard/LoadingErrorStates';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { StatsCards } from '../../components/dashboard/StatsCards';
import { StatusPieChart } from '../../components/dashboard/StatusPieChart';
import { TimelineChart } from '../../components/dashboard/TimelineChart';

export const Dashboard: React.FC = () => {
  const {
    loading,
    error,
    stats,
    statusData,
    timelineData,
    retryFetch,
    continueDemoMode
  } = useDashboardData();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={retryFetch}
        onContinueDemo={continueDemoMode}
      />
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader />
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart data={statusData} />
        <TimelineChart data={timelineData} />
      </div>
    </div>
  );
};