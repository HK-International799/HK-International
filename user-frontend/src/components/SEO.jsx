// import { Helmet } from "react-helmet";

// const SEO = ({
//   title,
//   description,
//   keywords,
//   image,
//   url,
// }) => {
//   return (
//     <Helmet>
//       {/* Basic */}
//       <title>{title}</title>

//       <meta name="description" content={description} />
//       <meta name="keywords" content={keywords} />
//       <meta name="robots" content="index, follow" />

//       {/* Open Graph */}
//       <meta property="og:type" content="website" />
//       <meta property="og:title" content={title} />
//       <meta property="og:description" content={description} />
//       <meta property="og:image" content={image} />
//       <meta property="og:url" content={url} />

//       {/* Twitter */}
//       <meta name="twitter:card" content="summary_large_image" />
//       <meta name="twitter:title" content={title} />
//       <meta name="twitter:description" content={description} />
//       <meta name="twitter:image" content={image} />

//       {/* Canonical */}
//       <link rel="canonical" href={url} />
//     </Helmet>
//   );
// };

// export default SEO;

import { Helmet } from "react-helmet";

/**
 * Comprehensive SEO component for 1A HK International LMS.
 *
 * Backwards-compatible: keeps existing props (title, description, keywords, image, url).
 * Adds:
 *   - Brand meta (og:site_name, og:locale, author, theme-color)
 *   - Geo targeting via geoRegion prop ("GB", "IN", "PT")
 *   - JSON-LD structured data via schemaType:
 *       "organization" | "course" | "courselist" | "localbusiness" | "faq"
 *   - courseData prop (for Course schema)
 *   - faqData prop (array of {question, answer} for FAQPage schema)
 *   - localBusinessData prop (for LocalBusiness schema)
 *   - extraSchema prop (raw JSON-LD object for any custom schema)
 */

const SITE_NAME = "1A HK International";
const SITE_URL = "https://hkinternational.uk";
const DEFAULT_IMAGE = "/og-default.png";
const BRAND_COLOR = "#1e3a5f";
const LOGO_URL = `${SITE_URL}/images/hk_logo.png`;

const SOCIAL_LINKS = [
  "https://www.facebook.com/profile.php?id=61578676434716",
  "https://www.linkedin.com/company/hk-international-uk/",
  "https://www.instagram.com/hkinternational.uk/",
  "https://x.com/1a_hk85756",
];

const OFFICES = [
  {
    "@type": "PostalAddress",
    streetAddress: "Office 108A, 182-184 High Street North, Area 1/1, East Ham",
    addressLocality: "London",
    postalCode: "E6 2JA",
    addressCountry: "GB",
  },
  {
    "@type": "PostalAddress",
    streetAddress: "Rua Hermano Neves 18, Piso 3, Escritório 7",
    addressLocality: "Lisboa",
    postalCode: "1600-477",
    addressCountry: "PT",
  },
  {
    "@type": "PostalAddress",
    streetAddress: "VO-258, Raheja Platinum, Andheri East",
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    postalCode: "400059",
    addressCountry: "IN",
  },
];

const GEO_DATA = {
  GB: { region: "GB-ENG", placename: "London, United Kingdom" },
  IN: { region: "IN-MH", placename: "Mumbai, India" },
  PT: { region: "PT-11", placename: "Lisbon, Portugal" },
};

/* ---------- Schema Builders ---------- */

const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  alternateName: "1A HK International Ltd",
  url: SITE_URL,
  logo: LOGO_URL,
  email: "info@hkinternational.uk",
  description:
    "1A HK International is a globally trusted provider of accredited Health, Safety & Environment (HSE) training and certifications including IOSH, OTHM, OSHA, ISO 45001, CIEH and ESC programs.",
  sameAs: SOCIAL_LINKS,
  address: OFFICES,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@hkinternational.uk",
      areaServed: ["GB", "IN", "PT", "AE", "SA", "QA", "OM", "KW", "BH"],
      availableLanguage: ["en"],
    },
  ],
});

