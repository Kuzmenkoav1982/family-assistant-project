import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
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
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Управление семьей онлайн`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEOHead;
