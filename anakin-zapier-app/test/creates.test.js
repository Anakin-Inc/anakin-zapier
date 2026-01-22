/* globals describe, expect, test */

const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

describe('Creates', () => {
  const bundle = {
    authData: {
      apiKey: process.env.API_KEY || 'test_api_key',
      baseUrl: process.env.BASE_URL || 'https://api.anakin.io',
    },
  };

  describe('Search Action', () => {
    test('should perform a search', async () => {
      const testBundle = {
        ...bundle,
        inputData: {
          searchQuery: 'What is artificial intelligence?',
          maxResults: 3,
        },
      };

      const result = await appTester(App.creates.search.operation.perform, testBundle);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('search');
      expect(result.query).toBe('What is artificial intelligence?');
      expect(result.answer).toBeDefined();
    }, 60000); // 60 second timeout
  });

  describe('Extract Website Data Action', () => {
    test('should extract website data', async () => {
      const testBundle = {
        ...bundle,
        inputData: {
          url: 'https://example.com',
          country: 'us',
          forceFresh: false,
          maxWaitTime: 300,
          pollInterval: 3,
        },
      };

      const result = await appTester(App.creates.extract_website_data.operation.perform, testBundle);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('extractWebsiteData');
      expect(result.url).toBe('https://example.com');
      expect(result.status).toBe('completed');
      expect(result.html).toBeDefined();
      expect(result.markdown).toBeDefined();
    }, 320000); // 320 second timeout (5+ minutes for scraping)
  });

  describe('Start Agentic Search Action', () => {
    test('should start agentic search job', async () => {
      const testBundle = {
        ...bundle,
        inputData: {
          searchPrompt: 'Find information about Tesla pricing',
          useBrowser: true,
        },
      };

      const result = await appTester(App.creates.start_agentic_search.operation.perform, testBundle);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.operation).toBe('startAgenticSearch');
      expect(result.job_id).toBeDefined();
      expect(result.status).toBe('submitted');
    }, 60000); // 60 second timeout
  });

  describe('Get Agentic Search Results Action', () => {
    test('should get agentic search results', async () => {
      // First start a job
      const startBundle = {
        ...bundle,
        inputData: {
          searchPrompt: 'Find information about Tesla pricing',
          useBrowser: true,
        },
      };

      const startResult = await appTester(App.creates.start_agentic_search.operation.perform, startBundle);
      expect(startResult.job_id).toBeDefined();

      // Then fetch results (returns immediately with current status)
      const resultsBundle = {
        ...bundle,
        inputData: {
          jobId: startResult.job_id,
        },
      };

      const result = await appTester(App.creates.get_agentic_search_results.operation.perform, resultsBundle);
      
      expect(result).toBeDefined();
      expect(result.operation).toBe('getAgenticSearchResults');
      expect(result.job_id).toBe(startResult.job_id);
      expect(result.status).toBeDefined(); // Can be 'processing', 'completed', or 'failed'
    }, 60000); // 60 second timeout
  });
});
