import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

const SITE_NAME = "Наша Семья";
const BASE_URL = "https://nasha-semiya.ru";
const DEFAULT_DESCRIPTION = "Платформа для управления семьёй: профили, дети, здоровье, питание, планирование, финансы, ИИ-помощники. Всё для гармоничной семейной жизни.";
const OG_IMAGE = "https://cdn.poehali.dev/files/Логотип Наша Семья.JPG";

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  noIndex = false,
  breadcrumbs,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Управление семьей онлайн`;
  const canonicalUrl = `${BASE_URL}${path}`;

  const breadcrumbList = breadcrumbs && breadcrumbs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Главная", "item": BASE_URL + "/" },
          ...breadcrumbs.map((item, i) => ({
            "@type": "ListItem",
            "position": i + 2,
            "name": item.name,
            "item": BASE_URL + item.path,
          })),
        ],
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="vk:image" content={OG_IMAGE} />
      {breadcrumbList && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbList)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
