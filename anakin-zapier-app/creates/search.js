// Search Action
// Perform AI-powered search using Perplexity (synchronous)

const perform = async (z, bundle) => {
  const { searchQuery, maxResults = 5 } = bundle.inputData;

  // Validate search query
  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('Search query is required');
  }

  z.console.log(`Executing search: ${searchQuery}`);

  // Call the search API (synchronous)
  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/search`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body: {
      prompt: searchQuery.trim(),
      limit: maxResults || 5,
    },
  });

  const searchData = response.data;

  z.console.log('Search completed successfully');

  return {
    success: true,
    operation: 'search',
    query: searchQuery,
    ...searchData,
  };
};

module.exports = {
  key: 'search',
  noun: 'Search',
  display: {
    label: 'AI Search',
    description: 'Perform an AI-powered search query using Perplexity. Get instant answers with citations and sources.',
  },

  operation: {
    inputFields: [
      {
        key: 'searchQuery',
        label: 'Search Query',
        type: 'text',
        required: true,
        helpText: 'The search query or question to ask (e.g., "What are the latest trends in AI?")',
      },
      {
        key: 'maxResults',
        label: 'Max Results',
        type: 'integer',
        default: '5',
        required: false,
        helpText: 'Maximum number of search results to return (default: 5)',
      },
    ],

    perform: perform,

    // Sample output for Zapier UI
    sample: {
      success: true,
      operation: 'search',
      query: 'What are the latest trends in AI?',
      answer: 'Based on recent developments, the latest trends in AI include...',
      results: [
        {
          title: 'AI Trends 2026',
          url: 'https://example.com/ai-trends',
          content: 'Summary of the article...',
          score: 0.95,
        },
      ],
      count: 5,
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'query', label: 'Query', type: 'string' },
      { key: 'answer', label: 'Answer', type: 'text' },
      { key: 'results', label: 'Search Results', type: 'string' },
      { key: 'count', label: 'Result Count', type: 'integer' },
    ],
  },
};
