import dynamic from "next/dynamic";
import { ContactPageSkeleton } from "@/components/features/skeletons/contact/contact-skeleton";
const ContactContent = dynamic(
	() =>
		import("@/components/features/contact/contact-content").then((mod) => ({
			default: mod.default,
		})),
	{
		loading: () => <ContactPageSkeleton />,
	}
);

export default function ContactPage() {
	return <ContactContent />;
}
