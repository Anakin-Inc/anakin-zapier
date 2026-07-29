// Map Site Action
// Discovers all reachable URLs under a site (async with polling)

const { sleep } = require('../utils/helpers');

// Poll for job completion
const pollForCompletion = async (z, bundle, jobId, maxWaitTime = 300000, pollInterval = 3000) => {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < maxWaitTime) {
    attempts++;

    if (attempts > 1) {
      await sleep(pollInterval);
    }

    z.console.log(`Checking status (attempt ${attempts}) for map job ID: ${jobId}`);

    const response = await z.request({
      url: `${bundle.authData.baseUrl}/v1/map/${jobId}`,
      method: 'GET',
      headers: {
        'X-API-Key': bundle.authData.apiKey,
      },
    });

    const statusData = response.data;
    const status = statusData.status;

    z.console.log(`Current status: ${status}`);

    if (status === 'completed') {
      z.console.log(`Map job completed successfully for job ID: ${jobId}`);
      return {
        success: true,
        operation: 'mapSite',
        job_id: jobId,
        ...statusData,
      };
    }

    if (status === 'failed') {
      const errorMessage = statusData.error || 'Unknown error occurred';
      throw new Error(`Map job failed: ${errorMessage}`);
    }

    z.console.log(`Map job still processing... (${status})`);
  }

  throw new Error(`Job did not complete within ${maxWaitTime / 1000} seconds`);
};

// Main perform function
const perform = async (z, bundle) => {
  const {
    url,
    limit = 100,
    depth = 2,
    limitPerLevel = 100,
    includeSubdomains = false,
    includeExternalLinks = false,
    useBrowser = false,
    search,
    maxWaitTime = 300,
    pollInterval = 3,
  } = bundle.inputData;

  if (!url || url.trim() === '') {
    throw new Error('URL is required');
  }

  z.console.log(`Submitting map job for URL: ${url}`);

  const body = {
    url: url.trim(),
    limit,
    depth,
    limitPerLevel,
    includeSubdomains,
    includeExternalLinks,
    useBrowser,
  };
  if (search) {
    body.search = search;
  }

  const submitResponse = await z.request({
    url: `${bundle.authData.baseUrl}/v1/map`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body,
  });

  const submitData = submitResponse.data;
  const jobId = submitData.jobId || submitData.job_id;

  if (!jobId) {
    throw new Error('No job ID received from API');
  }

  z.console.log(`Map job submitted successfully. Job ID: ${jobId}`);

  const result = await pollForCompletion(
    z,
    bundle,
    jobId,
    maxWaitTime * 1000,
    pollInterval * 1000
  );

  return result;
};

module.exports = {
  key: 'map_site',
  noun: 'Site Map',
  display: {
    label: 'Map Site',
    description: 'Discovers all reachable URLs under a given site. Useful for understanding a domain\'s structure before crawling, or finding sub-pages to scrape.',
  },

  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: true,
        helpText: 'The starting URL for discovery (typically a homepage or section root).',
      },
      {
        key: 'limit',
        label: 'Limit',
        type: 'integer',
        default: '100',
        required: false,
        helpText: 'Maximum number of URLs to return overall. Default is 100.',
      },
      {
        key: 'depth',
        label: 'Depth',
        type: 'integer',
        default: '2',
        required: false,
        helpText: 'How many link-hops from the starting URL to follow. Default is 2.',
      },
      {
        key: 'limitPerLevel',
        label: 'Limit Per Level',
        type: 'integer',
        default: '100',
        required: false,
        helpText: 'Maximum URLs collected per depth level (controls breadth). Default is 100.',
      },
      {
        key: 'includeSubdomains',
        label: 'Include Subdomains',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Include URLs on subdomains of the starting host.',
      },
      {
        key: 'includeExternalLinks',
        label: 'Include External Links',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Also collect (but do not follow) external links.',
      },
      {
        key: 'useBrowser',
        label: 'Use Browser',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Render with a headless browser (for JS-heavy sites/SPAs).',
      },
      {
        key: 'search',
        label: 'Search Filter',
        type: 'string',
        required: false,
        helpText: 'Optional keyword filter - only return URLs whose path/title matches.',
      },
      {
        key: 'maxWaitTime',
        label: 'Max Wait Time (seconds)',
        type: 'integer',
        default: '300',
        required: false,
        helpText: 'Maximum time to wait for the map job to complete. Default is 300 seconds.',
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
      operation: 'mapSite',
      job_id: 'map_123456',
      url: 'https://example.com',
      status: 'completed',
      links: ['https://example.com/about', 'https://example.com/pricing'],
      totalLinks: 2,
      externalLinks: [],
      totalExternalLinks: 0,
      durationMs: 4200,
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'job_id', label: 'Job ID', type: 'string' },
      { key: 'url', label: 'URL', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'links', label: 'Links', type: 'string' },
      { key: 'totalLinks', label: 'Total Links', type: 'integer' },
      { key: 'externalLinks', label: 'External Links', type: 'string' },
      { key: 'totalExternalLinks', label: 'Total External Links', type: 'integer' },
      { key: 'durationMs', label: 'Duration (ms)', type: 'integer' },
    ],
  },
};
