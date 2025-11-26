import type { NextConfig } from "next";
// import path from "path";

const nextConfig: NextConfig = {
	// Re-enable strict mode for better development experience and catching bugs
	reactStrictMode: true,

	// Production optimizations
	compiler: {
		// Remove console.logs in production but keep error/warn
		removeConsole:
			process.env.NODE_ENV === "production"
				? {
					exclude: ["error", "warn"],
				}
				: false,
	},

	// Image optimization - AGGRESSIVE
	images: {
		deviceSizes: [640, 768, 1024, 1280],  // Reduced device sizes
		imageSizes: [48, 64, 96, 128],  // Reduced image sizes
		formats: ["image/webp"], // Only WebP for better compression
		minimumCacheTTL: 31536000,  // Cache for 1 year
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: "https",
				hostname: "bshots.egcvi.com",
			},
			{
				protocol: "https",
				hostname: "aiimage.online",
			},
			{
				protocol: "https",
				hostname: "khpic.cdn568.net",
			},
			{ protocol: "https", hostname: "assets.coingecko.com" },
			{
				protocol: "https",
				hostname: "img-3-2.cdn568.ne",
			},
			{
				protocol: "https",
				hostname: "icon.aiimage.online",
			},
			{
				protocol: "https",
				hostname: "img-3-2.cdn568.net",
			},
			{
				protocol: "https",
				hostname: "img.dyn123.com",
			},
			{
				protocol: "https",
				hostname: "tokens.1inch.io",
			},
			{ protocol: "https", hostname: "raw.githubusercontent.com" },
			{ protocol: "https", hostname: "tokens-data.1inch.io" },
			{ protocol: "https", hostname: "apiv2.xx88zz77.site" },
			{ protocol: "http", hostname: "apiv2.xx88zz77.site" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "**" },
		],
	},

	// Experimental features for better performance
	experimental: {
		// Optimize package imports for tree-shaking
		optimizePackageImports: [
			"@fortawesome/react-fontawesome",
			"@fortawesome/pro-light-svg-icons",
			"@fortawesome/pro-regular-svg-icons",
			"@fortawesome/pro-solid-svg-icons",
			"lucide-react",
			"@radix-ui/react-icons",
			"date-fns",
			"lodash",
		],
		// Enable optimistic client cache
		optimisticClientCache: true,
		// Enable CSS chunking
		optimizeCss: true,
	},

	// Production build optimizations - AGGRESSIVE
	...(process.env.NODE_ENV === "production" && {
		// Generate smaller builds
		productionBrowserSourceMaps: false,
		// Compress output
		compress: true,
		// Disable x-powered-by header
		poweredByHeader: false,
		// Generate etags for caching
		generateEtags: true,
	}),

	// Headers for better caching and performance
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
				],
			},
			{
				// Cache static assets aggressively
				source: "/_next/static/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				// Cache images
				source: "/assets/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},

	// Webpack sala
	webpack: (config, { isServer }) => {
		config.resolve = config.resolve || {};
		config.resolve.fallback = {
			...config.resolve.fallback,
			"@react-native-async-storage/async-storage": false,
		};

		// Force single React version to avoid "Invalid Hook Call" with legacy-peer-deps
		// config.resolve.alias = {
		// 	...config.resolve.alias,
		// 	react: path.resolve('./node_modules/react'),
		// 	'react-dom': path.resolve('./node_modules/react-dom'),
		// };

		// Optimize chunks in production
		if (!isServer && process.env.NODE_ENV === "production") {
			config.optimization = {
				...config.optimization,
				moduleIds: "deterministic",
				runtimeChunk: "single",
				splitChunks: {
					chunks: "all",
					cacheGroups: {
						// Vendor chunk for node_modules
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name: "vendors",
							priority: 10,
							reuseExistingChunk: true,
						},
						// Wallet-related chunk (heavy dependencies)
						wallet: {
							test: /[\\/]node_modules[\\/](wagmi|viem|@dynamic-labs|@rainbow-me)[\\/]/,
							name: "wallet",
							priority: 20,
							reuseExistingChunk: true,
						},
						// UI components chunk
						ui: {
							test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
							name: "ui",
							priority: 15,
							reuseExistingChunk: true,
						},
						// Common chunk for shared code
						common: {
							minChunks: 2,
							priority: 5,
							reuseExistingChunk: true,
						},
					},
				},
			};
		}

		return config;
	},
};

export default nextConfig;
