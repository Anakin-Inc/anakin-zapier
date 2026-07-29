// Run Wire Write Action
// Executes a state-changing Wire action (async with polling; some actions return inline)
// WARNING: Write actions perform real interactions on the target site (form
// submits, cart adds, account updates) and cannot be undone by this integration.

const { sleep } = require('../utils/helpers');

// Poll the Wire job for completion
const pollForCompletion = async (z, bundle, jobId, maxWaitTime = 300000, pollInterval = 3000) => {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < maxWaitTime) {
    attempts++;

    if (attempts > 1) {
      await sleep(pollInterval);
    }

    z.console.log(`Checking status (attempt ${attempts}) for Wire job ID: ${jobId}`);

    const response = await z.request({
      url: `${bundle.authData.baseUrl}/v1/wire/jobs/${jobId}`,
      method: 'GET',
      headers: {
        'X-API-Key': bundle.authData.apiKey,
      },
    });

    const statusData = response.data;
    const status = statusData.status;

    z.console.log(`Current status: ${status}`);

    if (status === 'completed') {
      z.console.log(`Wire job completed successfully for job ID: ${jobId}`);
      return {
        success: true,
        operation: 'runWireWriteAction',
        job_id: jobId,
        ...statusData,
      };
    }

    if (status === 'failed') {
      const errorMessage = (statusData.error && (statusData.error.message || statusData.error.code)) || 'Unknown error occurred';
      throw new Error(`Wire job failed: ${errorMessage}`);
    }

    z.console.log(`Wire job still processing... (${status})`);
  }

  throw new Error(`Job did not complete within ${maxWaitTime / 1000} seconds`);
};

// Main perform function
const perform = async (z, bundle) => {
  const {
    actionId,
    params,
    credentialId,
    identityId,
    maxWaitTime = 300,
    pollInterval = 3,
  } = bundle.inputData;

  if (!actionId || actionId.trim() === '') {
    throw new Error('Action ID is required');
  }

  let parsedParams = {};
  if (params && String(params).trim() !== '') {
    try {
      parsedParams = JSON.parse(params);
    } catch (e) {
      throw new Error(`Invalid JSON in Params field: ${e.message}`);
    }
  }

  z.console.log(`Running Wire write action: ${actionId}`);

  const body = { action_id: actionId.trim() };
  if (parsedParams && Object.keys(parsedParams).length > 0) {
    body.params = parsedParams;
  }
  if (credentialId) body.credential_id = credentialId;
  if (identityId) body.identity_id = identityId;

  const submitResponse = await z.request({
    url: `${bundle.authData.baseUrl}/v1/wire/task`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body,
  });

  const submitData = submitResponse.data;
  const jobId = submitData.job_id;

  // Sync action: terminal data came back inline, no job to poll.
  if (!jobId) {
    z.console.log('Wire action completed synchronously (no job ID returned)');
    return {
      success: true,
      operation: 'runWireWriteAction',
      action_id: actionId.trim(),
      ...submitData,
    };
  }

  z.console.log(`Wire job submitted successfully. Job ID: ${jobId}`);

  const result = await pollForCompletion(
    z,
    bundle,
    jobId,
    maxWaitTime * 1000,
    pollInterval * 1000
  );

  return { action_id: actionId.trim(), ...result };
};

module.exports = {
  key: 'run_wire_write_action',
  noun: 'Wire Write Result',
  display: {
    label: 'Run Wire Write Action',
    description: 'Runs a Wire WRITE action - one that performs a state-changing interaction on the target site (submit a form, add an item to a cart, post content, update account settings). Discover action_ids with Discover Wire Actions or Browse Wire Catalog first. Most write actions need auth - pass a Credential ID. Does not execute payments or transfer funds; such actions are refused by the API.',
  },

  operation: {
    inputFields: [
      {
        key: 'actionId',
        label: 'Action ID',
        type: 'string',
        required: true,
        helpText: 'The Wire action to run, from Discover Wire Actions or Browse Wire Catalog (e.g. "amazon.add_to_cart"). Confirm its type is "write".',
      },
      {
        key: 'params',
        label: 'Params (JSON)',
        type: 'text',
        required: false,
        helpText: 'The action\'s input parameters as a raw JSON object, e.g. {"product_id": "B08N5WRWNW", "quantity": 1}. Shape depends on the action - use its parameter schema from discovery. Leave blank for actions that take none.',
      },
      {
        key: 'credentialId',
        label: 'Credential ID',
        type: 'string',
        required: false,
        helpText: 'Required when the action\'s auth_mode is "required"; honored when "optional"; ignored when "none". Get one from List Wire Identities or Wire Login.',
      },
      {
        key: 'identityId',
        label: 'Identity ID',
        type: 'string',
        required: false,
        helpText: 'Optional identity selector - the server resolves a credential from it (alternative to Credential ID).',
      },
      {
        key: 'maxWaitTime',
        label: 'Max Wait Time (seconds)',
        type: 'integer',
        default: '300',
        required: false,
        helpText: 'Maximum time to wait for an asynchronous action to complete. Default is 300 seconds.',
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
      operation: 'runWireWriteAction',
      action_id: 'amazon.add_to_cart',
      job_id: 'wjob_654321',
      status: 'completed',
      data: {
        cart_total: 1,
      },
      credits_used: 2,
      execution_ms: 3100,
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'action_id', label: 'Action ID', type: 'string' },
      { key: 'job_id', label: 'Job ID', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'data', label: 'Data', type: 'string' },
      { key: 'credits_used', label: 'Credits Used', type: 'number' },
      { key: 'execution_ms', label: 'Execution Time (ms)', type: 'integer' },
    ],
  },
};
