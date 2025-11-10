import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeColorProvider } from "@/components/theme/theme-color-provider";
import { LocaleProvider } from "@/lib/locale-provider";
import { IOSViewportFix } from "@/components/common/ios-viewport-fix";
import { ServiceWorkerRegister } from "@/components/common/service-worker-register";
import { SEOTemplates } from "@/lib/seo/seo-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schema-generator";
// Avoid bundling public images via import to skip sharp at build time
import "./globals.css";

const poppins = Poppins({
	style: "normal",
	weight: ["300", "400", "500", "600", "700"], // Only load weights we use,
	subsets: ["latin"], // Remove latin-ext if not needed
	variable: "--font-poppins",
	display: "swap", // Critical: Prevents font blocking render
	preload: true, // Preload for faster rendering
	adjustFontFallback: true, // Reduce layout shift
});

// Global SEO metadata from centralized SEO system
export const metadata: Metadata = SEOTemplates.home().metadata;

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Generate SEO schemas for rich snippets
	const organizationSchema = generateOrganizationSchema();
	const websiteSchema = generateWebsiteSchema();

	// Get user's locale from cookies for proper HTML lang attribute (SEO)
	const cookieStore = await cookies();
	const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				{/* SEO: Structured Data for Knowledge Graph & Rich Snippets */}
				<JsonLd data={organizationSchema} />
				<JsonLd data={websiteSchema} />

				<script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-CM98Y8Y7K3"
				></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
	  						window.dataLayer = window.dataLayer || [];
	  						function gtag(){dataLayer.push(arguments);}
	  						gtag('js', new Date());
	  						gtag('config', 'G-CM98Y8Y7K3');
						`,
					}}
				/>

				{/* Viewport optimization for mobile */}
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
				/>

				{/* Theme color for better perceived performance */}
				<meta
					name="theme-color"
					content="#000000"
					media="(prefers-color-scheme: dark)"
				/>
				<meta
					name="theme-color"
					content="#ffffff"
					media="(prefers-color-scheme: light)"
				/>

				{/* Performance: Critical resource hints */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link rel="dns-prefetch" href="https://assets.coingecko.com" />
				<link rel="dns-prefetch" href="https://tokens.1inch.io" />
				<link rel="dns-prefetch" href="https://tokens-data.1inch.io" />
				<link rel="dns-prefetch" href="https://apiv2.xx88zz77.site" />
				<link
					rel="dns-prefetch"
					href="https://raw.githubusercontent.com"
				/>

				{/* Preload critical fonts */}

				{/* Preload critical logo for LCP */}
				<link
					rel="preload"
					href="/assets/site/Hyperbetz-logo.png"
					as="image"
					type="image/png"
					fetchPriority="high"
				/>
			</head>
			<body className={`${poppins.className}`}>
				{/*
          The outer provider manages light/dark mode.
          The inner provider manages the color theme.
        */}
				<ServiceWorkerRegister />
				<ThemeProvider
					attribute="class"
					defaultTheme="dark" // defaultTheme="light" is also fine
					enableSystem
					themes={["light", "dark"]} // IMPORTANT: Only manage light/dark here
				>
					<LocaleProvider>
						<ThemeColorProvider defaultTheme="green">
							<IOSViewportFix />
							{children}
						</ThemeColorProvider>
					</LocaleProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
