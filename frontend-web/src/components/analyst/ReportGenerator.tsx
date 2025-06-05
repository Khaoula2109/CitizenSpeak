import React, { useState } from 'react';
import { 
  X, Download, FileText, Calendar, Filter,
  BarChart3, PieChart, Map, Clock, CheckCircle
} from 'lucide-react';

interface ReportGeneratorProps {
  onClose: () => void;
  stats: any;
  categoryData: any[];
  monthlyTrends: any[];
  geographicalData: any[];
  resolutionData: any[];
  priorityAnalysis: any;
  recommendations: any[];
  selectedYear: number;
}

interface ReportConfig {
  title: string;
  period: {
    startDate: string;
    endDate: string;
  };
  sections: {
    overview: boolean;
    categories: boolean;
    trends: boolean;
    geographical: boolean;
    resolution: boolean;
    recommendations: boolean;
  };
  format: 'pdf' | 'excel';
  includeCharts: boolean;
}

export function ReportGenerator({ 
  onClose, 
  stats, 
  categoryData, 
  monthlyTrends, 
  geographicalData, 
  resolutionData, 
  priorityAnalysis, 
  recommendations,
  selectedYear 
}: ReportGeneratorProps) {
  const [config, setConfig] = useState<ReportConfig>({
    title: `Rapport d'analyse des plaintes - ${selectedYear}`,
    period: {
      startDate: `${selectedYear}-01-01`,
      endDate: `${selectedYear}-12-31`
    },
    sections: {
      overview: true,
      categories: true,
      trends: true,
      geographical: true,
      resolution: true,
      recommendations: true
    },
    format: 'pdf',
    includeCharts: true
  });

  const [generating, setGenerating] = useState(false);

  const handleSectionToggle = (section: keyof typeof config.sections) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section]
      }
    }));
  };

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      const reportPayload = {
        year: selectedYear,
        includeStats: config.sections.overview,
        includeCategories: config.sections.categories,
        includeTrends: config.sections.trends,
        includeGeographical: config.sections.geographical,
        includeResolution: config.sections.resolution,
        includePriority: true,
        includeRecommendations: config.sections.recommendations,
        title: config.title,
        format: config.format === 'pdf' ? 'pdf' : 'pdf' 
      };

      const response = await fetch('/api/analyst/report/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      
      const contentType = response.headers.get('content-type');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      if (contentType && contentType.includes('pdf')) {
        a.download = `Rapport_Analyse_Plaintes_${selectedYear}.pdf`;
      } else {
        a.download = `Rapport_Analyse_Plaintes_${selectedYear}.pdf`; 
      }
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport PDF. Veuillez réessayer.');
    } finally {
      setGenerating(false);
    }
  };

  const sectionIcons = {
    overview: BarChart3,
    categories: PieChart,
    trends: Calendar,
    geographical: Map,
    resolution: Clock,
    recommendations: CheckCircle
  };

  const sectionLabels = {
    overview: 'Vue d\'ensemble',
    categories: 'Analyse par catégorie',
    trends: 'Tendances temporelles',
    geographical: 'Répartition géographique',
    resolution: 'Temps de résolution',
    recommendations: 'Recommandations'
  };

  const enabledSectionsCount = Object.values(config.sections).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 border border-primary-200/20 dark:border-gray-700">
          <div className="px-8 py-6 bg-gradient-to-r from-primary-700/5 to-primary-600/5 dark:from-gray-700 dark:to-gray-600 rounded-t-2xl border-b border-primary-200/20 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl mr-4 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">
                    Générateur de Rapport
                  </h3>
                  <p className="text-neutral-500 dark:text-gray-400">
                    Configurez et générez votre rapport d'analyse pour {selectedYear}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-gray-200 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
                    Configuration Générale
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                      Titre du rapport
                    </label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-600 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                      Année d'analyse
                    </label>
                    <div className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-gray-600 rounded-xl bg-neutral-50 dark:bg-gray-600 text-neutral-600 dark:text-gray-300">
                      {selectedYear}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={config.period.startDate}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          period: { ...prev.period, startDate: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-600 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={config.period.endDate}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          period: { ...prev.period, endDate: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-600 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                      Format de sortie
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="pdf"
                          checked={config.format === 'pdf'}
                          onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'pdf' | 'excel' }))}
                          className="mr-2"
                        />
                        <span className="text-neutral-700 dark:text-gray-300">PDF</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="excel"
                          checked={config.format === 'excel'}
                          onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'pdf' | 'excel' }))}
                          className="mr-2"
                        />
                        <span className="text-neutral-700 dark:text-gray-300">Excel</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeCharts}
                        onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-neutral-700 dark:text-gray-300">
                        Inclure les graphiques
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">
                    Sections à inclure ({enabledSectionsCount}/6)
                  </h4>
                  
                  <div className="space-y-3">
                    {Object.entries(config.sections).map(([key, enabled]) => {
                      const IconComponent = sectionIcons[key as keyof typeof sectionIcons];
                      const label = sectionLabels[key as keyof typeof sectionLabels];
                      
                      return (
                        <div
                          key={key}
                          onClick={() => handleSectionToggle(key as keyof typeof config.sections)}
                          className={`
                            flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                            ${enabled 
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700' 
                              : 'bg-neutral-50 dark:bg-gray-700 border-neutral-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                            }
                          `}
                        >
                          <div className={`
                            p-2 rounded-lg mr-3
                            ${enabled 
                              ? 'bg-primary-100 dark:bg-primary-800/50' 
                              : 'bg-neutral-100 dark:bg-gray-600'
                            }
                          `}>
                            <IconComponent className={`
                              h-5 w-5
                              ${enabled 
                                ? 'text-primary-600 dark:text-primary-400' 
                                : 'text-neutral-500 dark:text-gray-400'
                              }
                            `} />
                          </div>
                          <div className="flex-1">
                            <span className={`
                              font-medium
                              ${enabled 
                                ? 'text-primary-800 dark:text-primary-300' 
                                : 'text-neutral-700 dark:text-gray-300'
                              }
                            `}>
                              {label}
                            </span>
                          </div>
                          <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${enabled 
                              ? 'border-primary-600 bg-primary-600' 
                              : 'border-neutral-300 dark:border-gray-600'
                            }
                          `}>
                            {enabled && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-neutral-50 to-primary-50 dark:from-gray-700 dark:to-primary-900/20 rounded-xl border border-primary-200/30 dark:border-primary-700/30">
                  <h5 className="font-semibold text-neutral-800 dark:text-white mb-2">
                    Aperçu du contenu
                  </h5>
                  <div className="text-sm text-neutral-600 dark:text-gray-400 space-y-1">
                    <div>• Année: {selectedYear}</div>
                    <div>• Format: {config.format.toUpperCase()}</div>
                    <div>• Sections: {enabledSectionsCount} sections sélectionnées</div>
                    <div>• Graphiques: {config.includeCharts ? 'Inclus' : 'Exclus'}</div>
                    <div>• Période: {new Date(config.period.startDate).toLocaleDateString('fr-FR')} - {new Date(config.period.endDate).toLocaleDateString('fr-FR')}</div>
                    {stats && (
                      <div>• Données: {stats.totalComplaints || 0} plaintes analysées</div>
                    )}
                  </div>
                </div>

                {stats && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                      Données de {selectedYear}
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-amber-700 dark:text-amber-300">
                        Total: <span className="font-bold">{stats.totalComplaints || 0}</span>
                      </div>
                      <div className="text-amber-700 dark:text-amber-300">
                        Résolues: <span className="font-bold">{stats.resolvedComplaints || 0}</span>
                      </div>
                      <div className="text-amber-700 dark:text-amber-300">
                        Nouvelles: <span className="font-bold">{stats.newComplaints || 0}</span>
                      </div>
                      <div className="text-amber-700 dark:text-amber-300">
                        Taux: <span className="font-bold">{stats.resolutionRate || 0}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gradient-to-r from-neutral-100 to-white dark:from-gray-700 dark:to-gray-600 rounded-b-2xl border-t border-primary-200/20 dark:border-gray-700 flex justify-end space-x-4">
            <button 
              onClick={onClose}
              disabled={generating}
              className="px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl text-neutral-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-gray-600 hover:text-neutral-800 dark:hover:text-gray-200 font-semibold transition-all duration-200 disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              onClick={generateReport}
              disabled={generating || enabledSectionsCount === 0}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" /> 
                  Générer le rapport {selectedYear}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}