export interface DashboardStats {
  totalComplaints: number;
  newComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  resolutionRate: number;
}

export interface CategoryData {
  categoryId: string;
  label: string;
  count: number;
  description: string;
}

export interface MonthlyTrend {
  month: number;
  monthName: string;
  year: number;
  totalComplaints: number;
  categories: { [key: string]: number };
}

export interface GeographicalData {
  zone: string;
  count: number;
  latitude: number;
  longitude: number;
  dominantCategory: string;
}

export interface ResolutionData {
  category: string;
  averageResolutionTime: number;
  minResolutionTime: number;
  maxResolutionTime: number;
  totalResolved: number;
}

export interface PriorityAnalysis {
  high: number;
  medium: number;
  low: number;
  categoryBreakdown: { [category: string]: { [priority: string]: number } };
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}