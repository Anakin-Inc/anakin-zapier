# Zapier / Make recipe templates — Slack, Discord, ClickUp, HubSpot, Asana

These five apps aren't "integrations" in the sense the rest of
`external-integrations/` uses the word — Anakin already reaches all of them
today through the live Zapier app (`zapier.com/apps/anakin`, Beta) and Make's
verified integration (`make.com/integrations/anakin`), which already connect
to 8,000+ and thousands of apps respectively, Slack and HubSpot CRM
explicitly among Make's listed "Popular connections." There's no new API
client to write here — what's missing is a **ready-made template** for each
pairing, so a user finds "Anakin + Slack" instead of having to invent the
Zap/scenario themselves from generic building blocks.

Each file below is a template spec: trigger, steps, field mappings, and the
finished-example copy a Zap/Make template listing needs. **Building the
actual live, clickable template requires the Zapier/Make partner account —
that's a platform action under whoever owns those accounts, not something
this repo change can do.** Reference for the underlying actions these
templates use: `../zapier-integration/WEBHOOK_TO_SCRAPER_GUIDE.md` and the
public docs at `anakin.io/docs/integrations/workflow/{zapier,make}`.

| App | Recipe | File |
|---|---|---|
| Slack | Scheduled AI research digest posted to a channel | [slack.md](slack.md) |
| Discord | Page-change alert posted to a channel | [discord.md](discord.md) |
| ClickUp | Auto-research a task's linked URL, write findings back | [clickup.md](clickup.md) |
| HubSpot | Enrich a new Contact/Company from their website | [hubspot.md](hubspot.md) |
| Asana | Auto-research a new task, comment with a summary | [asana.md](asana.md) |
