# Anakin Zapier Integration

Zapier integration for Anakin API - web scraping, AI search, and intelligent data extraction.

## Features

- 🔐 **Simple Authentication**: API Key-based authentication
- 🌐 **Web Scraping**: Scrape any website and extract structured data (async with polling)
- 🔍 **AI Search**: Perform intelligent searches powered by Perplexity AI (synchronous)
- 🤖 **Agentic Search**: Advanced multi-stage pipeline that searches, scrapes, and extracts structured data automatically (async with polling)
- ⏳ **Automatic Polling**: Built-in polling for async operations
- 🎯 **Configurable**: Customizable polling intervals, timeouts, and proxy routing
- 🌍 **Country-Specific Proxies**: Support for country-specific proxy routing
- ♻️ **Cache Control**: Force fresh scraping when needed

## Actions

### 1. Scrape URL
Extract content and structured data from any website.

**Input Fields:**
- **URL** (required): The website URL to scrape
- **Country Code** (optional): Country code for proxy routing (default: `us`)
- **Force Fresh** (optional): Bypass cache and force fresh scrape (default: `false`)
- **Max Wait Time** (optional): Maximum seconds to wait for completion (default: `300`)
- **Poll Interval** (optional): Seconds between status checks (default: `3`)

**Output:**
- HTML content
- Markdown content
- Generated JSON with structured data
- Request ID and status

**Use Cases:**
- Data extraction from websites
- Content monitoring
- Price tracking
- Competitive intelligence

### 2. AI Search
Perform AI-powered searches using Perplexity AI.

**Input Fields:**
- **Search Query** (required): The question or query to search
- **Max Results** (optional): Maximum number of results to return (default: `5`)

**Output:**
- AI-generated answer
- Search results with citations
- Source URLs and scores

**Use Cases:**
- Research and fact-checking
- Content research
- Real-time information gathering
- Market intelligence

### 3. Agentic Search
Advanced multi-stage AI pipeline that automatically searches, scrapes citations, and extracts structured data.

**Input Fields:**
- **Search Prompt** (required): The search prompt for analysis
- **Use Browser** (optional): Use browser for scraping (more reliable) (default: `true`)
- **Max Wait Time** (optional): Maximum seconds to wait for completion (default: `600`)
- **Poll Interval** (optional): Seconds between status checks (default: `5`)

**Output:**
- Perplexity AI answer
- Citations from sources
- Scraped data from each citation
- AI-extracted structured data
- Comprehensive summary

**Use Cases:**
- Market research with structured data
- Competitive analysis
- Lead generation with enriched data
- Automated data collection for reports

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- Zapier CLI (will be installed as dev dependency)
- Anakin API key (get from [https://anakin.io](https://anakin.io))

### Installation

```bash
# Clone or navigate to the project
cd anakin-zapier-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your API key
# API_KEY=your_actual_api_key_here
```

### Running Tests

```bash
# Run all tests
npm test

# Run with environment variables
API_KEY=your_api_key npm test
```

### Local Development

```bash
# Test authentication
zapier test --debug

# Test a specific action
zapier test --debug creates.search

# Test with custom input
zapier test --debug creates.scrape_url --input '{"url": "https://example.com"}'
```

## Deployment & Publishing

### Step 1: Link Your Zapier Account

```bash
# Login to Zapier (only needed once)
zapier login
```

### Step 2: Register Your App

```bash
# Register the app (only needed once)
zapier register "Anakin"
```

### Step 3: Deploy to Zapier

```bash
# Push your app to Zapier
zapier push

# The first push will create a new version
# Subsequent pushes will create new versions
```

### Step 4: Test in Zapier UI

1. Go to [https://zapier.com/app/developer](https://zapier.com/app/developer)
2. Click on your "Anakin" integration
3. Click "Add a New Zap"
4. Test each action:
   - Configure authentication with your API key
   - Test the Search action
   - Test the Scrape URL action
   - Test the Agentic Search action

### Step 5: Invite Testers (Private Beta)

```bash
# Create a shareable link for testers
zapier invite user@example.com

# Or share your app's install URL
zapier integrations
```

### Step 6: Submit for Public Approval (Optional)

Once you've tested thoroughly:

1. Go to Zapier Developer Platform
2. Click "Submit for App Review"
3. Fill out the submission form
4. Wait for Zapier's review (typically 1-2 weeks)

## Project Structure

```
anakin-zapier-app/
├── index.js                    # Main app definition
├── authentication.js           # Authentication configuration
├── package.json               # Dependencies and scripts
├── creates/                   # Actions (creates)
│   ├── scrape_url.js         # Scrape URL action
│   ├── search.js             # AI Search action
│   └── agentic_search.js     # Agentic Search action
├── utils/                    # Utilities
│   └── helpers.js            # Helper functions
├── test/                     # Test files
│   ├── authentication.test.js
│   └── creates.test.js
├── .env.example              # Environment template
├── .gitignore
└── README.md                 # This file
```

## API Endpoints Used

### Authentication
- Header: `X-API-Key: your_api_key`

### Scrape URL
- `POST /v1/request` - Submit scraping job
- `GET /v1/request/{id}` - Check job status

### Search
- `POST /v1/search` - Perform AI search (synchronous)

### Agentic Search
- `POST /v1/agentic-search` - Submit agentic search job
- `GET /v1/agentic-search/{jobId}` - Check agentic search status

## Error Handling

The integration includes robust error handling:

- **Authentication Errors**: Invalid API key will be caught during connection test
- **Timeout Errors**: Jobs that exceed max wait time will throw clear error messages
- **API Errors**: HTTP errors are caught and displayed with helpful messages
- **Validation Errors**: Required fields are validated before making API calls

## Best Practices

1. **Polling Intervals**: 
   - Use 3-5 seconds for scraping
   - Use 5-10 seconds for agentic search
   - Don't set too low to avoid rate limits

2. **Timeouts**:
   - Simple pages: 60-120 seconds
   - Complex pages: 300+ seconds
   - Agentic search: 600+ seconds

3. **Caching**:
   - Use `forceFresh: false` for repeated URLs to save credits
   - Use `forceFresh: true` when you need latest data

4. **Country Codes**:
   - Use appropriate country codes for geo-restricted content
   - Common codes: `us`, `uk`, `de`, `fr`, `jp`, `au`

## Troubleshooting

### "No request ID received from API"
- Check your API key is valid
- Verify the base URL is correct
- Check if the API is accessible

### "Job did not complete within X seconds"
- Increase the `maxWaitTime` parameter
- Check if the target URL is accessible
- Verify the page isn't blocking scrapers

### "Authentication failed"
- Verify your API key in Settings > Connected Accounts
- Check if your API key has the right permissions
- Try generating a new API key

### Tests timing out
- Increase Jest timeout in package.json
- Check your internet connection
- Verify the API endpoints are responding

## Support

For issues, questions, or contributions:
- 🐛 [Report a bug](https://github.com/Anakin-Inc/anakin-zapier/issues)
- 💡 [Request a feature](https://github.com/Anakin-Inc/anakin-zapier/issues)
- 📖 [API Documentation](https://anakin.io/docs)
- 💬 Email: anakin@anakininc.com

## Version History

### 1.0.0 (Initial Release)
- Scrape URL action with automatic polling
- AI Search action with Perplexity integration
- Agentic Search action with multi-stage pipeline
- API Key authentication
- Comprehensive error handling
- Full test coverage

## License

MIT

---

**Note**: This is a private Zapier integration. To make it public, you'll need to submit it for review through the Zapier Developer Platform.