const buildCourseSchema = (course) => {
  if (!course) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      (course.overview || "").slice(0, 500) ||
      `${course.title} accredited by ${course.organization || course.accreditation}.`,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      sameAs: SITE_URL,
      url: SITE_URL,
    },
    url: `${SITE_URL}/course/${course.id}`,
    image: course.image
      ? course.image.startsWith("http")
        ? course.image
        : `${SITE_URL}${course.image}`
      : `${SITE_URL}${DEFAULT_IMAGE}`,
    educationalCredentialAwarded:
      course.accreditation || course.organization || "Professional Certificate",
    timeRequired: course.duration || "P3D",
    inLanguage: "en",
    availableLanguage: ["en"],
    teaches: Array.isArray(course.learningOutcomes)
      ? course.learningOutcomes.slice(0, 10).join("; ")
      : undefined,
    hasCourseInstance: (Array.isArray(course.mode)
      ? course.mode
      : [course.mode || "Online"]
    ).map((m) => ({
      "@type": "CourseInstance",
      courseMode:
        String(m).toLowerCase().includes("online") ? "Online" : "Onsite",
      name: `${course.title} – ${m}`,
      inLanguage: "en",
    })),
    offers: {
      "@type": "Offer",
      category: "Paid",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/course/${course.id}`,
    },
  };
};

const buildCourseListSchema = (courses = []) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "All Health & Safety Courses – 1A HK International",
  url: `${SITE_URL}/courses`,
  numberOfItems: courses.length,
  itemListElement: courses.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.title,
    url: `${SITE_URL}/course/${c.id}`,
  })),
});

const buildLocalBusinessSchema = (data) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}#uk-office`,
  name: SITE_NAME,
  image: LOGO_URL,
  url: SITE_URL,
  telephone: data?.telephone || "+44 000 000 0000",
  email: "info@hkinternational.uk",
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Office 108A, 182-184 High Street North, Area 1/1, East Ham",
    addressLocality: "London",
    postalCode: "E6 2JA",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.5391,
    longitude: 0.0524,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: SOCIAL_LINKS,
});

const buildFaqSchema = (faqs = []) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
});

/* ---------- Main Component ---------- */

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  schemaType,
  courseData,
  courseListData,
  faqData,
  localBusinessData,
  extraSchema,
  geoRegion = "GB",
  siteName = SITE_NAME,
  author = SITE_NAME,
  themeColor = BRAND_COLOR,
}) => {
  const finalImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}${DEFAULT_IMAGE}`;
  const finalUrl = url || SITE_URL;
  const geo = GEO_DATA[geoRegion] || GEO_DATA.GB;

  // Build structured data based on schemaType
  const schemas = [];

  if (schemaType === "organization") {
    schemas.push(buildOrganizationSchema());
  }
  if (schemaType === "course" && courseData) {
    schemas.push(buildCourseSchema(courseData));
  }
  if (schemaType === "courselist" && courseListData) {
    schemas.push(buildCourseListSchema(courseListData));
  }
  if (schemaType === "localbusiness") {
    schemas.push(buildLocalBusinessSchema(localBusinessData));
  }
  if (faqData && Array.isArray(faqData) && faqData.length > 0) {
    schemas.push(buildFaqSchema(faqData));
  }
  if (extraSchema) {
    schemas.push(extraSchema);
  }

  return (
    <Helmet>
      {/* ---------- Basic ---------- */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <meta
        name="googlebot"
        content="index, follow, max-image-preview:large, max-snippet:-1"
      />
      <meta name="author" content={author} />
      <meta name="publisher" content={SITE_NAME} />
      <meta name="theme-color" content={themeColor} />
      <meta name="application-name" content={siteName} />

      {/* ---------- Geo Targeting ---------- */}
      <meta name="geo.region" content={geo.region} />
      <meta name="geo.placename" content={geo.placename} />

      {/* ---------- Open Graph ---------- */}
      <meta property="og:type" content={schemaType === "course" ? "article" : "website"} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="en_IN" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={finalUrl} />

      {/* article:publisher for course pages */}
      {schemaType === "course" && (
        <meta property="article:publisher" content={SITE_URL} />
      )}

      {/* ---------- Twitter ---------- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@1a_hk85756" />
      <meta name="twitter:creator" content="@1a_hk85756" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* ---------- Canonical ---------- */}
      <link rel="canonical" href={finalUrl} />

      {/* ---------- Structured Data (JSON-LD) ---------- */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
