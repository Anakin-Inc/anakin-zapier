## 1.2.0

Extends Anakin's Zapier integration from 3 of 21 API capabilities to the full 21/21.

1. New action! create/map_site — discover a site's URL structure before crawling.
2. New action! create/crawl_site — bulk markdown extraction across many pages of a site.
3. New action! create/discover_wire_actions — find pre-built Wire actions for a site.
4. New action! create/browse_wire_catalog — list available Wire actions for a specific catalog.
5. New action! create/run_wire_read_action — run a read-only Wire action (e.g. price, listing, profile data).
6. New action! create/run_wire_write_action — run a state-changing Wire action (e.g. submit a form, add to cart).
7. New action! create/list_wire_identities — list saved identities available for a Wire catalog.
8. New action! create/wire_login — authenticate a new identity against a Wire catalog.
9. New action! create/request_wire_action — request a new Wire action be built for a site not yet covered.
10. New action! create/create_monitor — create a scheduled monitor that watches a page, site, or Wire action for changes.
11. New action! create/list_monitors — list existing monitors.
12. New action! create/control_monitor — pause, resume, run now, or delete a monitor.
13. New action! create/list_ai_visibility_sources — list available AI answer engines for AI Visibility.
14. New action! create/search_ai_visibility — ask multiple AI answer engines the same question and compare responses.
15. New action! create/list_sessions — list saved browser sessions.
16. New action! create/delete_session — delete a saved browser session.
17. New action! create/run_browser_task — drive a real cloud browser through a multi-step task via natural language.
18. New trigger! trigger/monitor_change — polling trigger that fires when a monitored page, site, or Wire action detects a change.

Existing actions (create/extract_website_data, create/search, create/start_agentic_search, create/get_agentic_search_results) are unchanged.

## 1.1.0

* Update create/extract_website_data and related actions to use "extract data" terminology instead of "scrape" throughout the integration.
* Fix naming convention issue in Zapier action/field keys.
* Add an X-Source: zapier header to all outgoing API requests for usage tracking.
* Clean up repo structure (removed unrelated n8n/docs/tests directories, flattened project layout).

## 1.0.0

Initial release to public. Three actions: create/extract_website_data (scrape a URL to markdown/JSON), create/search (AI web search), and create/start_agentic_search + create/get_agentic_search_results (multi-source deep research, submit + poll).
