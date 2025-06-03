import React from 'react';
import { CategoryChart } from './CategoryChart';
import { TrendsChart } from './TrendsChart';
import { GeographicalMap } from './GeographicalMap';
import { ResolutionAnalysis } from './ResolutionAnalysis';

interface CategoryData {
  categoryId: string;
  label: string;
  count: number;
  description: string;
}

interface MonthlyTrend {
  month: number;
  monthName: string;
  year: number;
  totalComplaints: number;
  categories: { [key: string]: number };
}

interface GeographicalData {
  zone: string;
  count: number;
  latitude: number;
  longitude: number;
  dominantCategory: string;
}

interface ResolutionData {
  category: string;
  averageResolutionTime: number;
  minResolutionTime: number;
  maxResolutionTime: number;
  totalResolved: number;
}

interface ChartsGridProps {
  categoryData: CategoryData[];
  monthlyTrends: MonthlyTrend[];
  geographicalData: GeographicalData[];
  resolutionData: ResolutionData[];
  loading: boolean;
  showMap: boolean;
}

export function ChartsGrid({
  categoryData,
  monthlyTrends,
  geographicalData,
  resolutionData,
  loading,
  showMap
}: ChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CategoryChart data={categoryData} isLoading={loading} />
      
      <TrendsChart data={monthlyTrends} />
      
      {!showMap && <GeographicalMap data={geographicalData} />}
      
      <ResolutionAnalysis data={resolutionData} />
    </div>
  );
}