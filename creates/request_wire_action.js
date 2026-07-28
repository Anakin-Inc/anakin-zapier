// Request Wire Action (Wire Build)
// Requests a brand-new Wire action for a website that isn't in the catalog yet (synchronous submit; build itself is async server-side)

const perform = async (z, bundle) => {
  const { websiteUrl, goal, catalogId, visibility = 'private', force = false } = bundle.inputData;

  if (!websiteUrl || websiteUrl.trim() === '') {
    throw new Error('Website URL is required');
  }
  if (!goal || goal.trim() === '') {
    throw new Error('Goal is required');
  }

  z.console.log(`Requesting a new Wire action for: ${websiteUrl}`);

  const body = {
    website_url: websiteUrl.trim(),
    goal: goal.trim(),
    visibility,
    force,
  };
  if (catalogId) body.catalog_id = catalogId;

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/wire/build-request`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body,
  });

  const data = response.data;

  z.console.log('Wire build request submitted successfully');

  return {
    success: true,
    operation: 'requestWireAction',
    website_url: websiteUrl.trim(),
    goal: goal.trim(),
    ...data,
  };
};

module.exports = {
  key: 'request_wire_action',
  noun: 'Wire Build Request',
  display: {
    label: 'Request a New Wire Action',
    description: 'Requests a brand-new Wire action for a website that isn\'t in the catalog yet. Describe the site and what the action should do or extract; Wire generates and auto-tests a scraper, then publishes it. Asynchronous on Anakin\'s side (returns status "pending") and charges credits, refunded automatically if the build fails. Only use this after Discover Wire Actions / Browse Wire Catalog confirm no existing action covers the site.',
  },

  operation: {
    inputFields: [
      {
        key: 'websiteUrl',
        label: 'Website URL',
        type: 'string',
        required: true,
        helpText: 'The site to build an action for. The domain is extracted automatically.',
      },
      {
        key: 'goal',
        label: 'Goal',
        type: 'text',
        required: true,
        helpText: 'Natural-language description of what the action should do or extract. Be specific - the builder synthesizes the scraper from this.',
      },
      {
        key: 'catalogId',
        label: 'Catalog ID',
        type: 'string',
        required: false,
        helpText: 'Optional - attach to an existing catalog instead of creating one.',
      },
      {
        key: 'visibility',
        label: 'Visibility',
        type: 'string',
        choices: { private: 'Private', public: 'Public' },
        default: 'private',
        required: false,
        helpText: 'Action visibility. Defaults to private.',
      },
      {
        key: 'force',
        label: 'Force',
        type: 'boolean',
        default: 'false',
        required: false,
        helpText: 'Build even if similar actions already exist for the domain (otherwise the request is rejected with ACTION_EXISTS).',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'requestWireAction',
      website_url: 'https://example.com',
      goal: 'Extract product name, price, and availability from a product page',
      status: 'pending',
      build_id: 'build_123456',
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'website_url', label: 'Website URL', type: 'string' },
      { key: 'goal', label: 'Goal', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'build_id', label: 'Build ID', type: 'string' },
    ],
  },
};
