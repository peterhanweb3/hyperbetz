"use client";

import { Suspense, lazy } from "react";
import { ContactPageSkeleton } from "@/components/features/contact/contact-skeleton";

const ContactContent = lazy(
	() => import("@/components/features/contact/contact-content")
);

export default function ContactPage() {
	return (
		<Suspense fallback={<ContactPageSkeleton />}>
			<ContactContent />
		</Suspense>
	);
}
