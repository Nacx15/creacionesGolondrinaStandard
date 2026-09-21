export const environment = {
  production: true,
  // Validation package: npm run build uses this file via Angular fileReplacements.
  // Keep it aligned with the requested dev GuayaFlow API until production cutover.
  apiUrl: 'https://dev-api-nacx.guayaflow.com/api',
  tenant: 'cgolondrinas_gf',
  whatsappNumber: '529971141825',
  useMock: false,

  // Status uses cache/TTL; catalog refreshes only on explicit commercial events.
  ecommerceStatusTtlMs: 300000,
  ecommerceStatusRetryMs: 30000,
};
