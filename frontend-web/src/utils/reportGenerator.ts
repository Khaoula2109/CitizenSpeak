import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportData {
  year: number;
  type: 'general' | 'detailed';
  statistics: {
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    averageResolutionTime: number;
    satisfactionRate: number;
  };
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  departmentPerformance: {
    department: string;
    resolvedCount: number;
    averageTime: number;
    satisfaction: number;
  }[];
  zoneAnalysis: {
    zone: string;
    complaintCount: number;
    mainIssues: string[];
  }[];
  resourceUtilization: {
    resource: string;
    hoursSpent: number;
    cost: number;
  }[];
  budgetAnalysis: {
    category: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
  complaints?: {
    id: string;
    title: string;
    category: string;
    status: string;
    submittedDate: string;
    resolvedDate?: string;
    department: string;
    zone: string;
  }[];
}

const mockReportData: ReportData = {
  year: 2023,
  type: 'detailed',
  statistics: {
    totalComplaints: 1250,
    resolvedComplaints: 1100,
    pendingComplaints: 150,
    averageResolutionTime: 4.5,
    satisfactionRate: 87
  },
  categoryDistribution: [
    { category: 'Voirie', count: 450, percentage: 36 },
    { category: 'Éclairage', count: 300, percentage: 24 },
    { category: 'Propreté', count: 280, percentage: 22.4 },
    { category: 'Espaces verts', count: 220, percentage: 17.6 }
  ],
  departmentPerformance: [
    { department: 'Service Voirie', resolvedCount: 420, averageTime: 4.2, satisfaction: 88 },
    { department: 'Service Éclairage', resolvedCount: 285, averageTime: 3.8, satisfaction: 90 },
    { department: 'Service Propreté', resolvedCount: 260, averageTime: 4.8, satisfaction: 85 }
  ],
  zoneAnalysis: [
    { 
      zone: 'Centre-ville', 
      complaintCount: 400,
      mainIssues: ['Stationnement', 'Propreté', 'Éclairage']
    },
    { 
      zone: 'Nord', 
      complaintCount: 300,
      mainIssues: ['Voirie', 'Espaces verts']
    },
    { 
      zone: 'Sud', 
      complaintCount: 250,
      mainIssues: ['Éclairage', 'Sécurité']
    }
  ],
  resourceUtilization: [
    { resource: 'Personnel technique', hoursSpent: 12500, cost: 375000 },
    { resource: 'Équipement', hoursSpent: 8000, cost: 240000 },
    { resource: 'Matériaux', hoursSpent: 0, cost: 180000 }
  ],
  budgetAnalysis: [
    { category: 'Voirie', allocated: 500000, spent: 450000, remaining: 50000 },
    { category: 'Éclairage', allocated: 300000, spent: 280000, remaining: 20000 },
    { category: 'Propreté', allocated: 250000, spent: 230000, remaining: 20000 }
  ],
  complaints: [
    {
      id: 'CPL-2023-001',
      title: 'Nid de poule dangereux',
      category: 'Voirie',
      status: 'Résolu',
      submittedDate: '2023-01-15',
      resolvedDate: '2023-01-20',
      department: 'Service Voirie',
      zone: 'Centre-ville'
    },
  ]
};

export function generatePDFReport(data: ReportData = mockReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(20);
  doc.text(`Rapport Annuel ${data.year}`, pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`Type: ${data.type === 'detailed' ? 'Détaillé' : 'Général'}`, pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Statistiques Générales', 14, 45);
  
  const stats = [
    ['Total des plaintes', data.statistics.totalComplaints.toString()],
    ['Plaintes résolues', data.statistics.resolvedComplaints.toString()],
    ['Plaintes en attente', data.statistics.pendingComplaints.toString()],
    ['Temps moyen de résolution (jours)', data.statistics.averageResolutionTime.toString()],
    ['Taux de satisfaction (%)', data.statistics.satisfactionRate.toString()]
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Indicateur', 'Valeur']],
    body: stats,
    theme: 'striped'
  });

  doc.text('Distribution par Catégorie', 14, doc.lastAutoTable.finalY + 15);
  
  const categories = data.categoryDistribution.map(cat => [
    cat.category,
    cat.count.toString(),
    `${cat.percentage}%`
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Catégorie', 'Nombre', 'Pourcentage']],
    body: categories,
    theme: 'striped'
  });

  if (data.type === 'detailed') {
    doc.addPage();
    doc.text('Performance des Départements', 14, 20);
    
    const departments = data.departmentPerformance.map(dept => [
      dept.department,
      dept.resolvedCount.toString(),
      dept.averageTime.toString(),
      `${dept.satisfaction}%`
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Département', 'Plaintes résolues', 'Temps moyen (jours)', 'Satisfaction']],
      body: departments,
      theme: 'striped'
    });

    doc.text('Analyse par Zone', 14, doc.lastAutoTable.finalY + 15);
    
    const zones = data.zoneAnalysis.map(zone => [
      zone.zone,
      zone.complaintCount.toString(),
      zone.mainIssues.join(', ')
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Zone', 'Nombre de plaintes', 'Problèmes principaux']],
      body: zones,
      theme: 'striped'
    });

    doc.addPage();
    doc.text('Utilisation des Ressources', 14, 20);
    
    const resources = data.resourceUtilization.map(res => [
      res.resource,
      res.hoursSpent.toString(),
      `${res.cost.toLocaleString()} €`
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Ressource', 'Heures utilisées', 'Coût']],
      body: resources,
      theme: 'striped'
    });

    doc.text('Analyse Budgétaire', 14, doc.lastAutoTable.finalY + 15);
    
    const budget = data.budgetAnalysis.map(item => [
      item.category,
      `${item.allocated.toLocaleString()} €`,
      `${item.spent.toLocaleString()} €`,
      `${item.remaining.toLocaleString()} €`
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Catégorie', 'Budget alloué', 'Dépensé', 'Restant']],
      body: budget,
      theme: 'striped'
    });

    if (data.complaints && data.complaints.length > 0) {
      doc.addPage();
      doc.text('Liste Détaillée des Plaintes', 14, 20);
      
      const complaints = data.complaints.map(complaint => [
        complaint.id,
        complaint.title,
        complaint.category,
        complaint.status,
        complaint.submittedDate,
        complaint.resolvedDate || '-',
        complaint.department,
        complaint.zone
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['ID', 'Titre', 'Catégorie', 'Statut', 'Soumis le', 'Résolu le', 'Département', 'Zone']],
        body: complaints,
        theme: 'striped'
      });
    }
  }

  return doc;
}

