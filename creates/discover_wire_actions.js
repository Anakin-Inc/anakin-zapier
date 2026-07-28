// Discover Wire Actions
// Natural-language intent -> ranked candidate Wire actions (synchronous)

const perform = async (z, bundle) => {
  const { query, limit } = bundle.inputData;

  if (!query || query.trim() === '') {
    throw new Error('Query is required');
  }

  z.console.log(`Discovering Wire actions for query: ${query}`);

  const params = { q: query.trim() };
  if (limit) params.limit = limit;

  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/wire/resolve?${queryString}`,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log('Wire discovery completed successfully');

  return {
    success: true,
    operation: 'discoverWireActions',
    query: query.trim(),
    results: data.results || [],
    next: data.next,
  };
};

module.exports = {
  key: 'discover_wire_actions',
  noun: 'Wire Action',
  display: {
    label: 'Discover Wire Actions',
    description: 'Finds Wire actions for a task from a natural-language intent. Wire is a catalog of pre-built automation actions across hundreds of websites (Amazon, Walmart, LinkedIn, Airbnb, Zillow, and others). Returns ranked candidate actions with their action_id, type (read/write), required/optional params, credit cost, and whether auth is needed.',
  },

  operation: {
    inputFields: [
      {
        key: 'query',
        label: 'Query',
        type: 'string',
        required: true,
        helpText: 'The intent in natural language. For example: "top phones on walmart", "search airbnb listings in Lisbon", "a linkedin profile\'s work history".',
      },
      {
        key: 'limit',
        label: 'Limit',
        type: 'integer',
        default: '5',
        required: false,
        helpText: 'Maximum number of candidate actions to return. Default is 5.',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'discoverWireActions',
      query: 'top phones on walmart',
      results: [
        {
          action_id: 'walmart.search_products',
          type: 'read',
          auth_mode: 'none',
          credit_cost: 1,
          params_schema: { query: 'string' },
        },
      ],
      next: 'wire_read_action',
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'query', label: 'Query', type: 'string' },
      { key: 'results', label: 'Candidate Actions', type: 'string' },
      { key: 'next', label: 'Suggested Next Step', type: 'string' },
    ],
  },
};
