// Browse Wire Catalog
// Lists every supported Wire site, or one site's full action list (synchronous)

const perform = async (z, bundle) => {
  const { catalogSlug } = bundle.inputData;

  const path = catalogSlug && catalogSlug.trim() !== ''
    ? `/v1/wire/catalog/${encodeURIComponent(catalogSlug.trim())}`
    : '/v1/wire/catalog';

  z.console.log(`Fetching Wire catalog${catalogSlug ? ` for slug: ${catalogSlug}` : ' (all sites)'}`);

  const response = await z.request({
    url: `${bundle.authData.baseUrl}${path}`,
    method: 'GET',
    headers: {
      'X-API-Key': bundle.authData.apiKey,
    },
  });

  const data = response.data;

  z.console.log('Wire catalog fetched successfully');

  return {
    success: true,
    operation: 'browseWireCatalog',
    catalogSlug: catalogSlug || null,
    catalog: data,
  };
};

module.exports = {
  key: 'browse_wire_catalog',
  noun: 'Wire Catalog',
  display: {
    label: 'Browse Wire Catalog',
    description: 'With no catalog slug, lists every supported Wire website and its action count. Pass a slug (e.g. "walmart", "amazon", "linkedin") to get that site\'s full action list with exact parameter schemas, each action\'s type (read/write), auth mode, and credit cost.',
  },

  operation: {
    inputFields: [
      {
        key: 'catalogSlug',
        label: 'Catalog Slug',
        type: 'string',
        required: false,
        helpText: 'Catalog slug to inspect, e.g. "walmart". Leave blank to list all catalogs.',
      },
    ],

    perform: perform,

    sample: {
      success: true,
      operation: 'browseWireCatalog',
      catalogSlug: 'walmart',
      catalog: {
        slug: 'walmart',
        name: 'Walmart',
        actions: [
          {
            action_id: 'walmart.search_products',
            type: 'read',
            auth_mode: 'none',
            credit_cost: 1,
          },
        ],
      },
    },

    outputFields: [
      { key: 'success', label: 'Success', type: 'boolean' },
      { key: 'operation', label: 'Operation', type: 'string' },
      { key: 'catalogSlug', label: 'Catalog Slug', type: 'string' },
      { key: 'catalog', label: 'Catalog', type: 'string' },
    ],
  },
};
