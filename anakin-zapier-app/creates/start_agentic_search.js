// Start Agentic Search Action
// Submits an agentic search job and returns the job ID

const perform = async (z, bundle) => {
  const { searchPrompt, useBrowser = true } = bundle.inputData;

  // Validate prompt
  if (!searchPrompt || searchPrompt.trim() === '') {
    throw new Error('Search prompt is required');
  }

  z.console.log(`Submitting agentic search job: ${searchPrompt}`);

  // Submit the agentic search job
  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/agentic-search`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body: {
      prompt: searchPrompt.trim(),
      useBrowser: useBrowser,
    },
  });

  const submitData = response.data;
  const jobId = submitData.job_id || submitData.jobId;

  if (!jobId) {
    throw new Error('No job ID received from API');
  }

  z.console.log(`Agentic search job submitted successfully. Job ID: ${jobId}`);

  return {
    success: true,
    operation: 'startAgenticSearch',
    job_id: jobId,
    prompt: searchPrompt,
    status: 'submitted',
    message: 'Agentic search job started. Use "Get Agentic Search Results" action to fetch results.',
  };
};

module.exports = {
  key: 'start_agentic_search',
  noun: 'Agentic Search Job',
  display: {
    label: 'Start Agentic Search',
    description: 'Starts an advanced AI search job that searches web sources and extracts structured data. Returns a job ID to check results later.',
  },

  operation: {
    inputFields: [
      {
        key: 'searchPrompt',
        label: 'Search Prompt',
        type: 'text',
        required: true,
        helpText: 'The search prompt for agentic analysis. For example: Find the pricing plans for top 5 CRM software',
      },
      {
        key: 'useBrowser',
        label: 'Use Browser',
        type: 'boolean',
        default: 'true',
        required: false,
        helpText: 'Uses browser-based extraction for citations. More reliable but slower than standard extraction.',
      },
    ],

    perform: perform,

    // Sample output for Zapier UI
    sample: {
      success: true,
      operation: 'startAgenticSearch',
      job_id: 'job_abc123xyz',
      prompt: 'Find the pricing plans for top 5 CRM software',
      status: 'submitted',
      message: 'Agentic search job started. Use "Get Agentic Search Results" action to fetch results.',
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'job_id', label: 'Job ID', type: 'string' },
      { key: 'prompt', label: 'Search Prompt', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'message', label: 'Message', type: 'string' },
    ],
  },
};
