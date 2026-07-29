# Anakin + ClickUp — auto-research a task's linked URL

For research/competitive-intel tasks that start as "go look at this URL and
summarize it" — do the summarizing automatically the moment the task is
created.

## Zapier

1. **Trigger:** ClickUp — New Task (in a specific list, e.g. "Research")
2. **Action:** Anakin — Extract Website Data. `url`: mapped from a custom
   field or the task description's first URL.
3. **Action:** ClickUp — Update Task (or Create Comment) — write the
   `markdown` summary and `generatedJson` back onto the task.

## Make

```
ClickUp (Watch Tasks) → Anakin (UniversalDataExtractor) → ClickUp (Update Task / Create Comment)
```

## Variant: open-ended research instead of a specific URL

Swap the Anakin action for **Start Agentic Search** using the task's title
as `searchPrompt`, add a **Delay** (3–5 min), then **Get Agentic Search
Results**, then write the report back — mirrors the "Research pipeline"
example already documented for Zapier.

## Template listing copy

**Title:** Auto-research ClickUp tasks
**Description:** The moment a research task is created, Anakin extracts or
researches the linked URL and writes a summary straight back onto the task.
