"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface ClientSEOProps {
	title: string;
	description: string;
	keywords?: string;
	ogImage?: string;
}

/**
 * Client-side SEO component for updating meta tags dynamically
 * Use this in client components where server-side metadata export isn't possible
 */
export function ClientSEO({
	title,
	description,
	keywords,
	ogImage,
}: ClientSEOProps) {
	const pathname = usePathname();

	useEffect(() => {
		// Update document title
		document.title = title;

		// Update or create meta tags
		const updateMetaTag = (
			name: string,
			content: string,
			isProperty = false
		) => {
			const attribute = isProperty ? "property" : "name";
			let element = document.querySelector(
				`meta[${attribute}="${name}"]`
			);

			if (!element) {
				element = document.createElement("meta");
				element.setAttribute(attribute, name);
				document.head.appendChild(element);
			}

			element.setAttribute("content", content);
		};

		// Basic meta tags
		updateMetaTag("description", description);
		if (keywords) {
			updateMetaTag("keywords", keywords);
		}

		// Open Graph tags
		updateMetaTag("og:title", title, true);
		updateMetaTag("og:description", description, true);
		// i don't want hardcoded domain here
		updateMetaTag("og:url", `${window.location.origin}${pathname}`, true);
		if (ogImage) {
			updateMetaTag("og:image", ogImage, true);
		}

		// Twitter Card tags
		updateMetaTag("twitter:title", title);
		updateMetaTag("twitter:description", description);
		if (ogImage) {
			updateMetaTag("twitter:image", ogImage);
		}
	}, [title, description, keywords, ogImage, pathname]);

	return null;
}
