"use client";

import { useState, useCallback, memo } from "react";
import { ContactHeader } from "./contact-header";
import { ContactMethods } from "./contact-methods";
import { ContactForm } from "./contact-form";
import { ContactFAQ } from "./contact-faq";
import { ContactResponseTime } from "./contact-response-time";

function ContactContentBase() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFormSubmit = useCallback(async () => {
		setIsSubmitting(true);
		try {
			// Form submission logic would go here
			await new Promise((resolve) => setTimeout(resolve, 1500));
			// Reset form on success
		} catch (error) {
			console.error("Form submission error:", error);
		} finally {
			setIsSubmitting(false);
		}
	}, []);

	return (
		<div className="container mx-auto space-y-8 consistent-padding-x consistent-padding-y">
			<ContactHeader />
			<ContactMethods />
			<ContactForm
				onSubmit={handleFormSubmit}
				isSubmitting={isSubmitting}
			/>
			<ContactResponseTime />
			<ContactFAQ />
		</div>
	);
}

const ContactContent = memo(ContactContentBase);
export default ContactContent;
