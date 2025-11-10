/**
 * JSON-LD Component for Structured Data
 * Renders schema.org structured data in JSON-LD format for SEO
 *
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders JSON-LD structured data in a script tag
 * Used for rich snippets in search results (FAQs, Breadcrumbs, Organization, etc.)
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0)
      }}
    />
  );
}
