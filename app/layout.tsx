import { Poppins } from "next/font/google";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeColorProvider } from "@/components/theme/theme-color-provider";
import { LocaleProvider } from "@/lib/locale-provider";
import { IOSViewportFix } from "@/components/common/ios-viewport-fix";
import { ServiceWorkerRegister } from "@/components/common/service-worker-register";
import { PageLoader } from "@/components/common/page-loader";
import {
	OrganizationSchema,
	WebsiteSchema,
} from "@/components/features/seo/StructuredData";
import { getServerMessages, type Locale } from "@/lib/i18n";
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

// Root layout should NOT generate metadata - let page-specific layouts handle it
// This prevents duplicate meta tags when nested layouts both use generateMetadata()

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	let gId;
	try {
		const headersList = await headers();
		const host = headersList.get("host") || "hyperholaholah.xyz";
		const tld = host.split(".").slice(-1)[0];
		if (tld === "games") gId = "G-CM98Y8Y7K3";
		else if (tld === "com") gId = "G-KFL77EFTYF";
		else if (tld === "io") gId = "G-GP5JC4P9J3";
		else if (tld === "xyz") gId = "G-FSYDFS0LM6";
	} catch {
		gId = "G-CM98Y8Y7K3"; // default}
	}
	// Get user's locale from cookies for proper HTML lang attribute (SEO)
	const cookieStore = await cookies();
	const locale = (cookieStore.get("NEXT_LOCALE")?.value || "en") as Locale;
	const initialMessages = await getServerMessages(locale);

	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				{/* SEO: Structured Data for Knowledge Graph & Rich Snippets */}
				{/* SEO: Structured Data for Knowledge Graph & Rich Snippets */}
				<OrganizationSchema />
				<WebsiteSchema />
				<meta
					name="trustpilot-one-time-domain-verification-id"
					content="d33fb497-a8d9-492c-8dcb-5878599febec"
				/>

				<Script
					src={`https://www.googletagmanager.com/gtag/js?id=${gId}`}
					strategy="afterInteractive"
				/>
				<Script id="google-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', '${gId}');
					`}
				</Script>

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
					href="/assets/site/Hyperbetz-logo.webp"
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
					<LocaleProvider
						initialMessages={initialMessages}
						initialLocale={locale}
					>
						<ThemeColorProvider defaultTheme="green">
							<PageLoader />
							<IOSViewportFix />
							{children}
						</ThemeColorProvider>
					</LocaleProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
