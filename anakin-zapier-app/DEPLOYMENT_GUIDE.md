# Anakin Zapier Integration - Deployment Guide

Complete step-by-step guide to deploy and publish your Zapier integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Testing Locally](#testing-locally)
4. [Deploying to Zapier](#deploying-to-zapier)
5. [Testing in Zapier UI](#testing-in-zapier-ui)
6. [Sharing with Users](#sharing-with-users)
7. [Publishing Publicly](#publishing-publicly)
8. [Maintenance & Updates](#maintenance--updates)

---

## Prerequisites

### Required
- ✅ Node.js >= 18 installed
- ✅ npm >= 9 installed
- ✅ Zapier account (free tier is fine)
- ✅ Anakin API key ([get one here](https://anakin.io))
- ✅ Git (for version control)

### Optional but Recommended
- GitHub account (for collaboration)
- Text editor (VS Code, Sublime, etc.)

---

## Initial Setup

### 1. Install Dependencies

```bash
cd anakin-zapier-app
npm install
```

This will install:
- `zapier-platform-core` - Runtime for your integration
- `zapier-platform-cli` - Development tools
- `jest` - Testing framework

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials
nano .env  # or use your preferred editor
```

Add your API credentials:
```env
API_KEY=sk_your_actual_api_key_here
BASE_URL=https://api.anakin.io
```

### 3. Login to Zapier CLI

```bash
# This will open a browser for authentication
npx zapier login

# Or if you have zapier-platform-cli installed globally
zapier login
```

Follow the prompts to authenticate with your Zapier account.

---

## Testing Locally

### 1. Run All Tests

```bash
npm test
```

This runs the full test suite including:
- Authentication tests
- Search action tests  
- Scrape URL action tests
- Agentic Search action tests

### 2. Test Individual Actions

```bash
# Test authentication
npx zapier test --debug authentication.test.js

# Test specific action
npx zapier test --debug creates.search

# Test with custom input
npx zapier test creates.scrape_url --input '{"url": "https://example.com"}'
```

### 3. Validate Your App

```bash
# Check for issues before deploying
npx zapier validate

# This checks:
# - Required fields are present
# - Code structure is correct
# - No deprecated features are used
```

---

## Deploying to Zapier

### 1. Register Your App (First Time Only)

```bash
# Register with a unique name
npx zapier register "Anakin"

# If "Anakin" is taken, try variations:
# npx zapier register "Anakin API"
# npx zapier register "Anakin Scraper"
```

This creates your app in Zapier's platform and links it to your account.

### 2. Push Your Code

```bash
# Deploy version 1.0.0 (first deployment)
npx zapier push

# You'll see output like:
# ✔ Build successful
# ✔ Uploading build
# ✔ Build pushed to Zapier
```

### 3. Verify Deployment

```bash
# Check your deployed versions
npx zapier versions

# Output shows:
# Version  Status    Created
# 1.0.0    private   2024-01-14
```

---

## Testing in Zapier UI

### 1. Access Developer Dashboard

1. Go to [https://zapier.com/app/developer](https://zapier.com/app/developer)
2. Click on your "Anakin" integration
3. You'll see:
   - **Versions**: Your deployed versions
   - **Monitoring**: Usage statistics
   - **Integration Definition**: Your actions and configuration

### 2. Test Authentication

1. Click **Testing** tab
2. Click **Add Account**
3. Enter your credentials:
   - **API Key**: Your Anakin API key
   - **API Base URL**: `https://api.anakin.io`
4. Click **Yes, Continue**
5. Verify connection succeeds ✅

### 3. Test Each Action

#### Test AI Search (Quick Test)
1. Click **Testing** > **Test your searches, triggers & actions**
2. Select **AI Search** action
3. Select your connected account
4. Fill in:
   - **Search Query**: "What are the latest AI trends?"
   - **Max Results**: 3
5. Click **Test Action**
6. Verify results appear ✅

#### Test Scrape URL
1. Select **Scrape URL** action
2. Fill in:
   - **URL**: "https://example.com"
   - **Country Code**: "us"
   - **Max Wait Time**: 300
3. Click **Test Action**
4. Wait for polling to complete (may take 1-2 minutes)
5. Verify scraped data appears ✅

#### Test Agentic Search
1. Select **Agentic Search** action
2. Fill in:
   - **Search Prompt**: "Find pricing for top 3 CRM tools"
   - **Use Browser**: true
   - **Max Wait Time**: 600
3. Click **Test Action**
4. Wait for completion (may take 5-10 minutes)
5. Verify structured data appears ✅

### 4. Create a Test Zap

1. Click **Make a Zap**
2. **Trigger**: Choose any trigger (e.g., "Schedule by Zapier")
3. **Action**: Search for "Anakin"
4. Select your Anakin app
5. Choose an action (e.g., "AI Search")
6. Map fields and test
7. Turn on your Zap
8. Monitor execution ✅

---

## Sharing with Users

### Option 1: Private Invite (Beta Testing)

```bash
# Invite specific users by email
npx zapier invite user1@example.com
npx zapier invite user2@example.com

# Or generate a shareable invite link
npx zapier integrations
```

**Beta users can:**
- Connect your integration
- Use all actions in their Zaps
- Provide feedback

**Limitations:**
- Not visible in Zapier's public directory
- Users need invite link or email invitation
- Limited to your Zapier plan's user limit

### Option 2: Promote to Beta

```bash
# Promote current version to beta
npx zapier promote 1.0.0

# This makes it available to all invited users
```

### Option 3: Share via Link

1. Go to Developer Dashboard
2. Click **Sharing** tab
3. Copy **Invite Link**
4. Share with testers

Example link format:
```
https://zapier.com/developer/public-invite/123456/abcdef12345/
```

---

## Publishing Publicly

### Before Submitting

- [ ] Test all actions thoroughly
- [ ] Have at least 5-10 beta users actively using it
- [ ] Gather feedback and fix issues
- [ ] Ensure API is stable and documented
- [ ] Prepare marketing materials (logo, description, screenshots)
- [ ] Review [Zapier's App Review Requirements](https://platform.zapier.com/partners/app-review-guidelines)

### Submission Checklist

1. **App Metadata**
   - Clear, concise description
   - High-quality logo (256x256px)
   - Screenshots of each action
   - Support email/URL
   - Category selection

2. **Documentation**
   - Help text for all fields
   - Clear error messages
   - Authentication instructions
   - API documentation link

3. **Testing**
   - All actions work correctly
   - Error handling is robust
   - No console errors
   - Fast performance (<30s for most actions)

### Submit for Review

1. Go to Developer Dashboard
2. Click **Visibility** tab
3. Click **Submit for Public Review**
4. Fill out submission form:
   - App description
   - Category
   - Logo upload
   - Support contact
   - Testing notes
5. Submit ✅

### Review Process

- **Timeline**: 1-3 weeks typically
- **Process**: 
  1. Automated checks
  2. Manual testing by Zapier team
  3. Feedback/revision requests (if needed)
  4. Approval
- **Communication**: Via email to your Zapier account

### After Approval

1. App appears in Zapier's directory
2. Users can find it by searching "Anakin"
3. You'll get email notifications for:
   - New users connecting
   - Errors/issues
   - Usage milestones

---

## Maintenance & Updates

### Deploying Updates

```bash
# Make your code changes
# Update version in package.json (e.g., 1.0.0 -> 1.1.0)

# Test locally
npm test

# Push new version
npx zapier push

# Output:
# Building version 1.1.0
# ✔ Build pushed successfully
```

### Version Management

```bash
# List all versions
npx zapier versions

# Migrate users to new version
npx zapier migrate 1.0.0 1.1.0 100%

# Deprecate old version
npx zapier deprecate 1.0.0 2024-06-01
```

### Monitoring

1. **Check Usage**
   ```bash
   npx zapier history
   ```

2. **View Errors**
   - Go to Developer Dashboard
   - Click **Monitoring** tab
   - Review error logs
   - Fix issues and push updates

3. **User Feedback**
   - Check support emails
   - Monitor GitHub issues
   - Survey beta users

### Best Practices

1. **Semantic Versioning**
   - Major (1.0.0): Breaking changes
   - Minor (1.1.0): New features (backwards compatible)
   - Patch (1.0.1): Bug fixes

2. **Migration Strategy**
   - Test new version thoroughly
   - Migrate gradually (10% → 50% → 100%)
   - Keep old version active for 30 days
   - Notify users of breaking changes

3. **Communication**
   - Email users about major updates
   - Document changes in changelog
   - Provide migration guides for breaking changes

---

## Common Issues & Solutions

### Issue: "App name already exists"
**Solution**: Choose a different name or add suffix
```bash
npx zapier register "Anakin API v2"
```

### Issue: "Build failed"
**Solution**: Check validation errors
```bash
npx zapier validate
npx zapier build --debug
```

### Issue: "Authentication test failed"
**Solution**: 
- Verify API credentials
- Check base URL is correct
- Test API endpoint manually with curl

### Issue: "Polling timeout"
**Solution**:
- Increase `maxWaitTime` in action config
- Optimize polling interval
- Check API response times

### Issue: "Cannot push new version"
**Solution**:
```bash
# Check current versions
npx zapier versions

# Update version in package.json
# Must be higher than existing versions
```

---

## Quick Reference Commands

```bash
# Login
zapier login

# Register new app
zapier register "App Name"

# Deploy/update
zapier push

# List versions
zapier versions

# Test locally
zapier test

# Validate app
zapier validate

# Invite user
zapier invite user@example.com

# View history
zapier history

# Migrate users
zapier migrate OLD_VERSION NEW_VERSION PERCENT

# Get help
zapier help
```

---

## Resources

- 📚 [Zapier Platform Docs](https://platform.zapier.com/)
- 🛠 [CLI Reference](https://github.com/zapier/zapier-platform/blob/main/packages/cli/README.md)
- 💬 [Community Forum](https://community.zapier.com/developer-discussion-13)
- 📖 [API Best Practices](https://platform.zapier.com/partners/planning-guide)
- 🎓 [Video Tutorials](https://zapier.com/developer/tutorials)

## Support

Need help? Contact:
- Email: anakin@anakininc.com
- GitHub Issues: [anakin-zapier/issues](https://github.com/Anakin-Inc/anakin-zapier/issues)
- Zapier Support: support@zapier.com

---

**Good luck with your deployment! 🚀**
