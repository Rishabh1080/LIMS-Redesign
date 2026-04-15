const STATUS_SCHEMAS = {
  sample: {
    pending: {
      label: 'Pending',
      color: 'blue',
      styleType: 'neutral',
    },
    under_analysis: {
      label: 'Under Analysis',
      color: 'yellow',
      styleType: 'neutral',
    },
    completed: {
      label: 'Completed',
      color: 'green',
      styleType: 'strong',
    },
  },
  testRequest: {
    not_allocated: {
      label: 'Not allocated',
      color: 'gray',
      styleType: 'neutral',
    },
    result_under_testing: {
      label: 'Result Under Testing',
      color: 'blue',
      styleType: 'neutral',
    },
    result_under_approval: {
      label: 'Result Under Approval',
      color: 'yellow',
      styleType: 'neutral',
    },
    rejected: {
      label: 'Rejected',
      color: 'red',
      styleType: 'neutral',
    },
    reviewed: {
      label: 'Reviewed',
      color: 'orange',
      styleType: 'neutral',
    },
    approved: {
      label: 'Approved',
      color: 'green',
      styleType: 'neutral',
    },
  },
  datasheet: {
    under_testing: {
      label: 'Under Testing',
      color: 'blue',
      styleType: 'neutral',
    },
    under_approval: {
      label: 'Under Approval',
      color: 'yellow',
      styleType: 'neutral',
    },
    rejected: {
      label: 'Rejected',
      color: 'red',
      styleType: 'neutral',
    },
    reviewed: {
      label: 'Reviewed',
      color: 'orange',
      styleType: 'neutral',
    },
    approved: {
      label: 'Approved',
      color: 'green',
      styleType: 'neutral',
    },
  },
};

function normalizeStatusKey(status) {
  return String(status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getStatusPresentation(entityType, status) {
  const schema = STATUS_SCHEMAS[entityType] ?? {};
  const statusKey = normalizeStatusKey(status);
  const presentation = schema[statusKey];

  if (presentation) {
    return presentation;
  }

  return {
    label: String(status ?? ''),
    color: 'gray',
    styleType: 'neutral',
  };
}

export function getEntityStatuses(entityType) {
  return Object.values(STATUS_SCHEMAS[entityType] ?? {});
}

export const sampleStatuses = STATUS_SCHEMAS.sample;
export const testRequestStatuses = STATUS_SCHEMAS.testRequest;
export const datasheetStatuses = STATUS_SCHEMAS.datasheet;
