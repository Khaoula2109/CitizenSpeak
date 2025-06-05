import React from 'react';
import { BarChart as ChartBar, Brain, Target } from 'lucide-react';
import { AutoAssignmentResult } from '../../utils/complaintPrioritization';
import { ComplaintPriorityBadge } from './ComplaintPriorityBadge';

interface ComplaintAnalysisProps {
  analysis: AutoAssignmentResult;
}

export const ComplaintAnalysis: React.FC<ComplaintAnalysisProps> = ({ analysis }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2 text-blue-500" />
        Analyse automatique
      </h3>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Priorité
              </span>
              <ComplaintPriorityBadge 
                priority={analysis.priority as "medium" | "high" | "low"} 
                score={analysis.priorityScore}
                showScore={true}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Score d'urgence
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {analysis.urgencyScore}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${Math.min(100, (analysis.urgencyScore / 30) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Service suggéré
              </span>
              {analysis.suggestedDepartment && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                  {analysis.suggestedDepartment}
                </span>
              )}
            </div>
            {analysis.suggestedDepartment && (
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-purple-600 dark:bg-purple-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${analysis.analysisDetails.departmentConfidence * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <ChartBar className="h-4 w-4 mr-2 text-gray-400" />
            Facteurs de priorité détectés
          </h4>
          <div className="space-y-2">
            {analysis.analysisDetails.priorityReasons.map((reason, index) => (
              <div 
                key={index}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400"
              >
                <Target className="h-4 w-4 mr-2 text-gray-400" />
                {reason}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};