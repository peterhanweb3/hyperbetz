import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/lib/locale-provider";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
	className?: string;
	name: string;
	gameCount?: number;
	iconUrl?: string;
}

export const ProviderGridCard = ({
	name,
	gameCount = 0,
	iconUrl,
	className,
}: ProviderCardProps) => {
	const tGames = useTranslations("games");
	const tProviders = useTranslations("providers");

	// Convert provider name to SEO-friendly URL format (lowercase with hyphens)
	const seoProviderName = name
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/\./g, "");
	const providerUrl = `/games/${seoProviderName}`;

	return (
		<Link
			href={providerUrl}
			className={cn("block group h-full", className)}
		>
			<div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 h-full min-h-[200px] flex flex-col group-hover:scale-[1.02] group-hover:border-primary/30 overflow-hidden">
				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

				{/* Icon Section - Takes up 75% of the card */}
				<div className="relative flex justify-center items-center px-3 py-3 h-3/4">
					<div className="relative w-full h-full">
						<div className="w-full h-full rounded-lg bg-background/80 border border-border/30 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-primary/20 transition-all duration-300">
							{iconUrl ? (
								<Image
									src={iconUrl}
									width={250}
									height={250}
									alt={tProviders("logoAlt", { name })}
									className="max-w-[85%] max-h-[85%] object-contain transition-all duration-300 group-hover:scale-105"
								/>
							) : (
								<span className="text-3xl font-semibold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
									{name.charAt(0).toUpperCase()}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Content Section - Takes up 25% of the card */}
				<div className="relative h-1/4 p-3 pt-0 text-center flex flex-col justify-center">
					<h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-1 line-clamp-2 leading-tight">
						{name}
					</h3>
					<div className="text-xs text-muted-foreground">
						{tGames("count", { count: gameCount })}
					</div>
				</div>

				{/* Bottom accent line */}
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			</div>
		</Link>
	);
};
