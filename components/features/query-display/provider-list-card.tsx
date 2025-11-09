import Link from "next/link";
import Image from "next/image";
// import { ArrowRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";

interface ProviderListCardProps {
	name: string;
	gameCount?: number;
	iconUrl?: string;
}

export const ProviderListCard = ({
	name,
	gameCount = 0,
	iconUrl,
}: ProviderListCardProps) => {
	const tGames = useTranslations("games");
	const tProviders = useTranslations("providers");

	// Convert provider name to SEO-friendly URL format (lowercase with hyphens)
	const seoProviderName = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/\./g, '');
	const providerUrl = `/games/${seoProviderName}`;

	return (
		<Link href={providerUrl}>
			<div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden group-hover:scale-[1.01] group-hover:border-primary/30">
				{/* Subtle gradient background */}
				<div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

				<div className="relative flex items-center gap-4 p-4">
					{/* Minimal Icon */}
					<div className="relative">
						<div className="w-14 h-14 rounded-xl bg-background/80 border border-border/30 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:shadow-md group-hover:border-primary/20 transition-all duration-300">
							{iconUrl ? (
								<Image
									src={iconUrl}
									width={40}
									height={40}
									alt={tProviders("logoAlt", { name })}
									className="max-w-[80%] max-h-[80%] object-contain transition-all duration-300 group-hover:scale-105"
									onError={(e) => {
										e.currentTarget.style.display = "none";
										e.currentTarget.parentElement!.innerHTML = `<span class="text-lg font-semibold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">${name
											.charAt(0)
											.toUpperCase()}</span>`;
									}}
								/>
							) : (
								<span className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
									{name.charAt(0).toUpperCase()}
								</span>
							)}
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate mb-1">
							{name}
						</h3>
						<div className="text-sm text-muted-foreground">
							{gameCount} {tGames("count", { count: gameCount })}
						</div>
					</div>

					{/* Simple arrow indicator */}
					<div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
						<FontAwesomeIcon
							icon={faArrowRight}
							className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
						/>
					</div>
				</div>

				{/* Bottom accent line */}
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			</div>
		</Link>
	);
};
