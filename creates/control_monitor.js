// Control Monitor
// Pauses, resumes, runs, or deletes an existing website monitor (synchronous)

const ACTION_PATHS = {
  pause: { method: 'POST', suffix: '/pause' },
  resume: { method: 'POST', suffix: '/resume' },
  run_now: { method: 'POST', suffix: '/run' },
  delete: { method: 'DELETE', suffix: '' },
};

const perform = async (z, bundle) => {
  const { monitorId, action } = bundle.inputData;

  if (!monitorId || monitorId.trim() === '') {
    throw new Error('Monitor ID is required');
  }
  if (!action || !ACTION_PATHS[action]) {
    throw new Error('Action must be one of: pause, resume, run_now, delete');
  }

  const { method, suffix } = ACTION_PATHS[action];

  z.console.log(`Sending "${action}" to monitor: ${monitorId}`);

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/monitors/${encodeURIComponent(monitorId.trim())}${suffix}`,
    method,
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log(`Monitor "${action}" completed successfully`);

  return {
    success: true,
    operation: 'controlMonitor',
    monitor_id: monitorId.trim(),
    action,
    ...data,
  };
};

module.exports = {
  key: 'control_monitor',
  noun: 'Monitor',
  display: {
    label: 'Control Monitor',
    description: 'Controls an existing website monitor: "pause" stops scheduled checks, "resume" restarts them (may hit the plan\'s active-monitor cap), "run_now" triggers an immediate out-of-schedule check (billed like a normal check), and "delete" permanently removes the monitor and its history.',
  },

  operation: {
    inputFields: [
      {
        key: 'monitorId',
        label: 'Monitor ID',
        type: 'string',
        required: true,
        helpText: 'The monitor ID, from the List Monitors action.',
      },
      {
        key: 'action',
        label: 'Action',
        type: 'string',
        required: true,
        choices: {
          pause: 'Pause',
          resume: 'Resume',
          run_now: 'Run Now',
          delete: 'Delete',
        },
        helpText: 'What to do with the monitor.',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'controlMonitor',
      monitor_id: 'monitor_123456',
      action: 'pause',
      id: 'monitor_123456',
      isActive: false,
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'monitor_id', label: 'Monitor ID', type: 'string' },
      { key: 'action', label: 'Action', type: 'string' },
    ],
  },
};
