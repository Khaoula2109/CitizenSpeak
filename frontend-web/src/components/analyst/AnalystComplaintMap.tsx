import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { analystService } from '../../utils/analystService';
import { Filter, MapPin, AlertCircle, CheckCircle, Clock, User, Calendar, Tag } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import {
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  convertPriorityToString,
  formatDate as formatDateUtil
} from '../../constants/complaintConstants';

interface ComplaintLocation {
  complaintId: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  status: string;
  category: {
    id: string;
    label: string;
  };
  priority: string;
  priorityLevel: number;
  isVerified: number;
  creationDate: string;
  citizen: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    service: string;
  };
  department?: string;
}

interface FilterOptions {
  status: string[];
  category: string[];
  priority: string[];
  verified: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface AnalystComplaintMapProps {
  selectedYear?: number;
  complaints?: any[];
  loading?: boolean;
}

export function AnalystComplaintMap({ 
  selectedYear = 2025, 
  complaints: externalComplaints, 
  loading: externalLoading 
}: AnalystComplaintMapProps) {
  const [complaints, setComplaints] = useState<ComplaintLocation[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<ComplaintLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    category: [],
    priority: [],
    verified: [],
    dateRange: { start: '', end: '' }
  });

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    high: 0,
    medium: 0,
    low: 0,
    verified: 0,
    unverified: 0
  });

  const statusOptions = [
    { value: 'New', label: 'Nouvelle' },
    { value: 'In Progress', label: 'En cours' },
    { value: 'Assigned', label: 'Assignée' },
    { value: 'Resolved', label: 'Résolue' },
    { value: 'Closed', label: 'Fermée' }
  ];
  
  const priorityOptions = [
    { value: 'high', label: 'Haute' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'low', label: 'Basse' }
  ];
  
  const verifiedOptions = [
    { value: 'verified', label: 'Vérifiées' },
    { value: 'unverified', label: 'Non vérifiées' }
  ];

  useEffect(() => {
    loadComplaintsData();
  }, [selectedYear]);

  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  const loadComplaintsData = async () => {
    try {
      setLoading(true);
      console.log(`Chargement des plaintes pour l'année ${selectedYear}...`);
      
      const response = await analystService.getAllComplaintsWithDetails(selectedYear);
      
      const complaintLocations: ComplaintLocation[] = response.data
        .filter((complaint: any) => complaint.latitude && complaint.longitude)
        .map((complaint: any) => ({
          complaintId: complaint.complaintId,
          title: complaint.title,
          description: complaint.description,
          lat: complaint.latitude,
          lng: complaint.longitude,
          status: complaint.status,
          category: complaint.category || { id: '', label: 'Non classé' },
          priority: complaint.priority || 'low',
          priorityLevel: complaint.priorityLevel || 3,
          isVerified: complaint.isVerified || 0,
          creationDate: complaint.creationDate,
          citizen: complaint.citizen || { name: 'Inconnu', email: '' },
          assignedTo: complaint.assignedTo,
          department: complaint.department
        }));

      console.log(`${complaintLocations.length} plaintes chargées pour ${selectedYear}`);
      setComplaints(complaintLocations);
      calculateStats(complaintLocations);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setComplaints([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (complaintsData: ComplaintLocation[]) => {
    const newStats = {
      total: complaintsData.length,
      new: complaintsData.filter(c => c.status === 'New').length,
      inProgress: complaintsData.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length,
      resolved: complaintsData.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
      high: complaintsData.filter(c => c.priority === 'high').length,
      medium: complaintsData.filter(c => c.priority === 'medium').length,
      low: complaintsData.filter(c => c.priority === 'low').length,
      verified: complaintsData.filter(c => c.isVerified === 1).length,
      unverified: complaintsData.filter(c => c.isVerified === 0).length
    };
    setStats(newStats);
  };

  const applyFilters = () => {
    let filtered = [...complaints];

    if (filters.status.length > 0) {
      filtered = filtered.filter(c => filters.status.includes(c.status));
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(c => filters.category.includes(c.category.label));
    }

    if (filters.priority.length > 0) {
      filtered = filtered.filter(c => filters.priority.includes(c.priority));
    }

    if (filters.verified.length > 0) {
      filtered = filtered.filter(c => {
        const isVerified = c.isVerified === 1;
        return filters.verified.includes(isVerified ? 'verified' : 'unverified');
      });
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(c => {
        const complaintDate = new Date(c.creationDate);
        return complaintDate >= startDate && complaintDate <= endDate;
      });
    }

    setFilteredComplaints(filtered);
    calculateStats(filtered);
  };

  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleFilter = (filterType: 'status' | 'category' | 'priority' | 'verified', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      category: [],
      priority: [],
      verified: [],
      dateRange: { start: '', end: '' }
    });
  };

  const getMarkerIcon = (complaint: ComplaintLocation) => {
    const statusColors = {
      'New': '#EF4444', 
      'In Progress': '#F59E0B', 
      'Assigned': '#3B82F6', 
      'Resolved': '#10B981', 
      'Closed': '#6B7280' 
    };

    const prioritySize = {
      'high': 25,
      'medium': 20,
      'low': 15
    };

    const color = statusColors[complaint.status as keyof typeof statusColors] || '#6B7280';
    const size = prioritySize[complaint.priority as keyof typeof prioritySize] || 15;
    
    const isVerified = complaint.isVerified === 1;
    const borderStyle = isVerified ? 'solid' : 'dashed';

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 3px ${borderStyle} ${isVerified ? '#059669' : '#DC2626'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: bold;
        ">
          ${complaint.priority === 'high' ? '!' : complaint.priority === 'medium' ? '•' : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size + 6, size + 6],
      iconAnchor: [(size + 6) / 2, (size + 6) / 2]
    });
  };

  const getStatusColorClass = (status: string) => {
    const colors = {
      'New': 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300',
      'In Progress': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300',
      'Assigned': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300',
      'Resolved': 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300',
      'Closed': 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || colors['New'];
  };

  const getPriorityColorClass = (priority: string) => {
    const colors = {
      'high': 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300',
      'medium': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300',
      'low': 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300'
    };
    return colors[priority as keyof typeof colors] || colors['low'];
  };

  const translateStatus = (status: string): string => {
    const translations = {
      'New': 'Nouvelle',
      'In Progress': 'En cours',
      'Assigned': 'Assignée',
      'Resolved': 'Résolue',
      'Closed': 'Fermée',
      'Intervention Scheduled': 'Intervention Planifiée'
    };
    return translations[status as keyof typeof translations] || status;
  };

  const translatePriority = (priority: string): string => {
    const translations = {
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return translations[priority as keyof typeof translations] || priority;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading || externalLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-[600px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-neutral-600 dark:text-gray-400">Chargement de la carte...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Carte interactive des plaintes
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Visualisation géographique - Année {selectedYear}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{stats.total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xl font-bold text-red-600">{stats.new}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Nouvelles</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">En cours</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Résolues</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{stats.verified}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Vérifiées</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xl font-bold text-gray-600">{stats.unverified}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Non vérifiées</div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => toggleFilter('status', option.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priorité
              </label>
              <div className="space-y-2">
                {priorityOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(option.value)}
                      onChange={() => toggleFilter('priority', option.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vérification
              </label>
              <div className="space-y-2">
                {verifiedOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verified.includes(option.value)}
                      onChange={() => toggleFilter('verified', option.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Période
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Date de début"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Date de fin"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Statut:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs">Nouvelle</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-xs">En cours</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs">Assignée</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs">Résolue</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Taille:</span>
            <span className="text-xs">Plus grand = Priorité élevée</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Bordure:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-green-600 border-solid rounded-full"></div>
              <span className="text-xs">Vérifiée</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-red-600 border-dashed rounded-full"></div>
              <span className="text-xs">Non vérifiée</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[600px] rounded-b-xl overflow-hidden">
        <MapContainer
          center={[33.9716, -6.8498]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredComplaints.map((complaint) => (
            <Marker
              key={complaint.complaintId}
              position={[complaint.lat, complaint.lng]}
              icon={getMarkerIcon(complaint)}
            >
              <Popup className="custom-popup" maxWidth={400}>
                <div className="p-4 min-w-[350px]">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-base leading-tight pr-2">
                      {complaint.title}
                    </h4>
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(complaint.status)}`}>
                        {translateStatus(complaint.status)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColorClass(complaint.priority)}`}>
                        {translatePriority(complaint.priority)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {complaint.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <Tag className="w-4 h-4 mr-1" />
                        Catégorie:
                      </span>
                      <span className="font-medium text-gray-900">{complaint.category.label}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        Date:
                      </span>
                      <span className="font-medium text-gray-900">{formatDate(complaint.creationDate)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-1" />
                        Citoyen:
                      </span>
                      <span className="font-medium text-gray-900">{complaint.citizen.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        {complaint.isVerified === 1 ? <CheckCircle className="w-4 h-4 mr-1 text-green-600" /> : <AlertCircle className="w-4 h-4 mr-1 text-red-600" />}
                        Statut:
                      </span>
                      <span className={`font-medium ${complaint.isVerified === 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {complaint.isVerified === 1 ? 'Vérifiée' : 'Non vérifiée'}
                      </span>
                    </div>

                    {complaint.assignedTo && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          Assigné à:
                        </span>
                        <span className="font-medium text-gray-900">{complaint.assignedTo.name}</span>
                      </div>
                    )}

                    {complaint.department && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Département:</span>
                        <span className="font-medium text-gray-900">{complaint.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}