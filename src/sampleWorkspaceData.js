const baseSamples = [
  {
    id: 'IICT/2025-2026/1102',
    status: 'Pending',
    statusTone: 'pending',
    representative: 'Anita Desai',
    reference: 'QC-Test-1',
    requestMode: 'Online',
    createdOn: '23/02/2026, 02:34',
    reportingDate: '28/02/2026, 02:00',
    parameters: ['slate', 'sky', 'amber', 'sky', 'coral', 'mint', 'sage', 'green'],
  },
  {
    id: 'IICT/2025-2026/1103',
    status: 'Under Analysis',
    statusTone: 'warning',
    representative: 'Anita Desai',
    reference: 'QC-Test-2',
    requestMode: 'Online',
    createdOn: '23/02/2026, 03:15',
    reportingDate: '28/02/2026, 04:30',
    parameters: [
      'slate',
      'sky',
      'amber',
      'sky',
      'sky',
      'coral',
      'mint',
      'sage',
      'green',
      'green',
      'slate',
      'green',
      'slate',
      'green',
      'coral',
      'green',
      'green',
      'amber',
      'sky',
      'sky',
      'green',
      'green',
      'slate',
      'green',
      'sky',
      'amber',
      'coral',
    ],
  },
  {
    id: 'IICT/2025-2026/1104',
    status: 'Pending',
    statusTone: 'pending',
    representative: 'Rahul Menon',
    reference: 'QC-Test-3',
    requestMode: 'Pickup',
    createdOn: '24/02/2026, 09:10',
    reportingDate: '01/03/2026, 11:45',
    parameters: ['mint', 'sky', 'green', 'amber', 'slate', 'coral', 'sage', 'green', 'sky'],
  },
  {
    id: 'IICT/2025-2026/1105',
    status: 'Under Analysis',
    statusTone: 'warning',
    representative: 'Meera Shah',
    reference: 'QC-Test-4',
    requestMode: 'Online',
    createdOn: '24/02/2026, 12:20',
    reportingDate: '02/03/2026, 08:00',
    parameters: ['slate', 'green', 'green', 'sky', 'amber', 'coral', 'mint', 'green'],
  },
];

export const sampleCards = Array.from({ length: 12 }, (_, index) => {
  const template = baseSamples[index % baseSamples.length];
  const sampleNumber = 1102 + index;

  return {
    ...template,
    id: `IICT/2025-2026/${sampleNumber}`,
  };
});

export const sidebarSections = [
  {
    title: 'HOME',
    items: [{ label: 'Dashboard', active: false, icon: 'home' }],
  },
  {
    title: 'LIMS',
    items: [
      { label: 'Samples Workspace', active: true, icon: 'workspace' },
      { label: 'All Samples', active: false, icon: 'all-samples' },
    ],
  },
];
