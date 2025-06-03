import React, { useState, useEffect } from 'react';
import { X, Loader2, Brain, CheckCircle, AlertTriangle, User, Building2 } from 'lucide-react';
import api from '../../utils/api';
import { 
  getPriorityColor, 
  getPriorityLabel, 
  PRIORITY_OPTIONS 
} from '../../constants/complaintConstants';

interface Agent {
  id: string;
  name: string;
  service: string;
}

interface Department {
  departmentId: string;
  name: string;
}

interface Organization {
  organizationId: string;
  name: string;
  departments: Department[];
}

interface Complaint {
  complaintId: string;
  title: string;
  description: string;
  priorityLevel: number;
}

interface PriorityAnalysisModalProps {
  complaint: Complaint;
  onClose: () => void;
  onValidate: (
    priority: string, 
    accepted: boolean, 
    notes: string, 
    agentId?: string | null, 
    departmentId?: string | null
  ) => Promise<void>;
}

const useAgentsByDepartment = (departmentId: string) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    if (!departmentId) {
      setAgents([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/complaints/departments/${departmentId}/agents`);
      setAgents(response.data || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [departmentId]);

  return { agents, loading, error, refetch: fetchAgents };
};

const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/organizations');
      
      if (response.data) {
        response.data.forEach((org: Organization, index: number) => {
          console.log(`Organization ${index + 1}:`, {
            id: org.organizationId,
            name: org.name,
            departments: org.departments,
            departmentsCount: org.departments?.length || 0
          });
          
          if (org.departments && org.departments.length > 0) {
            org.departments.forEach((dept, deptIndex) => {
              console.log(`  Department ${deptIndex + 1}:`, {
                id: dept.departmentId,
                name: dept.name
              });
            });
          } else {
            console.log('  No departments found for', org.name);
          }
        });
      }
      
      setOrganizations(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Erreur lors du chargement des organisations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return { organizations, loading, error, refetch: fetchOrganizations };
};

export const PriorityAnalysisModal: React.FC<PriorityAnalysisModalProps> = ({ 
  complaint, 
  onClose, 
  onValidate 
}) => {
  const convertLevelToPriorityString = (level: number): string => {
    switch (level) {
      case 1: return 'high';  
      case 2: return 'medium'; 
      case 3: return 'low';
      default: return 'low';
    }
  };

  const convertLevelToPriorityLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Haute';
      case 2: return 'Moyenne'; 
      case 3: return 'Basse'; 
      default: return 'Basse';
    }
  };

  const [selectedPriority, setSelectedPriority] = useState(() => {
    if (!complaint.priorityLevel || complaint.priorityLevel === 0) {
      return 'low';
    }
    return convertLevelToPriorityString(complaint.priorityLevel);
  });

  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [decisionType, setDecisionType] = useState(() => {
    if (!complaint.priorityLevel || complaint.priorityLevel === 0) {
      return 'modify';
    }
    return 'accept';
  });

  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showAssignment, setShowAssignment] = useState(false);

  const { organizations } = useOrganizations();
  const { agents } = useAgentsByDepartment(selectedDepartmentId);

  const getCurrentPriorityString = (): string => {
    if (!complaint.priorityLevel || complaint.priorityLevel === 0) return 'non définie';
    return convertLevelToPriorityString(complaint.priorityLevel);
  };

  const getCurrentPriorityLabel = (): string => {
    if (!complaint.priorityLevel || complaint.priorityLevel === 0) return 'Non définie';
    return convertLevelToPriorityLabel(complaint.priorityLevel);
  };

  const handleValidate = async () => {
    setLoading(true);
    try {
      const isAccepting = decisionType === 'accept' && complaint.priorityLevel && complaint.priorityLevel > 0;

      await onValidate(
        selectedPriority, 
        isAccepting, 
        analysis,
        showAssignment ? selectedAgent : null,      
        showAssignment ? selectedDepartmentId : null 
      );
      
      onClose();
    } catch (error) {
      console.error('Error in modal handleValidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasSuggestedPriority = complaint.priorityLevel && complaint.priorityLevel > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-3xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-amber-700 to-orange-700 rounded-xl mr-4 shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Analyse de priorité et affectation
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-8 py-6 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Détails de la plainte
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Titre:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{complaint.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description:</span>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{complaint.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-amber-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Priorité suggérée par l'IA
                </h4>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-amber-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {!hasSuggestedPriority ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Aucune priorité suggérée
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${getPriorityColor(complaint.priorityLevel)}`}>
                          {getCurrentPriorityLabel()}
                        </span>
                      )}
                      {hasSuggestedPriority && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                          Niveau {complaint.priorityLevel}/3
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Votre décision
                </h4>

                <div className="space-y-4">
                  {hasSuggestedPriority && (
                    <div 
                      onClick={() => {
                        setDecisionType('accept');
                        setSelectedPriority(getCurrentPriorityString());
                      }}
                      className={`cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                        decisionType === 'accept'
                          ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-green-400'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          <input
                            type="radio"
                            name="decision"
                            checked={decisionType === 'accept'}
                            onChange={() => {
                              setDecisionType('accept');
                              setSelectedPriority(getCurrentPriorityString());
                            }}
                            className="mt-1 h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                Accepter la priorité suggérée
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Confirmer que la priorité <strong>{getCurrentPriorityLabel().toLowerCase()}</strong> proposée par l'IA est appropriée pour cette plainte.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div 
                    onClick={() => setDecisionType('modify')}
                    className={`cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                      decisionType === 'modify'
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-orange-400'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <input
                          type="radio"
                          name="decision"
                          checked={decisionType === 'modify'}
                          onChange={() => setDecisionType('modify')}
                          className="mt-1 h-5 w-5 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {!hasSuggestedPriority ? 'Définir la priorité' : 'Modifier la priorité'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {!hasSuggestedPriority 
                              ? 'Définir la priorité selon votre expertise et analyse du terrain.'
                              : 'Ajuster la priorité selon votre expertise et analyse du terrain.'
                            }
                          </p>
                          
                          {decisionType === 'modify' && (
                            <div className="grid grid-cols-1 gap-3 ml-6 pt-4 border-t border-orange-200 dark:border-orange-700">
                              {PRIORITY_OPTIONS.map((option) => (
                                <label 
                                  key={option.value} 
                                  className={`flex items-start space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                                    selectedPriority === option.value
                                      ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-indigo-900/30'
                                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-amber-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="priority"
                                    value={option.value}
                                    checked={selectedPriority === option.value}
                                    onChange={(e) => setSelectedPriority(e.target.value)}
                                    className="mt-1 h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                                  />
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                      {option.label}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {option.desc}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-gray-600">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={showAssignment}
                    onChange={(e) => setShowAssignment(e.target.checked)}
                    className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Affecter immédiatement à un agent
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                  Assigner directement cette plainte à un agent après validation de la priorité
                </p>
              </div>

              {showAssignment && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                    Affectation de la plainte
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Organisme
                      </label>
                      <select
                        value={selectedOrganization}
                        onChange={(e) => {
                          setSelectedOrganization(e.target.value);
                          setSelectedDepartmentId('');
                          setSelectedAgent('');
                        }}
                        className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 p-3 transition-all duration-200"
                      >
                        <option value="">— Sélectionner un organisme —</option>
                        {organizations.map(org => (
                          <option key={org.organizationId} value={org.organizationId}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedOrganization && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Département
                        </label>
                        {(() => {
                          const selectedOrg = organizations.find(org => org.organizationId === selectedOrganization);
                          
                          if (!selectedOrg) {
                            return (
                              <select disabled className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 p-3">
                                <option>Organisation non trouvée</option>
                              </select>
                            );
                          }

                          if (!selectedOrg.departments || selectedOrg.departments.length === 0) {
                            return (
                              <div className="space-y-2">
                                <select disabled className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 p-3">
                                  <option>Aucun département disponible</option>
                                </select>
                                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                  Organisation "{selectedOrg.name}" n'a pas de départements définis
                                </p>
                              </div>
                            );
                          }

                          return (
                            <select
                              value={selectedDepartmentId}
                              onChange={(e) => {
                                setSelectedDepartmentId(e.target.value);
                                setSelectedAgent('');
                              }}
                              className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 p-3 transition-all duration-200"
                            >
                              <option value="">— Sélectionner un département —</option>
                              {selectedOrg.departments.map(dept => (
                                <option key={dept.departmentId} value={dept.departmentId}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>
                    )}

                    {selectedDepartmentId && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Agent
                        </label>
                        <select
                          value={selectedAgent}
                          onChange={(e) => setSelectedAgent(e.target.value)}
                          className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 p-3 transition-all duration-200"
                        >
                          <option value="">— Sélectionner un agent —</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} • {agent.service}
                            </option>
                          ))}
                        </select>
                        
                        {agents.length === 0 && selectedDepartmentId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            Aucun agent disponible dans ce département
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleValidate}
                disabled={
                  loading || 
                  (decisionType === 'modify' && !selectedPriority) || 
                  (showAssignment && (!selectedAgent || !selectedDepartmentId))
                }
                className="px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Validation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Valider {showAssignment ? '& Affecter' : 'la décision'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};