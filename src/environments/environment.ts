export const environment = {
  production: false,
  apiUrl: 'https://dev-api-nacx.guayaflow.com/api',
  tenant: 'alum',
  whatsappNumber: '529971141825',
  useMock: false,

  // Status uses cache/TTL; catalog refreshes only on explicit commercial events.
  ecommerceStatusTtlMs: 300000,      // 5 min cache while active.
  ecommerceStatusRetryMs: 30000,     // Retry sooner when GuayaFlow was unavailable.
};
