// Scrape URL Action
// Scrapes a website and extracts structured data (async with polling)

const { sleep } = require('../utils/helpers');

// Poll for job completion
const pollForCompletion = async (z, bundle, requestId, maxWaitTime = 300000, pollInterval = 3000) => {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < maxWaitTime) {
    attempts++;
    
    // Wait before checking (except first attempt)
    if (attempts > 1) {
      await sleep(pollInterval);
    }

    z.console.log(`Checking status (attempt ${attempts}) for request ID: ${requestId}`);

    // Check the status
    const response = await z.request({
      url: `${bundle.authData.baseUrl}/v1/request/${requestId}`,
      method: 'GET',
      headers: {
        'X-API-Key': bundle.authData.apiKey,
      },
    });

    const statusData = response.data;
    const status = statusData.status;

    z.console.log(`Current status: ${status}`);

    // Check if job is completed
    if (status === 'completed' || status === 'success') {
      z.console.log(`Job completed successfully for request ID: ${requestId}`);
      return {
        success: true,
        operation: 'scrapeUrl',
        request_id: requestId,
        ...statusData,
      };
    }

    // Check if job failed
    if (status === 'failed' || status === 'error') {
      const errorMessage = statusData.error || statusData.error_message || 'Unknown error occurred';
      throw new Error(`Scraping job failed: ${errorMessage}`);
    }

    // Job is still processing
    z.console.log(`Job still processing... (${status})`);
  }

  throw new Error(`Job did not complete within ${maxWaitTime / 1000} seconds`);
};

// Main perform function
const perform = async (z, bundle) => {
  const { url, country = 'us', forceFresh = false, maxWaitTime = 300, pollInterval = 3 } = bundle.inputData;

  // Validate URL
  if (!url || url.trim() === '') {
    throw new Error('URL is required');
  }

  z.console.log(`Submitting scraping job for URL: ${url}`);

  // Step 1: Submit the scraping job
  const submitResponse = await z.request({
    url: `${bundle.authData.baseUrl}/v1/request`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body: {
      job_type: 'url_scraper',
      url: url.trim(),
      country,
      force_fresh: forceFresh,
    },
  });

  const submitData = submitResponse.data;
  const requestId = submitData.jobId || submitData.job_id;

  if (!requestId) {
    throw new Error('No request ID received from API');
  }

  z.console.log(`Job submitted successfully. Request ID: ${requestId}`);

  // Step 2: Poll for completion
  const result = await pollForCompletion(
    z,
    bundle,
    requestId,
    maxWaitTime * 1000,
    pollInterval * 1000
  );

  return result;
};

module.exports = {
  key: 'scrape_url',
  noun: 'Scrape',
  display: {
    label: 'Scrape Website',
    description: 'Scrapes a website and extracts structured data including HTML, markdown, and generated JSON.',
  },

  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: true,
        helpText: 'The full URL of the website you want to scrape',
      },
      {
        key: 'country',
        label: 'Country Code',
        type: 'string',
        default: 'us',
        required: false,
        helpText: 'Country code for proxy routing. For example: us, uk, de',
      },
      {
        key: 'forceFresh',
        label: 'Force Fresh',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Bypasses cache and forces a fresh scrape when enabled.',
      },
      {
        key: 'maxWaitTime',
        label: 'Max Wait Time (seconds)',
        type: 'integer',
        default: '300',
        required: false,
        helpText: 'Maximum time to wait for the scraping job to complete. Default is 300 seconds.',
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

    // Sample output for Zapier UI
    sample: {
      success: true,
      operation: 'scrapeUrl',
      request_id: 'req_123456',
      url: 'https://example.com',
      status: 'completed',
      html: '<html>...</html>',
      markdown: '# Example Page\n\nThis is example content...',
      generatedJson: {
        title: 'Example Page',
        description: 'An example website',
      },
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'request_id', label: 'Request ID', type: 'string' },
      { key: 'url', label: 'URL', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'html', label: 'HTML Content', type: 'text' },
      { key: 'markdown', label: 'Markdown Content', type: 'text' },
      { key: 'generatedJson', label: 'Generated JSON Data', type: 'string' },
    ],
  },
};
