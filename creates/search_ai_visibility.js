// Search AI Visibility
// Asks multiple AI answer engines the same question and compares their answers (async with polling)

const { sleep } = require('../utils/helpers');

// Poll for a terminal state. Unlike a typical job, a "failed" status here is
// still returned (not thrown) - the payload carries per-source results and
// errors the caller needs either way. Only "running" means "keep polling".
const pollForCompletion = async (z, bundle, searchId, maxWaitTime = 300000, pollInterval = 3000) => {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < maxWaitTime) {
    attempts++;

    if (attempts > 1) {
      await sleep(pollInterval);
    }

    z.console.log(`Checking status (attempt ${attempts}) for AI visibility search ID: ${searchId}`);

    const response = await z.request({
      url: `${bundle.authData.baseUrl}/v1/ai-visibility/search/${searchId}`,
      method: 'GET',
      headers: {
        'X-API-Key': bundle.authData.apiKey,
      },
    });

    const statusData = response.data;
    const status = statusData.status;

    z.console.log(`Current status: ${status}`);

    if (status !== 'running') {
      z.console.log(`AI visibility search reached terminal status: ${status}`);
      return {
        success: status !== 'failed',
        operation: 'searchAiVisibility',
        search_id: searchId,
        ...statusData,
      };
    }

    z.console.log('AI visibility search still running...');
  }

  throw new Error(
    `AI visibility search ${searchId} timed out after ${maxWaitTime / 1000} seconds; check it later via the Anakin dashboard or retry`
  );
};

const perform = async (z, bundle) => {
  const {
    query,
    sources,
    country = 'us',
    includeFullContent = false,
    maxWaitTime = 300,
    pollInterval = 3,
  } = bundle.inputData;

  if (!query || query.trim() === '') {
    throw new Error('Query is required');
  }

  z.console.log(`Submitting AI visibility search: ${query}`);

  const body = { query: query.trim() };
  if (sources) {
    body.sources = Array.isArray(sources)
      ? sources
      : String(sources).split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  }
  if (country) body.country = country;

  const submitResponse = await z.request({
    url: `${bundle.authData.baseUrl}/v1/ai-visibility/search`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body,
  });

  const submitData = submitResponse.data;
  const searchId = submitData.search_id;

  if (!searchId) {
    throw new Error('No search ID received from API');
  }

  z.console.log(`AI visibility search submitted successfully. Search ID: ${searchId}`);

  const result = await pollForCompletion(
    z,
    bundle,
    searchId,
    maxWaitTime * 1000,
    pollInterval * 1000
  );

  if (!includeFullContent && Array.isArray(result.results)) {
    result.results = result.results.map(({ full_content, ...rest }) => rest);
  }

  return result;
};

module.exports = {
  key: 'search_ai_visibility',
  noun: 'AI Visibility Search',
  display: {
    label: 'Search AI Visibility',
    description: 'Asks multiple AI answer engines (ChatGPT, Gemini, Google AI Overview) the same question and compares their answers. Returns one result per engine plus an AI-generated synthesis of where the engines agree and diverge. Use for brand/AI-SEO visibility checks. A "failed" run still returns the sources that did answer, plus per-source errors.',
  },

  operation: {
    inputFields: [
      {
        key: 'query',
        label: 'Query',
        type: 'text',
        required: true,
        helpText: 'The question to ask every engine (max 2000 characters).',
      },
      {
        key: 'sources',
        label: 'Sources',
        type: 'string',
        list: true,
        required: false,
        helpText: 'Engine slugs to query (see List AI Visibility Sources). Leave blank to query all enabled engines.',
      },
      {
        key: 'country',
        label: 'Country Code',
        type: 'string',
        default: 'us',
        required: false,
        helpText: 'Two-letter ISO country for the search geography (proxy exit). Defaults to "us".',
      },
      {
        key: 'includeFullContent',
        label: 'Include Full Content',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Include each engine\'s raw full answer in the results (large). Defaults to false - summaries and the synthesis are returned regardless.',
      },
      {
        key: 'maxWaitTime',
        label: 'Max Wait Time (seconds)',
        type: 'integer',
        default: '300',
        required: false,
        helpText: 'Maximum time to wait for the search to complete. Default is 300 seconds.',
      },
      {
        key: 'pollInterval',
        label: 'Poll Interval (seconds)',
        type: 'integer',
        default: '3',
        required: false,
        helpText: 'Time between status checks in seconds. Default is 3 seconds.',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'searchAiVisibility',
      search_id: 'aivis_123456',
      status: 'completed',
      country: 'us',
      synthesis: 'Most engines agree that...',
      results: [
        {
          source: 'chatgpt',
          status: 'completed',
          summary: 'ChatGPT answered that...',
        },
      ],
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'search_id', label: 'Search ID', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'country', label: 'Country', type: 'string' },
      { key: 'synthesis', label: 'Synthesis', type: 'text' },
      { key: 'results', label: 'Per-Source Results', type: 'string' },
    ],
  },
};
