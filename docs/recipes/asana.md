# Anakin + Asana — auto-research a new task

Same shape as the ClickUp recipe, for teams standardized on Asana instead.

## Zapier

1. **Trigger:** Asana — New Task (in a specific project, e.g. "Research
   requests")
2. **Action:** Anakin — Start Agentic Search. `searchPrompt`: the task name
   or description.
3. **Action:** Delay by Zapier — Wait 3–5 minutes.
4. **Action:** Anakin — Get Agentic Search Results. `jobId`: from step 2.
5. **Action:** Asana — Create Comment on the task, with the research
   summary and sources.

## Make

```
Asana (Watch Tasks) → Anakin (AgenticSearch) → Delay → Anakin (DataPoller) → Asana (Add Comment)
```

Mirrors the "Research and email a report" example already documented for
Make, swapping the Gmail step for an Asana comment.

## Variant: specific URL instead of open research

If the task is "review this competitor's page" rather than open-ended, swap
steps 2–4 for a single **Extract Website Data** call against a URL pulled
from the task description — synchronous, no delay/polling needed.

## Template listing copy

**Title:** Auto-research Asana tasks
**Description:** New research task in Asana → Anakin researches it → the
summary lands back as a comment, sources included.