export function generateExcelReport(data: ReportData = mockReportData) {
  const wb = XLSX.utils.book_new();

  const statsData = [
    ['Indicateur', 'Valeur'],
    ['Total des plaintes', data.statistics.totalComplaints],
    ['Plaintes résolues', data.statistics.resolvedComplaints],
    ['Plaintes en attente', data.statistics.pendingComplaints],
    ['Temps moyen de résolution (jours)', data.statistics.averageResolutionTime],
    ['Taux de satisfaction (%)', data.statistics.satisfactionRate]
  ];
  const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistiques');

  const categoryData = [
    ['Catégorie', 'Nombre', 'Pourcentage'],
    ...data.categoryDistribution.map(cat => [cat.category, cat.count, cat.percentage])
  ];
  const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
  XLSX.utils.book_append_sheet(wb, categorySheet, 'Catégories');

  if (data.type === 'detailed') {
    const deptData = [
      ['Département', 'Plaintes résolues', 'Temps moyen (jours)', 'Satisfaction (%)'],
      ...data.departmentPerformance.map(dept => [
        dept.department,
        dept.resolvedCount,
        dept.averageTime,
        dept.satisfaction
      ])
    ];
    const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
    XLSX.utils.book_append_sheet(wb, deptSheet, 'Départements');

    const zoneData = [
      ['Zone', 'Nombre de plaintes', 'Problèmes principaux'],
      ...data.zoneAnalysis.map(zone => [
        zone.zone,
        zone.complaintCount,
        zone.mainIssues.join(', ')
      ])
    ];
    const zoneSheet = XLSX.utils.aoa_to_sheet(zoneData);
    XLSX.utils.book_append_sheet(wb, zoneSheet, 'Zones');

    const resourceData = [
      ['Ressource', 'Heures utilisées', 'Coût (€)'],
      ...data.resourceUtilization.map(res => [
        res.resource,
        res.hoursSpent,
        res.cost
      ])
    ];
    const resourceSheet = XLSX.utils.aoa_to_sheet(resourceData);
    XLSX.utils.book_append_sheet(wb, resourceSheet, 'Ressources');

    const budgetData = [
      ['Catégorie', 'Budget alloué (€)', 'Dépensé (€)', 'Restant (€)'],
      ...data.budgetAnalysis.map(item => [
        item.category,
        item.allocated,
        item.spent,
        item.remaining
      ])
    ];
    const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData);
    XLSX.utils.book_append_sheet(wb, budgetSheet, 'Budget');

    if (data.complaints && data.complaints.length > 0) {
      const complaintsData = [
        ['ID', 'Titre', 'Catégorie', 'Statut', 'Soumis le', 'Résolu le', 'Département', 'Zone'],
        ...data.complaints.map(complaint => [
          complaint.id,
          complaint.title,
          complaint.category,
          complaint.status,
          complaint.submittedDate,
          complaint.resolvedDate || '-',
          complaint.department,
          complaint.zone
        ])
      ];
      const complaintsSheet = XLSX.utils.aoa_to_sheet(complaintsData);
      XLSX.utils.book_append_sheet(wb, complaintsSheet, 'Plaintes');
    }
  }

  return wb;
}