// Main Zapier app definition
const authentication = require('./authentication');
const extractWebsiteDataAction = require('./creates/scrape_url');
const searchAction = require('./creates/search');
const startAgenticSearchAction = require('./creates/start_agentic_search');
const getAgenticSearchResultsAction = require('./creates/get_agentic_search_results');
const mapSiteAction = require('./creates/map_site');
const crawlSiteAction = require('./creates/crawl_site');
const discoverWireActionsAction = require('./creates/discover_wire_actions');
const browseWireCatalogAction = require('./creates/browse_wire_catalog');
const runWireReadActionAction = require('./creates/run_wire_read_action');
const runWireWriteActionAction = require('./creates/run_wire_write_action');
const listWireIdentitiesAction = require('./creates/list_wire_identities');
const wireLoginAction = require('./creates/wire_login');
const requestWireActionAction = require('./creates/request_wire_action');
const createMonitorAction = require('./creates/create_monitor');
const listMonitorsAction = require('./creates/list_monitors');
const controlMonitorAction = require('./creates/control_monitor');
const listAiVisibilitySourcesAction = require('./creates/list_ai_visibility_sources');
const searchAiVisibilityAction = require('./creates/search_ai_visibility');
const listSessionsAction = require('./creates/list_sessions');
const deleteSessionAction = require('./creates/delete_session');
const runBrowserTaskAction = require('./creates/run_browser_task');

const monitorChangeTrigger = require('./triggers/monitor_change');

// Add custom middleware to include API key and source tracking in all requests
const addApiKeyToHeader = (request, z, bundle) => {
  request.headers = request.headers || {};
  request.headers['X-Source'] = 'zapier';
  if (bundle.authData && bundle.authData.apiKey) {
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
    [mapSiteAction.key]: mapSiteAction,
    [crawlSiteAction.key]: crawlSiteAction,
    [discoverWireActionsAction.key]: discoverWireActionsAction,
    [browseWireCatalogAction.key]: browseWireCatalogAction,
    [runWireReadActionAction.key]: runWireReadActionAction,
    [runWireWriteActionAction.key]: runWireWriteActionAction,
    [listWireIdentitiesAction.key]: listWireIdentitiesAction,
    [wireLoginAction.key]: wireLoginAction,
    [requestWireActionAction.key]: requestWireActionAction,
    [createMonitorAction.key]: createMonitorAction,
    [listMonitorsAction.key]: listMonitorsAction,
    [controlMonitorAction.key]: controlMonitorAction,
    [listAiVisibilitySourcesAction.key]: listAiVisibilitySourcesAction,
    [searchAiVisibilityAction.key]: searchAiVisibilityAction,
    [listSessionsAction.key]: listSessionsAction,
    [deleteSessionAction.key]: deleteSessionAction,
    [runBrowserTaskAction.key]: runBrowserTaskAction,
  },

  // Polling trigger: fires when a website monitor detects a change
  triggers: {
    [monitorChangeTrigger.key]: monitorChangeTrigger,
  },
  searches: {},
};
