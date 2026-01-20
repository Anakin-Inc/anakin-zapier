# Quick Start Guide

Get your Anakin Zapier integration up and running in 10 minutes!

## 🚀 Quick Setup (3 steps)

### 1. Install Dependencies

```bash
cd anakin-zapier-app
npm install
```

### 2. Add Your API Key

Create a `.env` file:

```bash
# Create .env file
cat > .env << EOF
API_KEY=your_anakin_api_key_here
BASE_URL=https://api.anakin.io
EOF
```

Or create manually:
- Create file named `.env` in the project root
- Add your credentials:
  ```
  API_KEY=sk_your_api_key
  BASE_URL=https://api.anakin.io
  ```

### 3. Deploy to Zapier

```bash
# Login to Zapier (opens browser)
npx zapier login

# Register your app (only first time)
npx zapier register "Anakin"

# Push to Zapier
npx zapier push
```

Done! 🎉

---

## 🧪 Quick Test

Test your integration locally:

```bash
# Test everything
npm test

# Test just authentication
npx zapier test authentication.test.js
```

---

## 🎯 Use in Zapier

1. Go to [zapier.com/app/zaps](https://zapier.com/app/zaps)
2. Click **Create Zap**
3. Search for your app name (e.g., "Anakin")
4. Connect your account with API key
5. Choose an action:
   - **AI Search** - Quick AI-powered search
   - **Scrape URL** - Extract data from websites
   - **Agentic Search** - Advanced AI pipeline
6. Test and turn on! ✅

---

## 📝 Example Zaps

### Example 1: Daily AI Research
**Trigger**: Schedule (every day at 9 AM)  
**Action**: Anakin > AI Search  
**Input**: "Latest news in AI"  
**Result**: Get daily AI news summary

### Example 2: Website Monitoring
**Trigger**: Schedule (every hour)  
**Action**: Anakin > Scrape URL  
**Input**: Your competitor's pricing page  
**Result**: Track price changes automatically

### Example 3: Market Research
**Trigger**: New row in Google Sheets  
**Action**: Anakin > Agentic Search  
**Input**: Company name from sheet  
**Result**: Get structured company data

---

## 🆘 Troubleshooting

### Can't login to Zapier CLI?
```bash
# Try with explicit browser
zapier login --browser=chrome
```

### App name already taken?
```bash
# Use a variation
npx zapier register "Anakin API"
# or
npx zapier register "Anakin Scraper"
```

### Tests failing?
- Check your API key in `.env`
- Verify internet connection
- Make sure API endpoint is accessible

### Build errors?
```bash
# Validate your code
npx zapier validate

# Check for issues
npx zapier build --debug
```

---

## 📚 Next Steps

1. ✅ **Test all actions** in Zapier UI
2. ✅ **Invite beta users**: `npx zapier invite user@email.com`
3. ✅ **Monitor usage**: Check Developer Dashboard
4. ✅ **Submit for review**: Make it public!

---

## 🔗 Quick Links

- 📖 [Full README](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 💻 [Developer Dashboard](https://zapier.com/app/developer)
- 📚 [Zapier Platform Docs](https://platform.zapier.com/)

---

**Need help?** Email: anakin@anakininc.com

Happy Zapping! ⚡
