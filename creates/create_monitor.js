// Create Monitor
// Creates a scheduled website monitor (synchronous - the monitor itself runs on Anakin's schedule)

const parseList = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  const items = String(value)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
};

const parseJson = (value, fieldLabel) => {
  if (!value || String(value).trim() === '') return undefined;
  try {
    return JSON.parse(value);
  } catch (e) {
    throw new Error(`Invalid JSON in ${fieldLabel} field: ${e.message}`);
  }
};

const perform = async (z, bundle) => {
  const {
    url,
    intervalMinutes,
    scope = 'page',
    watchMode = 'full_page',
    watchFormat,
    outputSchema,
    aiMode = false,
    aiGoal,
    useBrowser = false,
    country = 'us',
    sessionId,
    isActive = true,
    expiresAt,
    alertWebhookUrl,
    alertEmails,
    maxPages,
    maxDepth,
    includePatterns,
    excludePatterns,
    wireActionId,
    wireCatalogSlug,
    wireCredentialId,
    wireParams,
    wireWatchPaths,
  } = bundle.inputData;

  if (!url || url.trim() === '') {
    throw new Error('URL is required');
  }
  if (!intervalMinutes) {
    throw new Error('Interval Minutes is required');
  }
  if (intervalMinutes < 15) {
    throw new Error('Interval Minutes must be at least 15');
  }

  z.console.log(`Creating monitor for URL: ${url}`);

  const body = {
    url: url.trim(),
    intervalMinutes,
    scope,
    watchMode,
    aiMode,
    useBrowser,
    country,
    isActive,
  };

  if (watchFormat) body.watchFormat = watchFormat;
  const parsedOutputSchema = parseJson(outputSchema, 'Output Schema');
  if (parsedOutputSchema) body.outputSchema = parsedOutputSchema;
  if (aiGoal) body.aiGoal = aiGoal;
  if (sessionId) body.sessionId = sessionId;
  if (expiresAt) body.expiresAt = expiresAt;
  if (alertWebhookUrl) body.alertWebhookUrl = alertWebhookUrl;
  if (alertEmails) body.alertEmails = alertEmails;
  if (maxPages) body.maxPages = maxPages;
  if (maxDepth) body.maxDepth = maxDepth;
  const includeList = parseList(includePatterns);
  if (includeList) body.includePatterns = includeList;
  const excludeList = parseList(excludePatterns);
  if (excludeList) body.excludePatterns = excludeList;
  if (wireActionId) body.wireActionId = wireActionId;
  if (wireCatalogSlug) body.wireCatalogSlug = wireCatalogSlug;
  if (wireCredentialId) body.wireCredentialId = wireCredentialId;
  const parsedWireParams = parseJson(wireParams, 'Wire Params');
  if (parsedWireParams) body.wireParams = parsedWireParams;
  const wireWatchPathsList = parseList(wireWatchPaths);
  if (wireWatchPathsList) body.wireWatchPaths = wireWatchPathsList;

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/monitors`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body,
  });

  const data = response.data;

  // The API returns an HMAC signing secret (alertWebhookSecret). It has now
  // entered this Zap's task history, so it is treated as already exposed -
  // we do not attempt to hide it - but we do not log it either.
  z.console.log(`Monitor created successfully. Monitor ID: ${data.id || data.monitorId || 'unknown'}`);

  return {
    success: true,
    operation: 'createMonitor',
    ...data,
  };
};

module.exports = {
  key: 'create_monitor',
  noun: 'Monitor',
  display: {
    label: 'Create Monitor',
    description: 'Creates a scheduled website monitor that checks a URL every N minutes (minimum 15) and records a change when the content differs - optionally alerting a webhook or email. Scope "page" (default) watches one URL; "site" crawls the site each run; "wire" runs a Wire action each check and diffs its JSON.',
  },

  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: true,
        helpText: 'The URL to watch (root URL for site scope; the Wire site\'s URL for wire scope).',
      },
      {
        key: 'intervalMinutes',
        label: 'Interval (minutes)',
        type: 'integer',
        required: true,
        helpText: 'Check frequency in minutes. Minimum 15.',
      },
      {
        key: 'scope',
        label: 'Scope',
        type: 'string',
        choices: { page: 'Page', site: 'Site', wire: 'Wire' },
        default: 'page',
        required: false,
        helpText: 'What to monitor: one page (default), a whole site, or a Wire action.',
      },
      {
        key: 'watchMode',
        label: 'Watch Mode',
        type: 'string',
        choices: { full_page: 'Full Page', specific_data: 'Specific Data' },
        default: 'full_page',
        required: false,
        helpText: 'Compare the whole page (default, 2 credits/check) or only the fields in Output Schema, extracted with AI (3 credits/check).',
      },
      {
        key: 'watchFormat',
        label: 'Watch Format',
        type: 'string',
        choices: { markdown: 'Markdown', html: 'HTML', cleaned_html: 'Cleaned HTML' },
        required: false,
        helpText: 'Format compared in full_page mode. Defaults to markdown.',
      },
      {
        key: 'outputSchema',
        label: 'Output Schema (JSON)',
        type: 'text',
        required: false,
        helpText: 'JSON Schema of the fields to track as a raw JSON object. Required when Watch Mode is "specific_data".',
      },
      {
        key: 'aiMode',
        label: 'AI Mode',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'AI meaningful-change filtering: ignores trivial noise (ads, timestamps) and summarizes real changes. +1 credit per check.',
      },
      {
        key: 'aiGoal',
        label: 'AI Goal',
        type: 'string',
        required: false,
        helpText: 'Natural-language description of which changes count as meaningful (used with AI Mode), e.g. "only when the price drops or it goes out of stock".',
      },
      {
        key: 'useBrowser',
        label: 'Use Browser',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Render checks with a stealth headless browser (needed for JS-heavy pages). Forced true when Session ID is set.',
      },
      {
        key: 'country',
        label: 'Country Code',
        type: 'string',
        default: 'us',
        required: false,
        helpText: 'Two-letter proxy country code. Defaults to "us".',
      },
      {
        key: 'sessionId',
        label: 'Session ID',
        type: 'string',
        required: false,
        helpText: 'Saved browser-session ID for monitoring login-protected pages. See the List Sessions action.',
      },
      {
        key: 'isActive',
        label: 'Active',
        type: 'boolean',
        default: 'true',
        required: false,
        helpText: 'Start running immediately. Defaults to true.',
      },
      {
        key: 'expiresAt',
        label: 'Expires At',
        type: 'string',
        required: false,
        helpText: 'Optional end date (ISO 8601 timestamp or YYYY-MM-DD); the monitor auto-pauses when it passes.',
      },
      {
        key: 'alertWebhookUrl',
        label: 'Alert Webhook URL',
        type: 'string',
        required: false,
        helpText: 'Webhook URL that receives signed change alerts.',
      },
      {
        key: 'alertEmails',
        label: 'Alert Emails',
        type: 'string',
        required: false,
        helpText: 'Comma-separated email recipients for change alerts.',
      },
      {
        key: 'maxPages',
        label: 'Max Pages (site scope)',
        type: 'integer',
        required: false,
        helpText: 'Site scope: max pages crawled per run.',
      },
      {
        key: 'maxDepth',
        label: 'Max Depth (site scope)',
        type: 'integer',
        required: false,
        helpText: 'Site scope: crawl depth (1-5). Defaults to 2.',
      },
      {
        key: 'includePatterns',
        label: 'Include Patterns (site scope)',
        type: 'text',
        required: false,
        helpText: 'Site scope: glob patterns or hand-picked same-site URLs to track, one per line (or comma separated).',
      },
      {
        key: 'excludePatterns',
        label: 'Exclude Patterns (site scope)',
        type: 'text',
        required: false,
        helpText: 'Site scope: glob patterns to skip, one per line (or comma separated).',
      },
      {
        key: 'wireActionId',
        label: 'Wire Action ID (wire scope)',
        type: 'string',
        required: false,
        helpText: 'Wire scope (required there): the Wire action run each check, e.g. "amazon.search_products" (see Discover Wire Actions).',
      },
      {
        key: 'wireCatalogSlug',
        label: 'Wire Catalog Slug (wire scope)',
        type: 'string',
        required: false,
        helpText: 'Wire scope: catalog slug of the Wire site.',
      },
      {
        key: 'wireCredentialId',
        label: 'Wire Credential ID (wire scope)',
        type: 'string',
        required: false,
        helpText: 'Wire scope: credential ID when the action needs auth (see List Wire Identities).',
      },
      {
        key: 'wireParams',
        label: 'Wire Params (JSON, wire scope)',
        type: 'text',
        required: false,
        helpText: 'Wire scope: parameters passed to the action each check, as a raw JSON object.',
      },
      {
        key: 'wireWatchPaths',
        label: 'Wire Watch Paths (wire scope)',
        type: 'text',
        required: false,
        helpText: 'Wire scope: JSON paths to diff instead of the whole response, one per line (or comma separated).',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'createMonitor',
      id: 'monitor_123456',
      url: 'https://example.com/pricing',
      intervalMinutes: 60,
      scope: 'page',
      watchMode: 'full_page',
      isActive: true,
      nextCheckAt: '2026-07-27T15:00:00Z',
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'id', label: 'Monitor ID', type: 'string' },
      { key: 'url', label: 'URL', type: 'string' },
      { key: 'intervalMinutes', label: 'Interval (minutes)', type: 'integer' },
      { key: 'scope', label: 'Scope', type: 'string' },
      { key: 'watchMode', label: 'Watch Mode', type: 'string' },
      { key: 'isActive', label: 'Active', type: 'boolean' },
      { key: 'nextCheckAt', label: 'Next Check At', type: 'string' },
    ],
  },
};
