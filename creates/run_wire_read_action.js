// Run Wire Read Action
// Executes a read-only (data-extraction) Wire action (async with polling; some actions return inline)

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
        operation: 'runWireReadAction',
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

  z.console.log(`Running Wire read action: ${actionId}`);

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
      operation: 'runWireReadAction',
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
  key: 'run_wire_read_action',
  noun: 'Wire Read Result',
  display: {
    label: 'Run Wire Read Action',
    description: 'Runs a Wire READ action - one that extracts data without changing state on the target site (search listings, fetch product data, read a profile, pull dashboard metrics). Discover action_ids with Discover Wire Actions or Browse Wire Catalog first. Transparently polls until complete when the action is asynchronous.',
  },

  operation: {
    inputFields: [
      {
        key: 'actionId',
        label: 'Action ID',
        type: 'string',
        required: true,
        helpText: 'The Wire action to run, from Discover Wire Actions or Browse Wire Catalog (e.g. "walmart.search_products"). Confirm its type is "read".',
      },
      {
        key: 'params',
        label: 'Params (JSON)',
        type: 'text',
        required: false,
        helpText: 'The action\'s input parameters as a raw JSON object, e.g. {"query": "wireless earbuds"}. Shape depends on the action - use its parameter schema from discovery. Leave blank for actions that take none.',
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
      operation: 'runWireReadAction',
      action_id: 'walmart.search_products',
      job_id: 'wjob_123456',
      status: 'completed',
      data: {
        products: [
          { title: 'Example Product', price: 19.99, url: 'https://walmart.com/ip/example' },
        ],
      },
      credits_used: 1,
      execution_ms: 2400,
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
