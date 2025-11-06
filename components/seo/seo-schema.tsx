/**
 * SEO Schema Component
 * Client component for injecting JSON-LD structured data
 */

"use client";

import { useEffect } from "react";

interface SchemaProps {
	schema: Record<string, unknown> | Array<Record<string, unknown>>;
	id?: string;
}

export function SEOSchema({ schema, id = "structured-data" }: SchemaProps) {
	useEffect(() => {
		if (!schema || typeof window === "undefined") return;

		const scriptId = `jsonld-${id}`;
		let script = document.getElementById(scriptId) as HTMLScriptElement;

		if (!script) {
			script = document.createElement("script");
			script.id = scriptId;
			script.type = "application/ld+json";
			document.head.appendChild(script);
		}

		script.textContent = JSON.stringify(
			Array.isArray(schema) ? schema : [schema]
		);

		return () => {
			const existingScript = document.getElementById(scriptId);
			if (existingScript) {
				existingScript.remove();
			}
		};
	}, [schema, id]);

	return null;
}

/**
 * FAQ Schema Component
 * Renders both the schema and visual FAQ section
 */
interface FAQItem {
	question: string;
	answer: string;
}

interface FAQSchemaProps {
	faqs: FAQItem[];
	className?: string;
}

export function FAQSchema({ faqs, className = "" }: FAQSchemaProps) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};

	return (
		<>
			<SEOSchema schema={schema} id="faq-schema" />
			<section
				className={`faq-section ${className}`}
				itemScope
				itemType="https://schema.org/FAQPage"
			>
				{faqs.map((faq, index) => (
					<div
						key={index}
						className="faq-item mb-4"
						itemScope
						itemProp="mainEntity"
						itemType="https://schema.org/Question"
					>
						<h3
							className="text-lg font-semibold mb-2"
							itemProp="name"
						>
							{faq.question}
						</h3>
						<div
							itemScope
							itemProp="acceptedAnswer"
							itemType="https://schema.org/Answer"
						>
							<p
								className="text-muted-foreground"
								itemProp="text"
							>
								{faq.answer}
							</p>
						</div>
					</div>
				))}
			</section>
		</>
	);
}

/**
 * Breadcrumb Schema Component
 */
interface BreadcrumbItem {
	name: string;
	url: string;
}

interface BreadcrumbSchemaProps {
	items: BreadcrumbItem[];
	className?: string;
}

export function BreadcrumbSchema({
	items,
	className = "",
}: BreadcrumbSchemaProps) {
	const schema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};

	return (
		<>
			<SEOSchema schema={schema} id="breadcrumb-schema" />
			<nav
				className={`breadcrumb ${className}`}
				itemScope
				itemType="https://schema.org/BreadcrumbList"
				aria-label="Breadcrumb"
			>
				<ol className="flex items-center space-x-2">
					{items.map((item, index) => (
						<li
							key={index}
							itemScope
							itemProp="itemListElement"
							itemType="https://schema.org/ListItem"
							className="flex items-center"
						>
							{index > 0 && (
								<span className="mx-2 text-muted-foreground">
									/
								</span>
							)}
							<a
								href={item.url}
								itemProp="item"
								className="hover:underline"
							>
								<span itemProp="name">{item.name}</span>
							</a>
							<meta
								itemProp="position"
								content={String(index + 1)}
							/>
						</li>
					))}
				</ol>
			</nav>
		</>
	);
}

export default SEOSchema;
