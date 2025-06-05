import React from 'react';
import { X, Calendar, Plus } from 'lucide-react';

interface InterventionData {
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  resourcesNeeded: string[];
}

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  interventionData: InterventionData;
  setInterventionData: (data: InterventionData) => void;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  interventionData,
  setInterventionData
}) => {
  if (!isOpen) return null;

  const handleResourceChange = (index: number, value: string) => {
    const newResources = [...interventionData.resourcesNeeded];
    newResources[index] = value;
    setInterventionData({...interventionData, resourcesNeeded: newResources});
  };

  const removeResource = (index: number) => {
    const newResources = interventionData.resourcesNeeded.filter((_, i) => i !== index);
    setInterventionData({...interventionData, resourcesNeeded: newResources});
  };

  const addResource = () => {
    setInterventionData({
      ...interventionData, 
      resourcesNeeded: [...interventionData.resourcesNeeded, '']
    });
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden 
                      shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full
                      border border-primary-200/20 dark:border-gray-700">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 
                              flex items-center justify-center shadow-lg mr-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Planifier une intervention
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-3 hover:bg-neutral-100 dark:hover:bg-gray-700 
                         transition-colors text-neutral-500 hover:text-neutral-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="datetime-local"
                    value={interventionData.startDate}
                    onChange={(e) => setInterventionData({...interventionData, startDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                             bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                             focus:border-primary-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="datetime-local"
                    value={interventionData.endDate}
                    onChange={(e) => setInterventionData({...interventionData, endDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                             bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                             focus:border-primary-700 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={interventionData.status}
                  onChange={(e) => setInterventionData({...interventionData, status: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                           bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                           focus:border-primary-700 transition-all"
                >
                  <option value="Planned">Planifiée</option>
                  <option value="In Progress">En cours</option>
                  <option value="Completed">Terminée</option>
                  <option value="Cancelled">Annulée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={interventionData.description}
                  onChange={(e) => setInterventionData({...interventionData, description: e.target.value})}
                  placeholder="Description de l'intervention..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                           bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                           focus:border-primary-700 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-3">
                  Ressources nécessaires
                </label>
                {interventionData.resourcesNeeded.map((resource, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <input
                      type="text"
                      value={resource}
                      onChange={(e) => handleResourceChange(index, e.target.value)}
                      placeholder="Équipement ou ressource nécessaire"
                      className="flex-1 px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                               bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                               focus:border-primary-700 transition-all"
                    />
                    {interventionData.resourcesNeeded.length > 1 && (
                      <button
                        onClick={() => removeResource(index)}
                        className="p-3 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addResource}
                  className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 
                           dark:hover:text-primary-300 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ressource
                </button>
              </div>

              <div className="flex space-x-4 pt-6 bg-gradient-to-r from-neutral-100 to-white dark:from-gray-700 dark:to-gray-600 
                            rounded-xl p-4 -mx-4 -mb-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 text-neutral-700 dark:text-gray-200 
                           bg-white dark:bg-gray-700 rounded-xl font-semibold hover:bg-neutral-50 dark:hover:bg-gray-600 
                           transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={onSubmit}
                  disabled={!interventionData.description || !interventionData.startDate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl 
                           font-semibold hover:from-purple-700 hover:to-purple-600 shadow-lg hover:shadow-xl
                           transform hover:-translate-y-0.5 transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg
                           flex items-center justify-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Planifier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};