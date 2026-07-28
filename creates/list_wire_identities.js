// List Wire Identities
// Lists saved Wire identities and their credentials (synchronous)

const perform = async (z, bundle) => {
  const { catalogId } = bundle.inputData;

  z.console.log(`Listing Wire identities${catalogId ? ` for catalog: ${catalogId}` : ''}`);

  let url = `${bundle.authData.baseUrl}/v1/wire/identities`;
  if (catalogId) {
    url += `?catalog_id=${encodeURIComponent(catalogId)}`;
  }

  const response = await z.request({
    url,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log('Wire identities fetched successfully');

  return {
    success: true,
    operation: 'listWireIdentities',
    catalogId: catalogId || null,
    identities: data,
  };
};

module.exports = {
  key: 'list_wire_identities',
  noun: 'Wire Identity',
  display: {
    label: 'List Wire Identities',
    description: 'Lists your saved Wire identities and their credentials. An identity is a named account on a site; each credential\'s id is the Credential ID you pass to Run Wire Read/Write Action for actions whose auth_mode is "required". Optionally filter by catalog.',
  },

  operation: {
    inputFields: [
      {
        key: 'catalogId',
        label: 'Catalog ID',
        type: 'string',
        required: false,
        helpText: 'Optional - restrict to identities for a single catalog.',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'listWireIdentities',
      catalogId: null,
      identities: [
        {
          id: 'identity_123',
          catalog_slug: 'amazon',
          name: 'Personal Amazon',
          credentials: [
            { id: 'cred_456', status: 'active' },
          ],
        },
      ],
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'catalogId', label: 'Catalog ID', type: 'string' },
      { key: 'identities', label: 'Identities', type: 'string' },
    ],
  },
};
