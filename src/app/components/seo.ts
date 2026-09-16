import {Injectable, inject} from '@angular/core';
import {Title, Meta} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class Seo {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  setMetaTags(title: string, description: string, keywords: string[] = []) {
    const fullTitle = `${title} | Creaciones Golondrina - Ropa Típica Yucateca`;
    this.titleService.setTitle(fullTitle);

    // Meta tags update
    this.metaService.updateTag({name: 'description', content: description});
    this.metaService.updateTag({name: 'keywords', content: keywords.join(', ') || 'guayaberas, ropa típica yucateca, vestidos bordados, Tekit, Yucatán, Creaciones Golondrina'});
    
    // Open Graph / SEO
    this.metaService.updateTag({property: 'og:title', content: fullTitle});
    this.metaService.updateTag({property: 'og:description', content: description});
    this.metaService.updateTag({property: 'og:type', content: 'website'});
    this.metaService.updateTag({property: 'og:image', content: 'https://assets.sm-panel.site/gallery/creacionesgolondrina/logo_creaciones_golondrina.jpeg'});

    // Twitter Card
    this.metaService.updateTag({name: 'twitter:card', content: 'summary_large_image'});
    this.metaService.updateTag({name: 'twitter:title', content: fullTitle});
    this.metaService.updateTag({name: 'twitter:description', content: description});

    // Structured JSON-LD Data for local business
    this.removeExistingJsonLd();
    this.insertJsonLd({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'Creaciones Golondrina',
      'image': 'https://assets.sm-panel.site/gallery/creacionesgolondrina/tienda_frente.jpeg',
      'telephone': '+52 9971141825',
      'email': 'creacionesgolondrina54@gmail.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'C 31 x 18 y 20 col San Rafael',
        'addressLocality': 'Tekit',
        'addressRegion': 'Yucatán',
        'postalCode': '97680',
        'addressCountry': 'MX',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '20.5361',
        'longitude': '-89.2828',
      },
      'url': 'https://creacionesgolondrina.com',
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '10:00',
          'closes': '17:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Saturday', 'Sunday'],
          'opens': '09:00',
          'closes': '18:00',
        },
      ],
      'founder': {
        '@type': 'Person',
        'name': 'Martha María Puc Loeza',
      },
    });
  }

  setProductMeta(product: {name: string; description: string; price: number; image: string; category: string}) {
    const fullTitle = `${product.name} | Ropa Típica Yucateca | Creaciones Golondrina`;
    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({name: 'description', content: product.description});
    this.metaService.updateTag({property: 'og:title', content: fullTitle});
    this.metaService.updateTag({property: 'og:description', content: product.description});
    this.metaService.updateTag({property: 'og:image', content: product.image});

    this.removeExistingJsonLd();
    this.insertJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': product.image,
      'description': product.description,
      'category': product.category,
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'MXN',
        'price': product.price,
        'availability': 'https://schema.org/InStock',
        'seller': {
          '@type': 'LocalBusiness',
          'name': 'Creaciones Golondrina',
        },
      },
    });
  }

  private removeExistingJsonLd() {
    if (typeof document !== 'undefined') {
      const existing = document.getElementById('json-ld-seo');
      if (existing) {
        existing.remove();
      }
    }
  }

  private insertJsonLd(data: object) {
    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.id = 'json-ld-seo';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    }
  }
}
