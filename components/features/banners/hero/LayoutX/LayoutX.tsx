"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Trophy, Zap } from "lucide-react";
import Image from "next/image";

export function HeroBanner() {
	return (
		<div className="relative w-full md:h-96 lg:h-[420px] overflow-hidden rounded-2xl bg-gradient-to-br from-background via-card/50 to-background shadow-2xl">
			{/* Animated Background Elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				/>
				<div
					className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-ping"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="relative z-10 h-full flex items-center">
				{/* Left Content */}
				<div className="flex-1 p-6 md:p-12 lg:p-16">
					<div className="max-w-xl">
						{/* Top Badge */}
						<div className="flex items-center gap-2 mb-4 animate-fade-in">
							<Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm hover:bg-primary/30 transition-colors">
								<Sparkles
									className="w-3 h-3 mr-1 animate-spin"
									style={{ animationDuration: "3s" }}
								/>
								SIGN UP & GET REWARD
							</Badge>
							<Badge
								variant="outline"
								className="bg-card/20 text-foreground border-border/50 backdrop-blur-sm hover:bg-card/30 transition-colors"
							>
								No KYC Required
							</Badge>
						</div>

						{/* Main Headline */}
						<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-foreground mb-4 drop-shadow-lg animate-fade-in-up">
							WIN DAILY
							<span className="text-primary block bg-gradient-to-r from-primary to-primary/80 bg-clip-text animate-pulse">
								USDT 100,000
							</span>
						</h1>

						{/* Subtitle */}
						<p
							className="text-base md:text-lg text-muted-foreground mb-6 max-w-md animate-fade-in-up"
							style={{ animationDelay: "0.2s" }}
						>
							Join thousands of players winning big every day.
							Start playing now and claim your share!
						</p>

						{/* CTA Buttons */}
						<div
							className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up"
							style={{ animationDelay: "0.4s" }}
						>
							<Button
								size="lg"
								className="shimmer-effect  bg-primary hover:bg-primary/90 text-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
							>
								<Gift className="w-5 h-5 mr-2" />
								Start Playing Now
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="shimmer-effect bg-card/20 hover:bg-card/40 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 transform hover:scale-105"
							>
								<Trophy className="w-5 h-5 mr-2" />
								View Winners
							</Button>
						</div>

						{/* Feature Icons */}
						<div
							className="flex items-center gap-4 lg:gap-6 text-xs md:text-sm text-muted-foreground animate-fade-in-up"
							style={{ animationDelay: "0.6s" }}
						>
							<div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
								<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
									<span className="text-lg">🐶</span>
								</div>
								<span className="hidden sm:block">Crypto</span>
							</div>
							<div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
								<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
									<span className="text-lg">📱</span>
								</div>
								<span className="hidden sm:block">Mobile</span>
							</div>
							<div className="flex items-center gap-2 hover:text-foreground transition-colors cursor-pointer">
								<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
									<Zap className="w-4 h-4 text-primary" />
								</div>
								<span className="hidden sm:block">Instant</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Image */}
				<div className="hidden lg:flex flex-1 justify-center items-center pr-8">
					<div className="relative group">
						<Image
							src={"/assets/banners/hero/banner.webp"}
							alt="Hyperbetz Casino Banner"
							width={400}
							height={320}
							className="object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
							priority
						/>
						{/* Glow effect behind image */}
						<div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-75 opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
					</div>
				</div>
			</div>

			{/* Floating Elements */}
			<div
				className="absolute top-6 right-6 md:top-8 md:right-8 animate-bounce"
				style={{ animationDuration: "3s" }}
			>
				<div className="flex flex-col gap-2">
					<Badge className="bg-destructive/90 text-destructive-foreground backdrop-blur-sm animate-pulse hover:bg-destructive transition-colors cursor-pointer">
						🔥 HOT
					</Badge>
					<Badge className="bg-primary/90 text-foreground backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer">
						💎 VIP
					</Badge>
				</div>
			</div>

			{/* Sparkle Effects */}
			<div className="absolute inset-0 pointer-events-none">
				<div
					className="absolute top-16 left-1/4 text-primary/30 animate-ping"
					style={{ animationDelay: "0s" }}
				>
					✨
				</div>
				<div
					className="absolute top-32 right-1/3 text-primary/30 animate-ping"
					style={{ animationDelay: "1s" }}
				>
					💎
				</div>
				<div
					className="absolute bottom-24 left-1/3 text-primary/30 animate-ping"
					style={{ animationDelay: "2s" }}
				>
					🎰
				</div>
				<div
					className="absolute bottom-32 right-1/4 text-primary/30 animate-ping"
					style={{ animationDelay: "3s" }}
				>
					🏆
				</div>
			</div>
		</div>
	);
}
