// Crawl Site Action
// Bulk-fetches markdown/HTML across a site (async with polling)

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

    z.console.log(`Checking status (attempt ${attempts}) for crawl job ID: ${jobId}`);

    const response = await z.request({
      url: `${bundle.authData.baseUrl}/v1/crawl/${jobId}`,
      method: 'GET',
      headers: {
        'X-API-Key': bundle.authData.apiKey,
      },
    });

    const statusData = response.data;
    const status = statusData.status;

    z.console.log(`Current status: ${status}`);

    if (status === 'completed') {
      z.console.log(`Crawl job completed successfully for job ID: ${jobId}`);
      return {
        success: true,
        operation: 'crawlSite',
        job_id: jobId,
        ...statusData,
      };
    }

    if (status === 'failed') {
      const errorMessage = statusData.error || 'Unknown error occurred';
      throw new Error(`Crawl job failed: ${errorMessage}`);
    }

    z.console.log(`Crawl job still processing... (${status})`);
  }

  throw new Error(`Job did not complete within ${maxWaitTime / 1000} seconds`);
};

// Parse a newline/comma separated pattern list into an array
const parsePatternList = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  const items = String(value)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
};

// Main perform function
const perform = async (z, bundle) => {
  const {
    url,
    maxPages = 10,
    depth = 1,
    country = 'us',
    useBrowser = false,
    includePatterns,
    excludePatterns,
    sessionId,
    sessionName,
    maxWaitTime = 300,
    pollInterval = 3,
  } = bundle.inputData;

  if (!url || url.trim() === '') {
    throw new Error('URL is required');
  }

  z.console.log(`Submitting crawl job for URL: ${url}`);

  const body = {
    url: url.trim(),
    maxPages,
    depth,
    country,
    useBrowser,
  };

  const includeList = parsePatternList(includePatterns);
  if (includeList) body.includePatterns = includeList;

  const excludeList = parsePatternList(excludePatterns);
  if (excludeList) body.excludePatterns = excludeList;

  if (sessionId) body.sessionId = sessionId;
  if (sessionName) body.sessionName = sessionName;

  const submitResponse = await z.request({
    url: `${bundle.authData.baseUrl}/v1/crawl`,
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

  z.console.log(`Crawl job submitted successfully. Job ID: ${jobId}`);

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
  key: 'crawl_site',
  noun: 'Crawl',
  display: {
    label: 'Crawl Site',
    description: 'Bulk-fetches markdown/HTML across a site. Use for catalog ingestion or building a site-wide RAG corpus. Pair with include/exclude patterns to scope which URLs are fetched.',
  },

  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: true,
        helpText: 'The starting URL for the crawl.',
      },
      {
        key: 'maxPages',
        label: 'Max Pages',
        type: 'integer',
        default: '10',
        required: false,
        helpText: 'Hard cap on pages fetched. Default is 10.',
      },
      {
        key: 'depth',
        label: 'Depth',
        type: 'integer',
        default: '1',
        required: false,
        helpText: 'Link-hops from the starting URL to follow. Default is 1.',
      },
      {
        key: 'country',
        label: 'Country Code',
        type: 'string',
        default: 'us',
        required: false,
        helpText: 'Two-letter proxy egress country code. For example: us, uk, de',
      },
      {
        key: 'useBrowser',
        label: 'Use Browser',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Render each page in a headless browser (for JS-heavy sites/SPAs).',
      },
      {
        key: 'includePatterns',
        label: 'Include Patterns',
        type: 'text',
        required: false,
        helpText: 'Glob/regex patterns, one per line (or comma separated). Only URLs matching at least one pattern are fetched.',
      },
      {
        key: 'excludePatterns',
        label: 'Exclude Patterns',
        type: 'text',
        required: false,
        helpText: 'Glob/regex patterns, one per line (or comma separated). URLs matching any pattern are skipped.',
      },
      {
        key: 'sessionId',
        label: 'Session ID',
        type: 'string',
        required: false,
        helpText: 'Optional saved browser-session ID for login-protected sites. See the List Sessions action.',
      },
      {
        key: 'sessionName',
        label: 'Session Name',
        type: 'string',
        required: false,
        helpText: 'Optional saved browser-session name (alternative to Session ID).',
      },
      {
        key: 'maxWaitTime',
        label: 'Max Wait Time (seconds)',
        type: 'integer',
        default: '300',
        required: false,
        helpText: 'Maximum time to wait for the crawl job to complete. Default is 300 seconds.',
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
      operation: 'crawlSite',
      job_id: 'crawl_123456',
      url: 'https://example.com',
      status: 'completed',
      totalPages: 2,
      completedPages: 2,
      pages: [
        {
          url: 'https://example.com',
          status: 'completed',
          markdown: '# Example\n\nHome page content...',
          durationMs: 1200,
        },
      ],
      durationMs: 3400,
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'job_id', label: 'Job ID', type: 'string' },
      { key: 'url', label: 'URL', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'totalPages', label: 'Total Pages', type: 'integer' },
      { key: 'completedPages', label: 'Completed Pages', type: 'integer' },
      { key: 'pages', label: 'Pages', type: 'string' },
      { key: 'durationMs', label: 'Duration (ms)', type: 'integer' },
    ],
  },
};
