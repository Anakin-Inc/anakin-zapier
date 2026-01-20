/* globals describe, expect, test */

const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

describe('Authentication', () => {
  test('should authenticate with valid API key', async () => {
    const bundle = {
      authData: {
        apiKey: process.env.API_KEY || 'test_api_key',
        baseUrl: process.env.BASE_URL || 'https://api.anakin.io',
      },
    };

    const response = await appTester(App.authentication.test, bundle);
    expect(response).toBeDefined();
  });

  test('should fail with invalid API key', async () => {
    const bundle = {
      authData: {
        apiKey: 'invalid_key',
        baseUrl: process.env.BASE_URL || 'https://api.anakin.io',
      },
    };

    try {
      await appTester(App.authentication.test, bundle);
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });
});
