import { Suspense } from "react";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/seo-provider";
import { GamesPageLayoutWrapper } from "./games-page-layout-wrapper";
import { QueryPageSkeleton } from "@/components/features/query-display/query-page-skeleton";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug.length === 1) {
    // Provider only: /games/pg-soft
    const providerName = decodeURIComponent(slug[0])
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return generateSEOMetadata({
      title: `${providerName} Games - Play Online Casino Games - HyperBetz`,
      description: `Explore all ${providerName} games on HyperBetz. Play slots, live casino, and more from ${providerName} with amazing features and big wins.`,
      keywords: [providerName, 'games', 'casino games', 'online slots', 'live casino'],
      path: `/games/${slug[0]}`,
      pageType: 'game',
      ogType: 'website',
    });
  } else if (slug.length === 2) {
    // Provider + category: /games/pg-soft/slot
    const providerName = decodeURIComponent(slug[0])
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const categoryName = decodeURIComponent(slug[1])
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return generateSEOMetadata({
      title: `${providerName} ${categoryName} Games - HyperBetz`,
      description: `Play ${categoryName} games from ${providerName} on HyperBetz. Enjoy the best ${categoryName} gaming experience with top features and rewards.`,
      keywords: [providerName, categoryName, 'games', 'casino', 'online gaming'],
      path: `/games/${slug[0]}/${slug[1]}`,
      pageType: 'game',
      ogType: 'website',
    });
  }

  // Fallback
  return generateSEOMetadata({
    title: 'Games - HyperBetz',
    description: 'Explore all games on HyperBetz',
    keywords: ['games', 'casino', 'online gaming'],
    path: '/games',
    pageType: 'game',
    ogType: 'website',
  });
}

export default async function DynamicGamesPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<QueryPageSkeleton />}>
      <GamesPageLayoutWrapper slug={slug} />
    </Suspense>
  );
}

// Generate static params for popular providers
export function generateStaticParams() {
  const popularProviders = [
    'pg-soft',
    'pragmatic-play',
    'evolution',
    'netent',
    'ka-gaming',
    'playtech',
    'microgaming',
  ];

  const categories = ['slot', 'live-casino', 'sports', 'rng'];

  const params = [];

  // Provider only
  for (const provider of popularProviders) {
    params.push({ slug: [provider] });
  }

  // Provider + category
  for (const provider of popularProviders) {
    for (const category of categories) {
      params.push({ slug: [provider, category] });
    }
  }

  return params;
}
