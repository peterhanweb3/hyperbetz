"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import domtoimage from "dom-to-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy, Download, RotateCw, Share2 } from "lucide-react";
import { useQRCode } from "next-qrcode";
import {
	FacebookShareButton,
	TwitterShareButton,
	WhatsappShareButton,
	TelegramShareButton,
	RedditShareButton,
	FacebookIcon,
	XIcon,
	WhatsappIcon,
	TelegramIcon,
	RedditIcon,
} from "react-share";
import { toast } from "sonner";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";

interface WithdrawalSuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	withdrawAmount: string;
	tokenSymbol: string;
	transactionHash?: string;
}

export const WithdrawalSuccessModal = (props: WithdrawalSuccessModalProps) => {
	const { user } = useDynamicAuth();
	const { isOpen, onClose, withdrawAmount, tokenSymbol } = props;
	const t = useTranslations("walletProvider.withdrawSuccess");
	const screenshotRef = useRef<HTMLDivElement>(null);
	const [image, setImage] = useState<Blob | null>(null);
	const [isGeneratingScreenshot, setIsGeneratingScreenshot] = useState(false);
	const { Image } = useQRCode();
	const shareUrl = `${window.location.origin}/?ref=${user?.referralId}`;
	const shareText = t("successMessage", {
		withdrawAmount: Number(withdrawAmount).toFixed(3),
		tokenSymbol,
		shareUrl,
	});
	//eslint-disable-next-line
	const [copiedReferral, setCopiedReferral] = useState(false);
	const handleCopyReferral = async () => {
		if (user?.referralId) {
			try {
				const referralLink = `${window.location.origin}/?ref=${user?.referralId}`;
				await navigator.clipboard.writeText(referralLink);
				setCopiedReferral(true);
				toast.success("Referral link copied!");
				setTimeout(() => setCopiedReferral(false), 2000);
			} catch {
				toast.error("Failed to copy referral link");
			}
		}
	};

	// Reset state when modal opens/closes
	const handleClose = () => {
		setImage(null);
		onClose();
	};

	const handleTakeScreenshot = async () => {
		if (screenshotRef.current) {
			setIsGeneratingScreenshot(true);
			try {
				const imageData = await domtoimage.toBlob(
					screenshotRef.current,
					{
						quality: 1.0,
					}
				);
				setImage(imageData);
				const link = document.createElement("a");
				link.download = `withdraw-success-${Date.now()}.png`;
				link.href = URL.createObjectURL(imageData);
				link.click();
			} catch (error) {
				console.error("Screenshot failed:", error);
				toast.error(
					t("screenshotFailed", {
						defaultValue:
							"Screenshot failed. Please try again or use a different browser.",
					})
				);
			} finally {
				setIsGeneratingScreenshot(false);
			}
		}
	};

	const handleNativeShare = async () => {
		// Check if navigator.share is available and supported
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title: shareText,
					url: shareUrl,
					...(image && { files: [image as File] }),
				});
			} catch (error) {
				console.error("Native share failed:", error);
				// Fallback to copying to clipboard
				handleFallbackShare();
			}
		} else {
			// Fallback for browsers that don't support navigator.share
			handleFallbackShare();
		}
	};

	const handleFallbackShare = async () => {
		try {
			if (typeof navigator !== "undefined" && navigator.clipboard) {
				await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
				toast.success(
					t("copiedToClipboard", {
						defaultValue: "Share text copied to clipboard!",
					})
				);
			} else {
				// Fallback for older browsers
				const textArea = document.createElement("textarea");
				textArea.value = `${shareText} ${shareUrl}`;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand("copy");
				document.body.removeChild(textArea);
				toast.success(
					t("copiedToClipboard", {
						defaultValue: "Share text copied to clipboard!",
					})
				);
			}
		} catch (error) {
			console.error("Clipboard copy failed:", error);
			toast.error(
				t("shareFailed", {
					defaultValue: "Share failed. Please try again.",
				})
			);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className="mx-auto gap-0 max-w-[95vw] max-h-[75vh] sm:max-w-[550px] md:max-w-[600px] p-0 bg-black border-none overflow-hidden rounded-2xl font-['Inter',_'Segoe_UI',_system-ui,_sans-serif]"
				onPointerDownOutside={(e) => {
					e.preventDefault();
					return false;
				}}
			>
				{/* Screenshot Content */}
				<div
					ref={screenshotRef}
					className="relative bg-black text-white w-full overflow-hidden"
				>
					{/* Background Image */}
					<div className="absolute inset-0 overflow-hidden">
						<img
							src="/assets/banners/withdraw/share.webp"
							alt="Withdrawal success background"
							// sizes="(max-width: 768px) 95vw, 500px"
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
							className="object-contain select-none"
						/>
						{/* Dark overlay to ensure text is readable */}
						<div className="absolute inset-0 bg-black/40" />
					</div>

					{/* Main Content */}
					<div className="relative w-full   flex flex-col justify-between p-6 sm:p-8">
						{/* Middle Section - Transaction Details */}
						<div className="z-10 space-y-4 sm:space-y-2">
							{/* Withdrawal Type */}
							<div>
								<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
									Withdrawal Success
								</h2>
								<div className="flex items-center gap-3">
									<span className="text-emerald-400 text-sm sm:text-base font-semibold">
										{t("status", {
											defaultValue: "Completed",
										})}
									</span>
									<span className="text-gray-500">|</span>
									<span className="text-gray-400 text-sm sm:text-base">
										On-Chain
									</span>
								</div>
							</div>

							{/* Amount - Big and Bold */}
							<div>
								<h3 className="text-6xl sm:text-7xl md:text-8xl font-black text-emerald-400 leading-none tracking-tight">
									+{Number(withdrawAmount).toFixed(2)}
								</h3>
							</div>

							{/* Price Details Grid */}
							<div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md">
								<div>
									<p className="text-xs sm:text-sm text-gray-500 mb-1">
										{t("entryPrice", {
											defaultValue: "Withdrawal Amount",
										})}
									</p>
									<p className="text-lg sm:text-xl font-bold">
										{Number(withdrawAmount).toFixed(2)}
									</p>
								</div>
								<div>
									<p className="text-xs sm:text-sm text-gray-500 mb-1">
										{t("lastPrice", {
											defaultValue: "Token Symbol",
										})}
									</p>
									<p className="text-lg sm:text-xl font-bold">
										{tokenSymbol}
									</p>
								</div>
							</div>
						</div>

						{/* Bottom Section - Branding and QR */}
						<div className="z-10 mt-2 flex items-end justify-between">
							<div className="space-y-2">
								{/* Logo */}
								<div className="flex items-center gap-2">
									<img
										src="/assets/site/Hyperbetz-logo.png"
										alt="HyperBetz Logo"
										width={200}
										height={32}
										className="object-contain"
									/>
								</div>
								<hr className="border-white/10" />
								{/* ref link */}
								<div className="text-xs sm:text-sm text-gray-400 max-w-xs w-full">
									{`${window.location.origin}/?ref=${user?.referralId}`}
									<Copy
										className="inline-block h-3 w-3 text-purple-500 ml-1 cursor-pointer"
										onClick={handleCopyReferral}
									/>
								</div>
							</div>

							{/* QR Code */}
							<div className="items-center justify-center flex flex-col">
								<div className="bg-white p-2 rounded-lg aspect-square w-20 h-20 sm:w-24 sm:h-24">
									{/* eslint-disable-next-line jsx-a11y/alt-text */}
									<Image
										text={shareUrl}
										options={{
											type: "canvas",
											width: 80,
											margin: 0,
											color: {
												dark: "#000000",
												light: "#ffffff",
											},
											quality: 1,
										}}
									/>
									{/* show ref under qr */}
								</div>
								<div
									className="text-sm text-center text-white mt-1"
									onClick={handleCopyReferral}
								>
									{user?.referralId}{" "}
									<Copy className="inline-block h-3 w-3 text-purple-500 ml-1" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Action Panel - Premium Design */}
				<div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 sm:p-5 space-y-4 border-t border-white/5">
					{/* Screenshot Button - Eye-Catching */}
					<Button
						onClick={handleTakeScreenshot}
						disabled={isGeneratingScreenshot}
						className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 font-black text-sm sm:text-base py-5 sm:py-6 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-purple-400/20"
						size="lg"
					>
						{isGeneratingScreenshot ? (
							<>
								<RotateCw className="w-5 h-5 animate-spin mr-2" />
								<span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
									{t("generating", {
										defaultValue: "Creating Magic...",
									})}
								</span>
							</>
						) : (
							<>
								<Download className="w-5 h-5 mr-2" />
								<span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
									{t("download", {
										defaultValue: "Download & Share",
									})}
								</span>
							</>
						)}
					</Button>

					{/* Social Share Section */}
					<div className="space-y-3">
						<div className="flex items-center justify-center gap-2">
							<div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
							<Share2 className="w-4 h-4 text-purple-400" />
							<span className="text-xs sm:text-sm font-bold text-white/90 tracking-wide">
								{t("shareText", {
									defaultValue: "SPREAD THE WIN",
								})}
							</span>
							<div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
						</div>

						{/* Share Buttons Grid - Premium Cards */}
						<div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
							<TwitterShareButton
								url={shareUrl}
								title={shareText}
								className="w-full"
							>
								<div className="group relative flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 hover:border-blue-400/40 min-h-[60px] sm:min-h-[65px] backdrop-blur-sm shadow-lg hover:shadow-blue-500/20">
									<XIcon
										size={22}
										round
										className="sm:w-6 sm:h-6"
									/>
									<span className="text-[9px] sm:text-[10px] font-bold text-white/80 group-hover:text-white transition-colors">
										X
									</span>
								</div>
							</TwitterShareButton>

							<FacebookShareButton
								url={shareUrl}
								hashtag="#HyperBetz"
								className="w-full"
							>
								<div className="group relative flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 hover:border-blue-500/40 min-h-[60px] sm:min-h-[65px] backdrop-blur-sm shadow-lg hover:shadow-blue-600/20">
									<FacebookIcon
										size={22}
										round
										className="sm:w-6 sm:h-6"
									/>
									<span className="text-[9px] sm:text-[10px] font-bold text-white/80 group-hover:text-white transition-colors truncate w-full text-center px-0.5">
										Facebook
									</span>
								</div>
							</FacebookShareButton>

							<WhatsappShareButton
								url={shareUrl}
								title={shareText}
								className="w-full"
							>
								<div className="group relative flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 hover:border-green-500/40 min-h-[60px] sm:min-h-[65px] backdrop-blur-sm shadow-lg hover:shadow-green-500/20">
									<WhatsappIcon
										size={22}
										round
										className="sm:w-6 sm:h-6"
									/>
									<span className="text-[9px] sm:text-[10px] font-bold text-white/80 group-hover:text-white transition-colors truncate w-full text-center px-0.5">
										WhatsApp
									</span>
								</div>
							</WhatsappShareButton>

							<TelegramShareButton
								url={shareUrl}
								title={shareText}
								className="w-full"
							>
								<div className="group relative flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 hover:border-cyan-500/40 min-h-[60px] sm:min-h-[65px] backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20">
									<TelegramIcon
										size={22}
										round
										className="sm:w-6 sm:h-6"
									/>
									<span className="text-[9px] sm:text-[10px] font-bold text-white/80 group-hover:text-white transition-colors truncate w-full text-center px-0.5">
										Telegram
									</span>
								</div>
							</TelegramShareButton>

							<RedditShareButton
								url={shareUrl}
								title={shareText}
								className="w-full"
							>
								<div className="group relative flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 hover:border-orange-500/40 min-h-[60px] sm:min-h-[65px] backdrop-blur-sm shadow-lg hover:shadow-orange-500/20">
									<RedditIcon
										size={22}
										round
										className="sm:w-6 sm:h-6"
									/>
									<span className="text-[9px] sm:text-[10px] font-bold text-white/80 group-hover:text-white transition-colors truncate w-full text-center px-0.5">
										Reddit
									</span>
								</div>
							</RedditShareButton>

							<Button
								onClick={handleNativeShare}
								className="group relative flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 bg-gradient-to-br from-purple-800/50 to-pink-900/50 hover:from-purple-700/50 hover:to-pink-800/50 rounded-xl transition-all duration-300 hover:scale-105 border border-purple-400/20 hover:border-purple-400/40 min-h-[60px] sm:min-h-[65px] w-full h-auto backdrop-blur-sm shadow-lg hover:shadow-purple-500/20"
							>
								<Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
								<span className="text-[9px] sm:text-[10px] font-bold text-purple-200">
									More
								</span>
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
