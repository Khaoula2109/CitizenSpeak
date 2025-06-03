import { Complaint, Department } from '../types/complaints';

const PRIORITY_KEYWORDS = {
  urgent: 10,
  danger: 10,
  accident: 9,
  sécurité: 8,
  blessure: 8,
  immédiat: 7,
  critique: 7,
  grave: 6,
  important: 5,
  prioritaire: 5,
  maintenance: 3,
  réparation: 3,
  problème: 2,
  gêne: 1
};

const DEPARTMENT_MAPPINGS = {
  voirie: [
    'route', 'trottoir', 'nid de poule', 'chaussée', 'asphalte', 
    'pavé', 'circulation', 'signalisation'
  ],
  eclairage: [
    'lampadaire', 'éclairage', 'lumière', 'ampoule', 'luminaire',
    'obscurité', 'noir'
  ],
  'espaces-verts': [
    'arbre', 'végétation', 'parc', 'jardin', 'pelouse', 'fleur',
    'plante', 'haie', 'tonte'
  ],
  proprete: [
    'déchet', 'poubelle', 'ordure', 'propreté', 'nettoyage',
    'saleté', 'dépôt sauvage'
  ]
};

interface PriorityScore {
  score: number;
  reasons: string[];
}

export function analyzePriority(complaint: Complaint): PriorityScore {
  const text = `${complaint.title} ${complaint.description}`.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  for (const [keyword, weight] of Object.entries(PRIORITY_KEYWORDS)) {
    if (text.includes(keyword.toLowerCase())) {
      score += weight;
      reasons.push(`Mot-clé "${keyword}" détecté (+${weight} points)`);
    }
  }

  if (text.includes('enfant') || text.includes('école')) {
    score += 5;
    reasons.push('Proximité avec zone sensible (enfants/école) (+5 points)');
  }

  if (text.includes('handicap') || text.includes('mobilité réduite')) {
    score += 4;
    reasons.push('Accessibilité PMR impactée (+4 points)');
  }

  if (text.includes('depuis') && (text.includes('semaine') || text.includes('mois'))) {
    score += 3;
    reasons.push('Problème persistant (+3 points)');
  }

  if (text.includes('plusieurs') || text.includes('nombreux') || text.includes('tous')) {
    score += 2;
    reasons.push('Impact collectif (+2 points)');
  }

  return { score, reasons };
}

export function determinePriority(score: number): 'high' | 'medium' | 'low' {
  if (score >= 15) return 'high';
  if (score >= 8) return 'medium';
  return 'low';
}

export function suggestDepartment(complaint: Complaint): string | null {
  const text = `${complaint.title} ${complaint.description}`.toLowerCase();
  let bestMatch: { department: string; matches: number } = { department: '', matches: 0 };

  for (const [department, keywords] of Object.entries(DEPARTMENT_MAPPINGS)) {
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase())).length;
    if (matches > bestMatch.matches) {
      bestMatch = { department, matches };
    }
  }

  return bestMatch.matches > 0 ? bestMatch.department : null;
}

export function calculateUrgencyScore(complaint: Complaint): number {
  const { score } = analyzePriority(complaint);
  
  let urgencyScore = score;

  const hour = new Date(complaint.createdAt).getHours();
  if (hour >= 7 && hour <= 9) urgencyScore += 2; 
  if (hour >= 16 && hour <= 19) urgencyScore += 2;

  if (complaint.similarReports && complaint.similarReports > 1) {
    urgencyScore += Math.min(complaint.similarReports * 2, 10);
  }

  return urgencyScore;
}

export interface AutoAssignmentResult {
  priority: 'high' | 'medium' | 'low';
  suggestedDepartment: string | null;
  priorityScore: number;
  urgencyScore: number;
  analysisDetails: {
    priorityReasons: string[];
    departmentConfidence: number;
  };
}

export function autoAssignComplaint(complaint: Complaint): AutoAssignmentResult {
  const priorityAnalysis = analyzePriority(complaint);
  const priority = determinePriority(priorityAnalysis.score);
  const suggestedDepartment = suggestDepartment(complaint);
  const urgencyScore = calculateUrgencyScore(complaint);

  return {
    priority,
    suggestedDepartment,
    priorityScore: priorityAnalysis.score,
    urgencyScore,
    analysisDetails: {
      priorityReasons: priorityAnalysis.reasons,
      departmentConfidence: suggestedDepartment ? 
        (Object.entries(DEPARTMENT_MAPPINGS[suggestedDepartment as keyof typeof DEPARTMENT_MAPPINGS]).length / 2) : 0
    }
  };
}