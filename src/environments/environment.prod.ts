export const environment = {
  production: true,
  // Validation package: npm run build uses this file via Angular fileReplacements.
  // Keep it aligned with the requested dev GuayaFlow API until production cutover.
  apiUrl: 'https://dev-api-nacx.guayaflow.com/api',
  tenant: 'cgolondrinas_gf',
  whatsappNumber: '529971141825',
  useMock: false,

  // Static storefront imagery. Catalog/product imagery remains API-driven.
  brandImages: {
    logo: 'https://assets.sm-panel.site/gallery/creacionesgolondrina/logo_creaciones_golondrina.jpeg',
    homeHero: 'https://assets.sm-panel.site/gallery/creacionesgolondrina/tienda_frente.jpeg',
    founder: 'https://assets.sm-panel.site/gallery/creacionesgolondrina/marta_puc_fundadora.jpeg',
  },

  // Status uses cache/TTL; catalog refreshes only on explicit commercial events.
  ecommerceStatusTtlMs: 300000,
  ecommerceStatusRetryMs: 30000,
};
