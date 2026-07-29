# Anakin + Slack — scheduled AI research digest

Post an AI-researched answer to a Slack channel on a schedule — a standing
"what's new in X" digest with no polling loop for the user to build.

## Zapier

1. **Trigger:** Schedule by Zapier — Every Day (or week)
2. **Action:** Anakin — Perform AI Search. `searchQuery`: a fixed or
   Zapier-formatted question, e.g. "What's new in {{topic}} this week?"
3. **Action:** Slack — Send Channel Message. Message text maps the search
   action's answer + citation fields.

## Make

```
Schedule → Anakin (Search) → Slack (Create Message)
```

1. **Schedule** — daily/weekly trigger
2. **Anakin Search** — same query as above
3. **Slack Create Message** — post the result to a channel

## Variant: page-change digest instead of open research

Swap step 2 for **Extract Website Data** against a fixed URL and add a
**Filter** step (Zapier) / router (Make) that only continues if the
`markdown` output differs from last run — turns this into a "notify Slack
when this page changes" recipe using the same two building blocks already
documented as the "Daily product monitoring" example in
`../zapier-integration/WEBHOOK_TO_SCRAPER_GUIDE.md`'s sibling docs page.

## Template listing copy

**Title:** AI research digest to Slack
**Description:** Get an AI-researched answer to a standing question posted
to a Slack channel every day or week — powered by Anakin's AI search with
citations.
