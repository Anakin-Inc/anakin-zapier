// List Monitors
// Lists all website monitors, or fetches one monitor's full configuration and status (synchronous)

const perform = async (z, bundle) => {
  const { monitorId } = bundle.inputData;

  const path = monitorId && monitorId.trim() !== ''
    ? `/v1/monitors/${encodeURIComponent(monitorId.trim())}`
    : '/v1/monitors';

  z.console.log(`Fetching monitors${monitorId ? ` (id: ${monitorId})` : ' (full list)'}`);

  const response = await z.request({
    url: `${bundle.authData.baseUrl}${path}`,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log('Monitors fetched successfully');

  return {
    success: true,
    operation: 'listMonitors',
    monitorId: monitorId || null,
    monitors: data,
  };
};

module.exports = {
  key: 'list_monitors',
  noun: 'Monitor',
  display: {
    label: 'List Monitors',
    description: 'Lists your website monitors, or pass a Monitor ID to fetch one monitor\'s full configuration and status (next/last check time, active state, per-check credit cost, alert settings). Use this to find a monitor\'s id before using Control Monitor or checking its changes.',
  },

  operation: {
    inputFields: [
      {
        key: 'monitorId',
        label: 'Monitor ID',
        type: 'string',
        required: false,
        helpText: 'Fetch just this monitor instead of the full list. Leave blank to list all monitors.',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'listMonitors',
      monitorId: null,
      monitors: [
        {
          id: 'monitor_123456',
          url: 'https://example.com/pricing',
          intervalMinutes: 60,
          scope: 'page',
          isActive: true,
          lastCheckAt: '2026-07-27T14:00:00Z',
          nextCheckAt: '2026-07-27T15:00:00Z',
        },
      ],
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'monitorId', label: 'Monitor ID Filter', type: 'string' },
      { key: 'monitors', label: 'Monitors', type: 'string' },
    ],
  },
};
