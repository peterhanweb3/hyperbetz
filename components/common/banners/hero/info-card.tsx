// "use client";

// import Link from "next/link";
// // import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { InfoCardData } from "@/types/features/hero-banner-section.types";
// import { useTranslations } from "@/lib/locale-provider";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowRight } from "@fortawesome/pro-light-svg-icons";
// // import Image from "next/image";

// interface InfoCardProps {
// 	data: InfoCardData;
// 	className?: string;
// 	backgroundImage?: string; // New prop for PNG image
// }

// export const InfoCard = ({
// 	data,
// 	className,
// 	backgroundImage,
// }: InfoCardProps) => {
// 	const tHero = useTranslations("hero");
// 	const imageSource = backgroundImage || data.backgroundImage;
// 	return (
// 		<Card
// 			className={`group flex flex-row h-60 md:h-60 relative overflow-hidden
//         bg-gradient-to-r from-card via-card/95 to-card/90
//         backdrop-blur-sm border border-border/30
//         hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10
//         transition-all duration-300 ease-out transform
//         hover:scale-[1.01] hover:-translate-y-0.5
//         ${className}`}
// 		>
// 			{/* Background Color Layer */}
// 			<div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/8 to-transparent" />

// 			{/* Content Section */}
// 			<div className="flex-1 flex flex-col p-4 md:p-4 relative z-10">
// 				<div className="flex items-start mb-3">
// 					<div className="flex items-center gap-4">
// 						<div
// 							className="text-primary group-hover:scale-110 group-hover:rotate-3
//                            transition-all duration-300 ease-out drop-shadow-sm text-2xl"
// 						>
// 							{data.icon}
// 						</div>
// 						<div className="flex flex-col">
// 							<span
// 								className="text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/90
//                               bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80
//                               transition-all duration-300 leading-tight"
// 							>
// 								{data.i18nKey
// 									? tHero(`cards.${data.i18nKey}.title`)
// 									: data.title}
// 							</span>
// 						</div>
// 					</div>
// 					{/* <Badge
//             className="bg-primary/15 text-primary border-primary/30 shadow-lg
//               hover:bg-primary/25 transition-all duration-300 text-sm
//               backdrop-blur-sm group-hover:scale-105 px-3 py-1"
//           >
//             {data.i18nKey
//               ? tHero(`cards.${data.i18nKey}.badge`)
//               : data.badgeText}
//           </Badge> */}
// 				</div>

// 				<div className="flex-1">
// 					<p
// 						className="text-muted-foreground text-base leading-relaxed mb-4 line-clamp-3
//                         group-hover:text-muted-foreground/90 transition-colors duration-300"
// 					>
// 						{data.i18nKey
// 							? tHero(`cards.${data.i18nKey}.desc`)
// 							: data.description}
// 					</p>

// 					<Button
// 						asChild
// 						variant="link"
// 						className="p-0 h-auto self-start text-primary group/btn
//               hover:text-primary/80 transition-all duration-300 text-base font-medium"
// 					>
// 						<Link
// 							href={data.href}
// 							className="flex items-center group-hover:translate-x-1 transition-transform duration-300"
// 						>
// 							<span className="relative">
// 								{data.i18nKey
// 									? tHero(`cards.${data.i18nKey}.link`)
// 									: data.linkText}
// 								<span
// 									className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent
//                   group-hover/btn:w-full transition-all duration-300 ease-out"
// 								/>
// 							</span>
// 							<FontAwesomeIcon
// 								icon={faArrowRight}
// 								fontSize={16}
// 								className="ml-2 group-hover/btn:translate-x-1 transition-transform duration-300"
// 							/>
// 						</Link>
// 					</Button>
// 				</div>
// 			</div>

// 			{/* Side Image Section */}

// 			<div className="w-55 md:w-55 h-full relative flex items-center justify-center">
// 				{imageSource ? (
// 					<img
// 						src={imageSource}
// 						alt={data.title || "Card image"}
// 						className="object-contain group-hover:scale-105 transition-transform duration-200"
// 					/>
// 				) : (
// 					<div className="w-full h-full bg-primary/10 flex items-center justify-center text-muted-foreground">
// 						No Image
// 					</div>
// 				)}
// 			</div>

// 			{/* Enhanced border glow effect */}
// 			<div
// 				className="absolute inset-0 rounded-lg border border-primary/0
//         group-hover:border-primary/30 transition-all duration-300
//         group-hover:shadow-[0_0_15px_rgba(var(--primary),0.15)]"
// 			/>
// 		</Card>
// 	);
// };

// -------------------------------------------------------------------------------------------------------------------------
"use client";

