# Anakin + Discord — page-change alert

Watch a page (pricing, changelog, competitor announcement) and post to a
Discord channel only when it actually changes — no manual re-checking.

## Zapier

1. **Trigger:** Schedule by Zapier — Every Hour/Day
2. **Action:** Anakin — Extract Website Data. `url`: the page to watch,
   `forceFresh`: true so it doesn't serve a stale cache.
3. **Action:** Storage by Zapier (or Google Sheets — Update Row) — save the
   current `markdown` so the next run can diff against it.
4. **Action:** Filter by Zapier — only continue if this run's `markdown`
   differs from the stored value.
5. **Action:** Discord — Send Channel Message, with the new content and a
   link to the page.

## Make

```
Schedule → Anakin (UniversalDataExtractor) → Data Store (compare) → Router → Discord (Create Message)
```

Make's built-in Data Store module handles the "did this change since last
run" comparison natively, avoiding the extra Sheets/Storage hop Zapier needs.

## Template listing copy

**Title:** Page-change alerts to Discord
**Description:** Watch any page on a schedule and get a Discord message only
when it actually changes — built on Anakin's website extraction.
