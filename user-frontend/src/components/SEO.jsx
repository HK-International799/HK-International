import { Helmet } from "react-helmet";

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

function countWords(htmlString) {
  if (!htmlString) return 0;

  const text = htmlString
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.split(" ").filter(Boolean).length;
}

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
  foundingLocation: "London, United Kingdom",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@hkinternational.uk",
      areaServed: [
        "GB",
        "IN",
        "PT",
        "AE",
        "SA",
        "QA",
        "OM",
        "KW",
        "BH",
        "United Kingdom",
        "India",
        "Portugal",
        "United Arab Emirates",
        "Saudi Arabia",
        "Qatar",
        "Oman",
        "Kuwait",
        "Bahrain",
      ],
      availableLanguage: ["en"],
    },
  ],
});

const buildWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  publisher: {
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
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
      courseMode: String(m).toLowerCase().includes("online")
        ? "Online"
        : "Onsite",
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
    streetAddress: "Office 108A, 182-184 High Street North, Area 1/1, East Ham",
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
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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

const buildBlogPostingSchema = (blogData) => {
  if (!blogData) return null;

  const {
    title,
    metaDescription,
    coverImage,
    publishedDate,
    updatedDate,
    author,
    category,
    keywords = [],
    sections = [],
    slug,
  } = blogData;

  const wordCount = sections.reduce(
    (acc, section) =>
      acc + countWords(section.heading) + countWords(section.content),
    0,
  );

  const imageUrl = coverImage
    ? coverImage.startsWith("http")
      ? coverImage
      : `${SITE_URL}${coverImage}`
    : `${SITE_URL}${DEFAULT_IMAGE}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: metaDescription,
    image: imageUrl,
    datePublished: publishedDate,
    dateModified: updatedDate || publishedDate,
    author: {
      "@type": "Organization",
      name: author || SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
    keywords: keywords.join(", "),
    articleSection: category,
    wordCount,
  };
};

const buildBreadcrumbSchema = (breadcrumbs = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url.startsWith("http") ? crumb.url : `${SITE_URL}${crumb.url}`,
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

  blogData,
  breadcrumbs,
  noIndex = false,

  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags = [],

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
    schemas.push(buildWebsiteSchema());
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
  if (schemaType === "blogposting" && blogData) {
    schemas.push(buildBlogPostingSchema(blogData));
  }

  if (schemaType === "breadcrumb" && breadcrumbs?.length) {
    schemas.push(buildBreadcrumbSchema(breadcrumbs));
  }
  if (extraSchema) {
    schemas.push(extraSchema);
  }

  const derivedPublished = blogData?.publishedDate || articlePublishedTime;

  const derivedModified = blogData?.updatedDate || articleModifiedTime;

  const derivedSection = blogData?.category || articleSection;

  const derivedTags = blogData?.tags?.length ? blogData.tags : articleTags;

  const isBlogPost = schemaType === "blogposting" && blogData;

  return (
    <Helmet>
      {/* ---------- Basic ---------- */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />{" "}
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
      <meta
        property="og:type"
        content={schemaType === "course" || isBlogPost ? "article" : "website"}
      />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="en_IN" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={finalUrl} />
      {isBlogPost && derivedPublished && (
        <meta property="article:published_time" content={derivedPublished} />
      )}
      {isBlogPost && derivedModified && (
        <meta property="article:modified_time" content={derivedModified} />
      )}
      {isBlogPost && derivedSection && (
        <meta property="article:section" content={derivedSection} />
      )}
      {isBlogPost &&
        derivedTags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
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
