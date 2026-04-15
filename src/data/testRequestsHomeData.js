const targetDate = '23/02/2026';

const allocatedToMe = Array.from({ length: 12 }, (_, index) => ({
  id: `URLS/O/26-22-${index + 2}`,
  bucket: 'allocated-to-me',
  status: 'Result Under Testing',
  product: index % 3 === 0 ? 'Ambient Air Quality' : index % 3 === 1 ? 'Boiler Water' : 'Raw Water',
  age: index < 4 ? '2 days' : index < 8 ? '1 day' : '12 hrs',
  reportingDate: targetDate,
  action: 'view',
}));

const pendingForAllocation = [
  {
    id: 'URLS/O/26-31-1',
    bucket: 'pending-for-allocation',
    status: 'Not allocated',
    product: 'Cooling Water',
    age: '30 min ago',
    reportingDate: '24/02/2026',
    action: 'allocate',
  },
  {
    id: 'URLS/O/26-31-2',
    bucket: 'pending-for-allocation',
    status: 'Not allocated',
    product: 'DM Water',
    age: '45 min ago',
    reportingDate: '24/02/2026',
    action: 'allocate',
  },
  {
    id: 'URLS/O/26-31-3',
    bucket: 'pending-for-allocation',
    status: 'Not allocated',
    product: 'Effluent Stream',
    age: '1 hr ago',
    reportingDate: '24/02/2026',
    action: 'allocate',
  },
  {
    id: 'URLS/O/26-31-4',
    bucket: 'pending-for-allocation',
    status: 'Not allocated',
    product: 'Ambient Air Quality',
    age: '2 hrs ago',
    reportingDate: '24/02/2026',
    action: 'allocate',
  },
];

const pendingForApproval = [
  {
    id: 'URLS/O/26-29-7',
    bucket: 'pending-for-approval',
    status: 'Result Under Approval',
    product: 'Boiler Water',
    age: '4 hrs',
    reportingDate: '23/02/2026',
    action: 'view',
  },
  {
    id: 'URLS/O/26-29-8',
    bucket: 'pending-for-approval',
    status: 'Result Under Approval',
    product: 'Cooling Tower Water',
    age: '6 hrs',
    reportingDate: '23/02/2026',
    action: 'view',
  },
  {
    id: 'URLS/O/26-29-9',
    bucket: 'pending-for-approval',
    status: 'Result Under Approval',
    product: 'Ambient Air Quality',
    age: '8 hrs',
    reportingDate: '23/02/2026',
    action: 'view',
  },
];

export const allTestRequestBuckets = [
  ...allocatedToMe,
  ...pendingForAllocation,
  ...pendingForApproval,
];

export const testRequestsHomeTabs = [
  { key: 'allocated-to-me', label: 'Allocated to me' },
  { key: 'pending-for-allocation', label: 'Pending for allocation' },
  { key: 'pending-for-approval', label: 'Pending for approval' },
  { key: 'all-test-requests', label: 'All Test Requests' },
];

export function getTestRequestsForTab(tabKey, rows) {
  if (tabKey === 'all-test-requests') {
    return rows;
  }

  return rows.filter((row) => row.bucket === tabKey);
}
