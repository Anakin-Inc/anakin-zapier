// Get Agentic Search Results Action
// Fetches current status and results for an agentic search job (no polling)

// Main perform function
const perform = async (z, bundle) => {
  const { jobId } = bundle.inputData;

  // Validate job ID
  if (!jobId || jobId.trim() === '') {
    throw new Error('Job ID is required');
  }

  z.console.log(`Fetching results for agentic search job ID: ${jobId}`);

  // Fetch current status (single API call, no polling)
  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/agentic-search/${jobId.trim()}`,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const statusData = response.data;
  const status = statusData.status;

  z.console.log(`Current status: ${status}`);

  // Return results regardless of status (processing, completed, failed)
  return {
    success: status === 'completed',
    operation: 'getAgenticSearchResults',
    job_id: jobId.trim(),
    ...statusData,
  };
};

module.exports = {
  key: 'get_agentic_search_results',
  noun: 'Agentic Search Results',
  display: {
    label: 'Get Agentic Search Results',
    description: 'Fetch current status and results for an agentic search job. Returns immediately with current state (processing, completed, or failed).',
  },

  operation: {
    inputFields: [
      {
        key: 'jobId',
        label: 'Job ID',
        type: 'string',
        required: true,
        helpText: 'The job ID from "Start Agentic Search" action (use the job_id output field)',
      },
    ],

    perform: perform,

    // Sample output for Zapier UI
    sample: {
      success: true,
      operation: 'getAgenticSearchResults',
      job_id: 'job_789',
      status: 'completed',
      query: 'Find the pricing plans for top 5 CRM software',
      perplexity_answer: 'Here are the top CRM solutions and their pricing...',
      citations: JSON.stringify([
        {
          url: 'https://salesforce.com/pricing',
          title: 'Salesforce Pricing',
          source_index: 0,
        },
      ]),
      scraped_data: JSON.stringify([
        {
          source_url: 'https://salesforce.com/pricing',
          source_index: 0,
          data: {
            plans: ['Essentials', 'Professional', 'Enterprise'],
            features: ['Contact Management', 'Lead Management'],
          },
        },
      ]),
      chatgpt_structured_data: JSON.stringify({
        crm_platforms: [
          {
            name: 'Salesforce',
            pricing: { starter: 25, professional: 75, enterprise: 150 },
          },
        ],
      }),
      chatgpt_summary: 'Comprehensive analysis of CRM pricing across major platforms...',
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'job_id', label: 'Job ID', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'query', label: 'Query', type: 'string' },
      { key: 'perplexity_answer', label: 'Perplexity Answer', type: 'text' },
      { key: 'citations', label: 'Citations', type: 'string' },
      { key: 'scraped_data', label: 'Scraped Data', type: 'string' },
      { key: 'chatgpt_structured_data', label: 'Structured Data', type: 'string' },
      { key: 'chatgpt_summary', label: 'Summary', type: 'text' },
    ],
  },
};
