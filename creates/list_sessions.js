// List Sessions
// Lists saved browser sessions - encrypted login states usable by scrape/crawl/monitor/browser task actions (synchronous)

const perform = async (z, bundle) => {
  const { domain } = bundle.inputData;

  z.console.log(`Listing browser sessions${domain ? ` for domain: ${domain}` : ''}`);

  let url = `${bundle.authData.baseUrl}/v1/sessions`;
  if (domain) {
    url += `?domain=${encodeURIComponent(domain)}`;
  }

  const response = await z.request({
    url,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log('Browser sessions fetched successfully');

  return {
    success: true,
    operation: 'listSessions',
    domain: domain || null,
    sessions: data,
  };
};

module.exports = {
  key: 'list_sessions',
  noun: 'Browser Session',
  display: {
    label: 'List Sessions',
    description: 'Lists your saved browser sessions - encrypted login states captured via the Anakin dashboard or Browser API. Each session\'s id is what you pass as Session ID to Extract Website Data, Crawl Site, Create Monitor, or Run Browser Task to work with login-protected pages. Optionally filter by website domain.',
  },

  operation: {
    inputFields: [
      {
        key: 'domain',
        label: 'Domain',
        type: 'string',
        required: false,
        helpText: 'Filter to sessions for one website domain, e.g. "amazon.com".',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'listSessions',
      domain: null,
      sessions: [
        {
          id: 'session_123456',
          domain: 'amazon.com',
          name: 'Personal Amazon',
          createdAt: '2026-06-01T12:00:00Z',
        },
      ],
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'domain', label: 'Domain Filter', type: 'string' },
      { key: 'sessions', label: 'Sessions', type: 'string' },
    ],
  },
};
