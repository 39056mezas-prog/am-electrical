/**
 * AM ELECTRICAL — SITE CONTENT
 * ----------------------------------------------------------------
 * Reference config + the one section that's genuinely data-driven
 * at runtime.
 *
 * Read by main.js at runtime:
 *   - business.email        -> contact form's mailto recipient
 *   - gallery[]              -> the "Selected projects" grid + lightbox
 *
 * Everything else here (nav, capabilities, serviceIndex, rail,
 * residential index, whyPoints, serviceArea, form options) documents
 * the canonical copy that's written directly into index.html for
 * SEO and no-JS reliability — nav links, NAP details (name/address/
 * phone), and keyword-relevant section content should be crawlable
 * without depending on script execution. If you change one of those
 * values, update it in BOTH places: here, and in index.html.
 *
 * Anything marked "PLACEHOLDER" is safe and generic, meant to be
 * swapped for an exact detail once it's confirmed (a specific
 * job-site city, the live domain name, etc.).
 * ----------------------------------------------------------------
 */
window.AM_CONTENT = {

  site: {
    // PLACEHOLDER — set this to the live domain before launch.
    // Every canonical / OG / sitemap URL below is built from this.
    url: "https://www.amelectrical.com",
    title: "Electrician Lake Forest CA | Commercial, Industrial & Residential | AM Electrical",
    shortTitle: "AM Electrical",
    description:
      "AM Electrical is a licensed Lake Forest, CA electrical contractor serving commercial, industrial and residential clients across Orange County. 37 years of experience, 24-hour emergency service, CA Lic. #681767.",
    ogImage: "og-image.jpg",
    themeColor: "#17171A",
    locale: "en_US"
  },

  business: {
    legalName: "AM Electrical",
    owner: "Alex Metzger",
    founded: 1989,
    yearsExperience: 37,
    phoneDisplay: "714.931.6980",
    phoneHref: "tel:+17149316980",
    email: "ampmwired@aol.com",
    license: "681767",
    licenseLabel: "CA Lic. #681767",
    address: {
      street: "21392 Aspenwood",
      city: "Lake Forest",
      state: "CA",
      zip: "92630"
    },
    hours: "24-Hour Emergency Service",
    mission:
      "For 37 years, AM Electrical has powered homes, businesses and industrial facilities across Orange County with electrical work built on integrity, precision and experience. We provide 24-hour emergency response, upfront pricing and flexible scheduling — because your time and safety matter. Fully licensed and insured, we take on every project, from the smallest repair to the largest installation, with the same attention to detail."
  },

  nav: [
    { label: "Commercial", href: "#commercial" },
    { label: "Industrial", href: "#commercial" },
    { label: "Residential", href: "#residential" },
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" }
  ],

  // Primary capability categories — rendered as the numbered index.
  capabilities: [
    {
      number: "01",
      name: "Commercial",
      id: "commercial",
      summary:
        "Offices, retail and multi-tenant properties — supported with reliable electrical service, scheduled maintenance and new installation work."
    },
    {
      number: "02",
      name: "Industrial",
      id: "industrial",
      summary:
        "Industrial and manufacturing facilities — supported with reliable electrical service, scheduled maintenance and new installation work."
    },
    {
      number: "03",
      name: "Residential",
      id: "residential-cap",
      summary:
        "Homes throughout the area — supported with reliable electrical service, scheduled maintenance and new installation work, from small repairs to full builds."
    }
  ],

  // Secondary service index — applies across all three categories above.
  serviceIndex: ["Service", "Maintenance", "Installation", "Troubleshooting", "Emergency"],

  // Rail list for the Commercial + Industrial dark feature section.
  industrialRail: ["Commercial", "Industrial", "Service", "Maintenance", "Installation"],

  // Editorial index list for the Residential section.
  residentialIndex: [
    { label: "Service", copy: "Diagnosing and fixing electrical issues throughout the home." },
    { label: "Maintenance", copy: "Keeping existing wiring, fixtures and panels in safe working order." },
    { label: "Installation", copy: "Adding new fixtures, circuits or equipment, done to code." },
    { label: "Troubleshooting", copy: "Tracking down the source of an issue before it becomes bigger." },
    { label: "Emergency", copy: "24-hour response when something can't wait until morning." }
  ],

  // Field work / project gallery. Data-driven so images can be swapped
  // or added without touching markup. Location/category fields are
  // PLACEHOLDERS — replace with exact job-site details as available.
  gallery: [
    {
      id: "panel",
      src: "panel-full.webp",
      full: "hero-panel.webp",
      width: 981,
      height: 1573,
      category: "Commercial",
      location: "Orange County, CA", // PLACEHOLDER — exact city
      type: "Panel Service",
      alt: "Open commercial electrical distribution panel with breaker rows, serviced by AM Electrical",
      span: "tall"
    },
    {
      id: "fan",
      src: "gallery-ceiling-fan-thumb.webp",
      full: "gallery-ceiling-fan-full.webp",
      width: 576,
      height: 1024,
      category: "Residential",
      location: "Orange County, CA", // PLACEHOLDER
      type: "Ceiling Fan Installation",
      alt: "Decorative ceiling fan installed in a residential living room",
      span: "tall"
    },
    {
      id: "chandelier",
      src: "gallery-chandelier-thumb.webp",
      full: "gallery-chandelier-full.webp",
      width: 576,
      height: 1024,
      category: "Residential",
      location: "Orange County, CA", // PLACEHOLDER
      type: "Light Fixture Installation",
      alt: "Wrought-iron pendant light fixture installed above a residential staircase",
      span: "wide"
    },
    {
      id: "recessed",
      src: "gallery-recessed-lighting-thumb.webp",
      full: "gallery-recessed-lighting-full.webp",
      width: 576,
      height: 1024,
      category: "Residential",
      location: "Orange County, CA", // PLACEHOLDER
      type: "Recessed Lighting",
      alt: "Recessed can lighting installed along a kitchen and living room ceiling",
      span: "tall"
    },
    {
      id: "accent-wide",
      src: "gallery-lighting-bar-wide-thumb.webp",
      full: "gallery-lighting-bar-wide-full.webp",
      width: 1024,
      height: 576,
      category: "Residential",
      location: "Orange County, CA", // PLACEHOLDER
      type: "Accent Lighting",
      alt: "LED accent lighting installed beneath a floating display shelf",
      span: "wide"
    },
    {
      id: "accent-close",
      src: "gallery-lighting-bar-close-thumb.webp",
      full: "gallery-lighting-bar-close-full.webp",
      width: 1024,
      height: 576,
      category: "Residential",
      location: "Orange County, CA", // PLACEHOLDER
      type: "Accent Lighting — Detail",
      alt: "Close-up detail of LED accent lighting beneath a floating shelf",
      span: "wide"
    }
  ],

  whyPoints: [
    {
      label: "Experience",
      copy: "37 years serving homes, businesses and industrial clients across Orange County."
    },
    {
      label: "Response",
      copy: "24-hour emergency service — electrical problems don't keep business hours, and we don't either."
    },
    {
      label: "Pricing",
      copy: "Upfront pricing before work begins, so there are no surprises on the invoice."
    },
    {
      label: "Scheduling",
      copy: "Flexible scheduling built around your timeline, not the other way around."
    },
    {
      label: "Licensing",
      copy: "Fully licensed (CA Lic. #681767), bonded and insured on every job."
    },
    {
      label: "Scope",
      copy: "From the smallest repair to the largest installation, handled with the same attention to detail."
    }
  ],

  serviceArea: {
    primary: "Lake Forest, CA",
    region: "Orange County & Southern California",
    // PLACEHOLDER list — confirm before publishing which of these are
    // actively served, and expand into dedicated city pages later.
    cities: [
      "Lake Forest",
      "Irvine",
      "Mission Viejo",
      "Laguna Hills",
      "Laguna Niguel",
      "Rancho Santa Margarita",
      "Costa Mesa",
      "Newport Beach"
    ]
  },

  serviceTypeOptions: ["Emergency", "Service", "Maintenance", "Installation", "Other"],
  propertyTypeOptions: ["Residential", "Commercial", "Industrial"]
};
