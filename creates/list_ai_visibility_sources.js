// List AI Visibility Sources
// Lists the AI answer engines available to the AI Visibility Search action (synchronous)

const perform = async (z, bundle) => {
  z.console.log('Fetching AI visibility sources');

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/ai-visibility/sources`,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log('AI visibility sources fetched successfully');

  return {
    success: true,
    operation: 'listAiVisibilitySources',
    sources: data,
  };
};

module.exports = {
  key: 'list_ai_visibility_sources',
  noun: 'AI Visibility Source',
  display: {
    label: 'List AI Visibility Sources',
    description: 'Lists the AI answer engines available to AI Visibility Search (e.g. ChatGPT, Gemini, Google AI Overview) - each with its slug (what you pass as Sources) and display label. Call this when you need to query a subset of engines or check what is currently enabled.',
  },

  operation: {
    inputFields: [],

    perform: perform,

    sample: {
      success: true,
      operation: 'listAiVisibilitySources',
      sources: [
        { slug: 'chatgpt', label: 'ChatGPT' },
        { slug: 'gemini', label: 'Gemini' },
        { slug: 'google_ai_overview', label: 'Google AI Overview' },
      ],
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'sources', label: 'Sources', type: 'string' },
    ],
  },
};
