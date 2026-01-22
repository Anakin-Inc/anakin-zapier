// Main Zapier app definition
const authentication = require('./authentication');
const extractWebsiteDataAction = require('./creates/scrape_url');
const searchAction = require('./creates/search');
const startAgenticSearchAction = require('./creates/start_agentic_search');
const getAgenticSearchResultsAction = require('./creates/get_agentic_search_results');

// Add custom middleware to include API key in all requests
const addApiKeyToHeader = (request, z, bundle) => {
  if (bundle.authData && bundle.authData.apiKey) {
    request.headers = request.headers || {};
    request.headers['X-API-Key'] = bundle.authData.apiKey;
  }
  return request;
};

// Add error handling middleware
const handleHTTPError = (response, z, bundle) => {
  if (response.status >= 400) {
    const errorMessage = response.json?.message || response.json?.error || `HTTP ${response.status} error`;
    throw new z.errors.Error(errorMessage, 'APIError', response.status);
  }
  return response;
};

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  // Authentication configuration
  authentication: authentication,

  // Middleware functions
  beforeRequest: [addApiKeyToHeader],
  afterResponse: [handleHTTPError],

  // Define all creates (actions)
  creates: {
    [extractWebsiteDataAction.key]: extractWebsiteDataAction,
    [searchAction.key]: searchAction,
    [startAgenticSearchAction.key]: startAgenticSearchAction,
    [getAgenticSearchResultsAction.key]: getAgenticSearchResultsAction,
  },

  // No triggers or searches for this integration
  triggers: {},
  searches: {},
};
