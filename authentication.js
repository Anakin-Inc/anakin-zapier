// Authentication configuration for Anakin API
// Uses API Key authentication with custom header

const testAuthentication = async (z, bundle) => {
  // Test the authentication by making a simple request
  // We'll use a lightweight endpoint or validate the key format
  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/search`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body: {
      prompt: 'test',
      limit: 1,
    },
  });

  // If we get here without an error, authentication succeeded
  return response.data;
};

module.exports = {
  type: 'custom',
  
  // Define the fields users will see in the authentication form
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'string',
      required: true,
      helpText: 'Your Anakin API authentication token. Get it from [Anakin.io](https://anakin.io)',
    },
    {
      key: 'baseUrl',
      label: 'API Base URL',
      type: 'string',
      default: 'https://api.anakin.io',
      required: true,
      helpText: 'The base URL of the Anakin API. Use the default unless instructed otherwise.',
    },
  ],

  // Test function to validate the authentication works
  test: testAuthentication,

  // Label for the connection (don't show sensitive data)
  connectionLabel: 'Anakin API Connection',
};
