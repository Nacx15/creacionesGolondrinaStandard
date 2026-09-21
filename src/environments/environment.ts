export const environment = {
  production: false,
  apiUrl: 'https://dev-api-nacx.guayaflow.com/api',
  tenant: 'alum',
  whatsappNumber: '529971141825',
  useMock: false,

  // Static storefront imagery. Catalog/product imagery remains API-driven.
  brandImages: {
    logo: 'https://assets.sm-panel.site/gallery/creacionesgolondrina/logo_creaciones_golondrina.jpeg',
    homeHero: 'https://assets.sm-panel.site/gallery/creacionesgolondrina/tienda_frente.jpeg',
    founder: 'https://assets.sm-panel.site/gallery/creacionesgolondrina/marta_puc_fundadora.jpeg',
  },

  // Status uses cache/TTL; catalog refreshes only on explicit commercial events.
  ecommerceStatusTtlMs: 300000,      // 5 min cache while active.
  ecommerceStatusRetryMs: 30000,     // Retry sooner when GuayaFlow was unavailable.
};