import Link from "next/link";
// import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoCardData } from "@/types/features/hero-banner-section.types";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/pro-light-svg-icons";
import Image from "next/image";

interface InfoCardProps {
	data: InfoCardData;
	className?: string;
	backgroundImage?: string; // New prop for PNG image
}

export const InfoCard = ({
	data,
	className,
	backgroundImage,
}: InfoCardProps) => {
	const tHero = useTranslations("hero");
	const imageSource = backgroundImage || data.backgroundImage;
	return (
		<Card
			className={`group flex flex-col xl:flex-row h-auto xl:h-60 relative overflow-hidden
        bg-gradient-to-r from-card via-card/95 to-card/90
        backdrop-blur-sm border border-border/30 
        hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10
        transition-all duration-300 ease-out transform
        hover:scale-[1.01] hover:-translate-y-0.5
        ${className}`}
		>
			{/* Background Color Layer */}
			<div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/8 to-transparent" />

			{/* Side Image Section - Now appears first on smaller screens */}
			<div className="w-full lg:w-20 xl:w-26 2xl:w-32 3xl:w-40 h-32 mx-auto xl:mr-[23px] xl:h-full relative flex items-center justify-center flex-shrink-0 xl:order-2">
				{imageSource ? (
					<Image
						src={imageSource}
						alt={data.title || "Card image"}
						fill
						className="object-contain group-hover:scale-105 transition-transform duration-200 max-w-full max-h-full"
						sizes="(max-width: 1024px) 100vw, 160px"
						priority={false}
					/>
				) : (
					<div className="w-full h-full bg-primary/10 flex items-center justify-center text-muted-foreground text-sm">
						No Image
					</div>
				)}
			</div>

			{/* Content Section - Now appears second on smaller screens */}
			<div className="flex-1 flex flex-col p-4 xl:p-4 relative z-10 xl:order-1">
				<div className="flex items-start mb-3">
					<div className="flex items-center gap-3 xl:gap-4 min-w-0 flex-1">
						<div
							className="text-primary group-hover:scale-110 group-hover:rotate-3 
                           transition-all duration-300 ease-out drop-shadow-sm text-xl xl:text-2xl
                           flex-shrink-0"
						>
							{data.icon}
						</div>
						<div className="flex flex-col min-w-0 flex-1">
							<span
								className="text-base xl:text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/90 
                              bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80
                              transition-all duration-300 leading-tight"
							>
								{data.i18nKey
									? tHero(`cards.${data.i18nKey}.title`)
									: data.title}
							</span>
						</div>
					</div>
					{/* <Badge
            className="bg-primary/15 text-primary border-primary/30 shadow-lg
              hover:bg-primary/25 transition-all duration-300 text-sm
              backdrop-blur-sm group-hover:scale-105 px-3 py-1 flex-shrink-0"
          >
            {data.i18nKey
              ? tHero(`cards.${data.i18nKey}.badge`)
              : data.badgeText}
          </Badge> */}
				</div>

				<div className="flex-1 flex flex-col lg:max-w-[250px] xl:max-w-[300px] justify-between min-h-0">
					<p
						className="text-muted-foreground text-sm xl:text-base leading-relaxed mb-4 
                        line-clamp-2 xl:line-clamp-3 group-hover:text-muted-foreground/90 
                        transition-colors duration-300"
					>
						{data.i18nKey
							? tHero(`cards.${data.i18nKey}.desc`)
							: data.description}
					</p>

					<Button
						asChild
						variant="link"
						className="p-0 h-auto self-start text-primary group/btn
              hover:text-primary/80 transition-all duration-300 text-sm xl:text-base font-medium"
					>
						<Link
							href={data.href}
							className="flex items-center group-hover:translate-x-1 transition-transform duration-300"
						>
							<span className="relative whitespace-nowrap">
								{data.i18nKey
									? tHero(`cards.${data.i18nKey}.link`)
									: data.linkText}
								<span
									className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent
                  group-hover/btn:w-full transition-all duration-300 ease-out"
								/>
							</span>
							<FontAwesomeIcon
								icon={faArrowRight}
								fontSize={14}
								className="ml-2 group-hover/btn:translate-x-1 transition-transform duration-300 flex-shrink-0"
							/>
						</Link>
					</Button>
				</div>
			</div>

			{/* Enhanced border glow effect */}
			<div
				className="absolute inset-0 rounded-lg border border-primary/0 
        group-hover:border-primary/30 transition-all duration-300
        group-hover:shadow-[0_0_15px_rgba(var(--primary),0.15)]"
			/>
		</Card>
	);
};
