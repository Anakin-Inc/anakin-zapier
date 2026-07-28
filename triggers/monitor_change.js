// Monitor Change Trigger
// Polls a monitor's detected changes on Zapier's own polling schedule.
// This is a standard Zapier "polling trigger": `perform` returns an array of
// objects, each with a unique `id` field. Zapier calls it on a schedule it
// manages (as often as every 1-5 minutes depending on plan) and dedupes
// against IDs it has already seen, so no `type: 'hook'` / subscribe-unsubscribe
// pair is needed here.

// Best-effort extraction of a stable per-change id. The exact shape of a
// change record is not pinned down in Anakin's public API docs at the time
// of writing, so this falls back to a composite key when no explicit id
// field is present, to guarantee Zapier can dedupe reliably either way.
const changeId = (monitorId, change, index) => {
  if (change.id) return String(change.id);
  if (change.changeId) return String(change.changeId);
  const timestamp = change.detectedAt || change.checkedAt || change.timestamp || change.createdAt;
  if (timestamp) return `${monitorId}-${timestamp}`;
  return `${monitorId}-${index}`;
};

// Best-effort chronological sort, newest first (Zapier's documented
// convention for polling triggers). Falls back to the API's original order
// when no recognizable timestamp field is present.
const sortNewestFirst = (changes) => {
  const withDates = changes.map((c) => {
    const raw = c.detectedAt || c.checkedAt || c.timestamp || c.createdAt;
    const ts = raw ? Date.parse(raw) : NaN;
    return { c, ts };
  });

  if (withDates.some(({ ts }) => Number.isNaN(ts))) {
    // Not every record has a parseable timestamp - preserve API order rather
    // than risk an incorrect sort.
    return changes;
  }

  return withDates.sort((a, b) => b.ts - a.ts).map(({ c }) => c);
};

const perform = async (z, bundle) => {
  const { monitorId } = bundle.inputData;

  if (!monitorId || monitorId.trim() === '') {
    throw new Error('Monitor ID is required');
  }

  z.console.log(`Polling changes for monitor: ${monitorId}`);

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/monitors/${encodeURIComponent(monitorId.trim())}/changes`,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;
  const rawChanges = Array.isArray(data) ? data : (data.changes || data.items || []);

  z.console.log(`Found ${rawChanges.length} change record(s) for monitor: ${monitorId}`);

  const ordered = sortNewestFirst(rawChanges);

  return ordered.map((change, index) => ({
    id: changeId(monitorId.trim(), change, index),
    monitorId: monitorId.trim(),
    ...change,
  }));
};

module.exports = {
  key: 'monitor_change',
  noun: 'Monitor Change',
  display: {
    label: 'New Monitor Change',
    description: 'Triggers when a website monitor detects a change - a diff/summary of what changed since the previous check (with the AI change summary when the monitor\'s AI Mode is on). Create the monitor first with the Create Monitor action, then find its ID with List Monitors.',
  },

  operation: {
    perform: perform,

    inputFields: [
      {
        key: 'monitorId',
        label: 'Monitor ID',
        type: 'string',
        required: true,
        helpText: 'The monitor to watch for changes (from the Create Monitor action or List Monitors).',
      },
    ],

    sample: {
      id: 'monitor_123456-2026-07-27T14:00:00Z',
      monitorId: 'monitor_123456',
      detectedAt: '2026-07-27T14:00:00Z',
      summary: 'Price dropped from $49.99 to $39.99',
      diff: '- Price: $49.99\n+ Price: $39.99',
    },

    outputFields: [
      { key: 'id', label: 'Change ID', type: 'string' },
      { key: 'monitorId', label: 'Monitor ID', type: 'string' },
      { key: 'detectedAt', label: 'Detected At', type: 'string' },
      { key: 'summary', label: 'Summary', type: 'text' },
      { key: 'diff', label: 'Diff', type: 'text' },
    ],
  },
};
