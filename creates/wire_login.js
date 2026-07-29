// Wire Login
// Signs in to a credentials-mode Wire site and returns a credential_id (synchronous)

const perform = async (z, bundle) => {
  const { catalogSlug, params, identityName, sourceId, sourceRef } = bundle.inputData;

  if (!catalogSlug || catalogSlug.trim() === '') {
    throw new Error('Catalog Slug is required');
  }

  let parsedParams;
  if (params && String(params).trim() !== '') {
    try {
      parsedParams = JSON.parse(params);
    } catch (e) {
      throw new Error(`Invalid JSON in Params field: ${e.message}`);
    }
  }

  let parsedSourceRef;
  if (sourceRef && String(sourceRef).trim() !== '') {
    try {
      parsedSourceRef = JSON.parse(sourceRef);
    } catch (e) {
      throw new Error(`Invalid JSON in Source Ref field: ${e.message}`);
    }
  }

  z.console.log(`Signing in to Wire catalog: ${catalogSlug}`);

  const body = { catalog_slug: catalogSlug.trim() };
  if (parsedParams) body.params = parsedParams;
  if (identityName) body.identity_name = identityName;
  if (sourceId) body.source_id = sourceId;
  if (parsedSourceRef) body.source_ref = parsedSourceRef;

  const response = await z.request({
    url: `${bundle.authData.baseUrl}/v1/wire/login`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.apiKey,
    },
    body,
  });

  const data = response.data;

  z.console.log('Wire login completed successfully');

  return {
    success: true,
    operation: 'wireLogin',
    catalog_slug: catalogSlug.trim(),
    ...data,
  };
};

module.exports = {
  key: 'wire_login',
  noun: 'Wire Login',
  display: {
    label: 'Sign in to a Wire Site',
    description: 'Signs in to a credentials-mode Wire site and returns a credential_id usable immediately with Run Wire Read/Write Action. Provide the catalog slug and login params (the fields that catalog\'s login schema defines, e.g. email/password - see Browse Wire Catalog\'s login_input_schema). The password is never stored, only the encrypted session. Only needed for actions whose auth_mode is "required" and for catalogs that support password sign-in.',
  },

  operation: {
    inputFields: [
      {
        key: 'catalogSlug',
        label: 'Catalog Slug',
        type: 'string',
        required: true,
        helpText: 'The catalog to sign in to (e.g. "neb").',
      },
      {
        key: 'params',
        label: 'Login Params (JSON)',
        type: 'text',
        required: false,
        helpText: 'Login fields defined by the catalog as a raw JSON object, e.g. {"email": "you@example.com", "password": "..."}. Use Browse Wire Catalog\'s login_input_schema to learn the field names.',
      },
      {
        key: 'identityName',
        label: 'Identity Name',
        type: 'string',
        required: false,
        helpText: 'Optional name for the identity. Derived from params in password mode; required when using a 1Password locator.',
      },
      {
        key: 'sourceId',
        label: 'Source ID',
        type: 'string',
        required: false,
        helpText: 'Optional 1Password identity-source ID (alternative to Login Params).',
      },
      {
        key: 'sourceRef',
        label: 'Source Ref (JSON)',
        type: 'text',
        required: false,
        helpText: 'Optional 1Password item locator as a raw JSON object, e.g. {"vault_id": "...", "item_id": "...", "fields": {...}} (use with Source ID instead of Login Params).',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'wireLogin',
      catalog_slug: 'neb',
      credential_id: 'cred_789',
      identity_id: 'identity_456',
      status: 'active',
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'catalog_slug', label: 'Catalog Slug', type: 'string' },
      { key: 'credential_id', label: 'Credential ID', type: 'string' },
      { key: 'identity_id', label: 'Identity ID', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
    ],
  },
};
