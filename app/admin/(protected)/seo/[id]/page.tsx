import {
	SeoPageForm,
	type CarouselsState,
} from "@/modules/seo/components/SeoPageForm";
import { getSeoPageById } from "@/modules/seo/actions";
import { notFound } from "next/navigation";

export default async function SeoPageEdit({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	if (id === "new") {
		return (
			<div className="max-w-5xl mx-auto">
				<SeoPageForm />
			</div>
		);
	}

	const page = await getSeoPageById(id);
	if (!page) {
		notFound();
	}

	const initialData = {
		...page,
		carousels: (page.carousels as unknown as CarouselsState) || {
			liveCasino: {
				enabled: false,
				position: "bottom" as const,
				searchKeyword: "",
				customTitle: "",
			},
			slots: {
				enabled: false,
				position: "bottom" as const,
				searchKeyword: "",
				customTitle: "",
			},
			sports: {
				enabled: false,
				position: "bottom" as const,
				searchKeyword: "",
				customTitle: "",
			},
			providers: {
				enabled: false,
				position: "bottom" as const,
				searchKeyword: "",
				customTitle: "",
			},
		},
	};

	return (
		<div className="max-w-5xl mx-auto">
			<SeoPageForm initialData={initialData} />
		</div>
	);
}
