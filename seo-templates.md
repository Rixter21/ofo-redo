# SEO Implementation Templates

## Meta Tags Template

```html
<!-- Basic Meta Tags -->
<meta
  name="description"
  content="Your page description here. Keep it under 160 characters."
/>
<meta name="keywords" content="keyword1, keyword2, keyword3" />
<meta name="author" content="OFO Development" />
<link rel="canonical" href="https://ofodev.com/page-name.html" />

<!-- Open Graph Tags for Social Media Sharing -->
<meta property="og:title" content="Page Title | OFO Development" />
<meta
  property="og:description"
  content="Your page description here. Keep it under 160 characters."
/>
<meta
  property="og:image"
  content="https://ofodev.com/assets/images/og-image.jpg"
/>
<meta property="og:url" content="https://ofodev.com/page-name.html" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="OFO Development" />

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title | OFO Development" />
<meta
  name="twitter:description"
  content="Your page description here. Keep it under 160 characters."
/>
<meta
  name="twitter:image"
  content="https://ofodev.com/assets/images/twitter-card-image.jpg"
/>
```

## JSON-LD Schema Markup Templates

### Organization Schema

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OFO Development",
    "url": "https://ofodev.com",
    "logo": "https://ofodev.com/assets/images/logos/Color logo - no background.png",
    "sameAs": [
      "https://www.facebook.com/ofodevelopment",
      "https://www.linkedin.com/company/ofo-development",
      "https://twitter.com/ofodevelopment"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-555-5555",
      "contactType": "customer service",
      "email": "contact@ofodev.com"
    }
  }
</script>
```

### Service Schema

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Service Name",
    "provider": {
      "@type": "Organization",
      "name": "OFO Development"
    },
    "name": "Service Name",
    "description": "Detailed description of the service.",
    "areaServed": "Global",
    "offers": {
      "@type": "Offer",
      "price": "Contact for pricing",
      "priceCurrency": "USD"
    }
  }
</script>
```

### Professional Service Schema

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "OFO Development",
    "image": "https://ofodev.com/assets/images/logos/Color logo - no background.png",
    "url": "https://ofodev.com",
    "telephone": "+1-555-555-5555",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "ZIP",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "00.0000",
      "longitude": "-00.0000"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    },
    "priceRange": "$$$"
  }
</script>
```

### Breadcrumb Schema

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://ofodev.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": "https://ofodev.com/services.html"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Current Page Title",
        "item": "https://ofodev.com/current-page.html"
      }
    ]
  }
</script>
```

### FAQ Schema

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Question 1?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Answer to question 1."
        }
      },
      {
        "@type": "Question",
        "name": "Question 2?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Answer to question 2."
        }
      }
    ]
  }
</script>
```

## Service-Specific Templates

### AI & Machine Learning Service

#### Meta Description

```
Transform your business with OFO Development's AI & Machine Learning solutions. Custom algorithms, predictive analytics, and machine learning models tailored to your specific challenges. Contact us today.
```

#### Keywords

```
AI development, machine learning solutions, artificial intelligence consulting, predictive analytics, neural networks, deep learning, computer vision, NLP, AI implementation, custom AI solutions
```

#### JSON-LD Schema

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "AI & Machine Learning Solutions",
    "provider": {
      "@type": "Organization",
      "name": "OFO Development"
    },
    "name": "AI & Machine Learning Solutions",
    "description": "Expert AI & Machine Learning services including custom algorithm development, predictive analytics, computer vision, and natural language processing. Our tailored solutions help businesses automate processes, gain insights from data, and build intelligent applications.",
    "areaServed": "Global",
    "offers": {
      "@type": "Offer",
      "price": "Contact for pricing",
      "priceCurrency": "USD"
    }
  }
</script>
```
