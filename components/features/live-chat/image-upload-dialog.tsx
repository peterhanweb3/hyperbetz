"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/locale-provider";
import Image from "next/image";

interface ImageUploadDialogProps {
	imageUrl: string;
	onConfirm: () => void;
	onCancel: () => void;
	visible: boolean;
}

export function ImageUploadDialog({
	imageUrl,
	onConfirm,
	onCancel,
	visible,
}: ImageUploadDialogProps) {
	const t = useTranslations("chat");
	const tCommon = useTranslations("common");
	const [mounted, setMounted] = React.useState(false);
	const modalRef = React.useRef<HTMLDivElement>(null);

	// Ensure client-side rendering only
	React.useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	// Close on Escape or outside click
	React.useEffect(() => {
		if (!visible) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onCancel();
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(e.target as Node)
			) {
				onCancel();
			}
		};

		document.addEventListener("keydown", handleEscape);
		document.addEventListener("mousedown", handleClickOutside);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.removeEventListener("mousedown", handleClickOutside);
			document.body.style.overflow = "unset";
		};
	}, [visible, onCancel]);

	// Focus first interactive element
	React.useEffect(() => {
		if (visible && modalRef.current) {
			const focusable = modalRef.current.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			focusable[0]?.focus();
		}
	}, [visible]);

	// Don't render on server or if not visible
	if (!visible || !mounted) return null;

	const modalContent = (
		<>
			{/* Overlay */}
			<div
				className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999]"
				aria-hidden="true"
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-8 overflow-y-auto">
				<div
					ref={modalRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby="modal-title"
					aria-describedby="modal-description"
					tabIndex={-1}
					className="bg-card/98 border border-primary/30 rounded-2xl p-6 max-w-lg w-full mx-4 
                     shadow-2xl backdrop-blur-xl relative overflow-hidden
                     animate-in slide-in-from-top-5 duration-500 transform-gpu
                     ring-2 ring-primary/20 hover:ring-primary/40 transition-all
                     focus:outline-none focus:ring-4 focus:ring-primary/50"
				>
					{/* Background effects */}
					<div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-chart-1/10 to-chart-2/15 pointer-events-none animate-gradient-xy rounded-2xl opacity-80" />
					<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-chart-1/40 via-primary/40 to-chart-2/40 opacity-30 blur-sm animate-pulse-slow" />
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-chart-1 via-primary to-chart-2 rounded-t-2xl animate-shimmer" />

					{/* Modal content */}
					<div className="relative z-10">
						{/* Close Button */}
						<button
							onClick={onCancel}
							aria-label={t("imageDialog.closeAria")}
							className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border border-border
                         hover:bg-destructive hover:text-destructive-foreground hover:border-destructive
                         transition-all duration-200 flex items-center justify-center z-20
                         shadow-lg hover:shadow-xl hover:scale-110
                         focus:outline-none focus:ring-2 focus:ring-destructive/50"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						{/* Header */}
						<div className="flex items-center gap-3 mb-6 pt-2">
							<div className="p-2 rounded-full bg-gradient-to-br from-primary via-chart-1 to-chart-2 shadow-xl animate-pulse">
								<svg
									className="h-6 w-6 text-foreground"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<h3
									id="modal-title"
									className="text-xl font-semibold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent"
								>
									{t("imageDialog.title")}
								</h3>
								<p
									id="modal-description"
									className="text-xs text-muted-foreground"
								>
									{t("imageDialog.description")}
								</p>
							</div>
						</div>

						{/* Image preview */}
						<div className="mb-6 relative group">
							<div className="absolute -inset-2 bg-gradient-to-br from-chart-1/30 via-primary/20 to-chart-2/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-500 animate-pulse-slow" />
							<div className="absolute -inset-1 bg-gradient-to-br from-chart-1 via-primary to-chart-2 rounded-xl opacity-20 group-hover:opacity-30 transition-all duration-300" />
							<div className="relative h-64 bg-background/90 backdrop-blur-sm rounded-xl border border-primary/30 overflow-hidden shadow-2xl">
								<Image
									src={imageUrl || "/placeholder.svg"}
									alt={
										imageUrl
											? t("imageDialog.previewLabel")
											: "Placeholder"
									}
									fill
									sizes="(max-width: 768px) 90vw, 640px"
									className="object-contain bg-background/50 hover:scale-105 transition-transform duration-300"
									unoptimized
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
								<div className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-muted-foreground border border-border/50">
									{t("imageDialog.previewLabel")}
								</div>
							</div>
						</div>

						{/* Status bar */}
						<div className="mb-6 relative">
							<div className="p-4 rounded-xl bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-md border border-primary/20 shadow-inner">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse shadow-sm" />
										<span className="text-sm font-medium text-chart-2">
											{t("imageDialog.statusReady")}
										</span>
									</div>
									<div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
									<span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
										{t("imageDialog.roomLabel")}
									</span>
								</div>
								<p className="text-xs text-muted-foreground mt-2 text-center leading-relaxed">
									{t("imageDialog.shareNotice")}
								</p>
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex gap-3 justify-center">
							<Button
								variant="outline"
								onClick={onCancel}
								aria-label={t("imageDialog.cancelAria")}
								className="px-8 py-3 text-foreground border-border/70 hover:border-destructive/50
                           hover:bg-destructive/10 hover:text-destructive transition-all duration-300 
                           hover:scale-105 backdrop-blur-sm shadow-lg font-medium
                           ring-1 ring-border/30 hover:ring-destructive/30
                           focus:outline-none focus:ring-2 focus:ring-destructive/50"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
								{tCommon("cancel")}
							</Button>
							<Button
								onClick={onConfirm}
								aria-label={t("imageDialog.sendAria")}
								className="px-8 py-3 bg-gradient-to-r from-chart-1 via-primary to-chart-2 
                           hover:from-chart-1/90 hover:via-primary/90 hover:to-chart-2/90 
                           text-foreground shadow-xl hover:shadow-2xl hover:scale-105 
                           transition-all duration-300 font-semibold relative overflow-hidden
                           ring-2 ring-primary/30 hover:ring-primary/50 group
                           focus:outline-none focus:ring-2 focus:ring-primary/70"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
								{t("imageDialog.send")}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);

	return createPortal(modalContent, document.body);
}
