export const reportItems = [
  {
    id: 'proficiency-testing',
    name: 'Proficiency Testing',
    type: 'Testing',
    updatedOn: '23/06/2026',
  },
  {
    id: 'condition-monitoring-trials',
    name: 'Condition Monitoring/Trials',
    type: 'Monitoring',
    updatedOn: '22/06/2026',
  },
  {
    id: 'retesting-checks',
    name: 'Retesting Checks',
    type: 'Checks',
    updatedOn: '21/06/2026',
  },
  {
    id: 'sqc-daily-weekly-reference',
    name: 'SQC Daily & Weekly Reference',
    type: 'Reference',
    updatedOn: '20/06/2026',
  },
  {
    id: 'ilc-report-rh-vi',
    name: 'ILC Report RH VI',
    type: 'Testing',
    updatedOn: '19/06/2026',
  },
  {
    id: 'blind-sample-testing',
    name: 'Blind Sample Testing',
    type: 'Testing',
    updatedOn: '18/06/2026',
  },
  {
    id: 'intra-lab-testing-report',
    name: 'Intra Lab Testing Report',
    type: 'Testing',
    updatedOn: '17/06/2026',
  },
];

export function getReportById(reportId) {
  return reportItems.find((report) => report.id === reportId) ?? reportItems[0];
}
