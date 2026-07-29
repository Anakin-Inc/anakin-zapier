// Run Browser Task
// Runs a natural-language task in a real cloud browser driven by an AI agent (async with polling)
//
// Note: this deliberately does NOT expose a secret/credential-injection field.
// Secrets passed through a Zap are compromised by definition (they enter the
// task history); for authenticated tasks pass a Session ID from the
// List Sessions action instead.

const { sleep } = require('../utils/helpers');

// Poll for job completion
const pollForCompletion = async (z, bundle, workflowId, maxWaitTime = 360000, pollInterval = 3000) => {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < maxWaitTime) {
    attempts++;

    if (attempts > 1) {
      await sleep(pollInterval);
    }

    z.console.log(`Checking status (attempt ${attempts}) for browser task workflow ID: ${workflowId}`);

    const response = await z.request({
      url: `${bundle.authData.baseUrl}/v1/ai/jobs/${workflowId}`,
      method: 'GET',
      headers: {
        'X-API-Key': bundle.authData.apiKey,
      },
    });

    const statusData = response.data;
    const status = statusData.status;

    z.console.log(`Current status: ${status}`);

    if (status === 'completed') {
      z.console.log(`Browser task completed successfully for workflow ID: ${workflowId}`);
      const result = statusData.result || statusData;
      return {
        success: true,
        operation: 'runBrowserTask',
        workflow_id: workflowId,
        run_id: statusData.run_id || result.run_id,
        ...result,
      };
    }

    if (status === 'failed' || status === 'timed_out') {
      const errorMessage = statusData.error || 'Unknown error occurred';
      throw new Error(`Browser task ${status}: ${errorMessage}`);
    }

    z.console.log(`Browser task still running... (${status})`);
  }

  throw new Error(`Browser task did not complete within ${maxWaitTime / 1000} seconds`);
};

// Main perform function
const perform = async (z, bundle) => {
  const {
    prompt,
    url,
    sessionId,
    maxSteps,
    timeoutMs,
    outputSchema,
    maxWaitTime = 360,
    pollInterval = 3,
  } = bundle.inputData;

  if (!prompt || prompt.trim() === '') {
    throw new Error('Prompt is required');
  }

  let parsedOutputSchema;
  if (outputSchema && String(outputSchema).trim() !== '') {
    try {
      parsedOutputSchema = JSON.parse(outputSchema);
    } catch (e) {
      throw new Error(`Invalid JSON in Output Schema field: ${e.message}`);
    }
  }

  z.console.log(`Submitting browser task: ${prompt}`);

  const body = {
    prompt: prompt.trim(),
    async: true,
  };
  if (url) body.url = url;
  if (sessionId) body.session_id = sessionId;
  if (maxSteps) body.max_steps = maxSteps;
  if (timeoutMs) body.timeout_ms = timeoutMs;
  if (parsedOutputSchema) body.output_schema = parsedOutputSchema;

  const submitResponse = await z.request({
    url: `${bundle.authData.baseUrl}/v1/ai/evaluate`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body,
  });

  const submitData = submitResponse.data;
  const workflowId = submitData.workflow_id;

  if (!workflowId) {
    // Service answered synchronously (shouldn't normally happen with async: true).
    z.console.log('Browser task completed synchronously (no workflow ID returned)');
    return {
      success: true,
      operation: 'runBrowserTask',
      ...submitData,
    };
  }

  z.console.log(`Browser task submitted successfully. Workflow ID: ${workflowId}`);

  const result = await pollForCompletion(
    z,
    bundle,
    workflowId,
    maxWaitTime * 1000,
    pollInterval * 1000
  );

  return result;
};

module.exports = {
  key: 'run_browser_task',
  noun: 'Browser Task Result',
  display: {
    label: 'Run Browser Task',
    description: 'Runs a natural-language task in a real cloud browser driven by an AI agent: it navigates, clicks, types, scrolls, and extracts on your behalf. Use when Extract Website Data can\'t do the job (multi-step flows, interactions, complex navigation) and no Wire action covers the site. For login-protected tasks pass a Session ID from List Sessions - never put passwords in the prompt. Supply an Output Schema to get structured JSON back.',
  },

  operation: {
    inputFields: [
      {
        key: 'prompt',
        label: 'Prompt',
        type: 'text',
        required: true,
        helpText: 'The task in natural language. Be specific about the goal and what to return. Never include passwords or secrets - use Session ID for authenticated sites.',
      },
      {
        key: 'url',
        label: 'Starting URL',
        type: 'string',
        required: false,
        helpText: 'Navigate here before starting. Leave blank to let the agent follow URLs named in the prompt.',
      },
      {
        key: 'sessionId',
        label: 'Session ID',
        type: 'string',
        required: false,
        helpText: 'Saved browser-session ID (from the List Sessions action) so the task runs logged in.',
      },
      {
        key: 'maxSteps',
        label: 'Max Steps',
        type: 'integer',
        required: false,
        helpText: 'Cap on agent steps (navigation/click/type actions).',
      },
      {
        key: 'timeoutMs',
        label: 'Timeout (ms)',
        type: 'integer',
        required: false,
        helpText: 'Task timeout in milliseconds (server caps runs at roughly 330 seconds regardless).',
      },
      {
        key: 'outputSchema',
        label: 'Output Schema (JSON)',
        type: 'text',
        required: false,
        helpText: 'JSON Schema for the result as a raw JSON object - the agent returns structured data conforming to it.',
      },
      {
        key: 'maxWaitTime',
        label: 'Max Wait Time (seconds)',
        type: 'integer',
        default: '360',
        required: false,
        helpText: 'Maximum time this Zap step waits for the task to complete. Default is 360 seconds (the server itself hard-caps a run at roughly 330 seconds).',
      },
      {
        key: 'pollInterval',
        label: 'Poll Interval (seconds)',
        type: 'integer',
        default: '3',
        required: false,
        helpText: 'Time between status checks in seconds. Default is 3 seconds.',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'runBrowserTask',
      workflow_id: 'wf_123456',
      run_id: 'run_789',
      result: 'The cheapest 65-inch TV found was...',
      steps_taken: 12,
      duration_ms: 45000,
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'workflow_id', label: 'Workflow ID', type: 'string' },
      { key: 'run_id', label: 'Run ID', type: 'string' },
      { key: 'result', label: 'Result', type: 'string' },
      { key: 'steps_taken', label: 'Steps Taken', type: 'integer' },
      { key: 'duration_ms', label: 'Duration (ms)', type: 'integer' },
    ],
  },
};
