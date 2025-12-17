"use client";

import { useState, useEffect, useCallback } from "react";
import { useDynamicAuth } from "@/hooks/useDynamicAuth";
import ApiService from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSpinner,
	faCheckCircle,
	faTimesCircle,
	faSignOut,
} from "@fortawesome/pro-light-svg-icons";
import { useTranslations } from "@/lib/locale-provider";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { sanitizeNicknameInput, sanitizeReferralIdInput } from "@/lib/utils";

type NicknameStatus = "idle" | "checking" | "available" | "taken" | "error";

export const SetNicknameModal = () => {
	const { onRegisterSubmit, logout, authToken } = useDynamicAuth();
	const t = useTranslations("auth.setNickname");
	const [nickname, setNickname] = useState("");
	const [debouncedNickname, setDebouncedNickname] = useState("");
	const [status, setStatus] = useState<NicknameStatus>("idle");
	const [isRegistering, setIsRegistering] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);
	const [hasReferrer, setHasReferrer] = useState(false);
	const [referrerId, setReferrerId] = useState("");
	const { setShowAuthFlow } = useDynamicContext();

	// Auto-detect referral id from URL (?r= or ?referralId=)
	useEffect(() => {
		if (typeof window === "undefined") return;
		const referralId = localStorage.getItem("referralId");
		const params = new URLSearchParams(window.location.search);
		const found =
			params.get("r") ||
			params.get("referrer") ||
			params.get("referralId");
		if (found && !referralId) {
			setHasReferrer(true);
			setReferrerId(found);
			setShowAuthFlow(true);
		}
		if (!found && referralId) {
			setHasReferrer(true);
			setReferrerId(referralId);
		}
		if (found && referralId) {
			if (referralId !== found) {
				localStorage.setItem("referralId", found);
				setHasReferrer(true);
				setReferrerId(found);
			}
			if (referralId === found) {
				setHasReferrer(true);
				setReferrerId(referralId);
			}
		}
	}, [setShowAuthFlow]);

	// Extract and memoize the checkNickname function
	const checkNickname = useCallback(async () => {
		setStatus("checking");
		setApiError(null);
		try {
			const api = ApiService.getInstance();
			const response = await api.checkNickName(
				debouncedNickname,
				authToken
			);
			setStatus(response.error ? "taken" : "available");
		} catch (err) {
			setStatus("error");
			if (err instanceof Error) {
				setApiError(` ${err.message}`);
				return;
			}
			setApiError(`Could not verify nickname. Please try again.`);
		}
	}, [debouncedNickname, authToken]);

	// Debounce effect for nickname checking
	useEffect(() => {
		const handler = setTimeout(() => {
			if (nickname.length >= 3) {
				setDebouncedNickname(nickname);
			} else {
				setStatus("idle");
			}
		}, 500); // 500ms delay after user stops typing

		return () => clearTimeout(handler);
	}, [nickname]);

	// API call effect for checking nickname
	useEffect(() => {
		if (debouncedNickname.length < 3) return;
		checkNickname();
	}, [debouncedNickname, authToken, checkNickname]);

	const handleRegister = async () => {
		setIsRegistering(true);
		setApiError(null);
		try {
			await onRegisterSubmit(
				nickname,
				hasReferrer ? referrerId.trim() : ""
			);
			// On success, the AuthProvider will handle closing the modal by updating the state.
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "An unknown error occurred.";
			setApiError(`Registration failed: ${message}`);
		} finally {
			setIsRegistering(false);
		}
	};

	const getStatusMessage = () => {
		switch (status) {
			case "checking":
				return (
					<p className="flex items-center text-sm text-muted-foreground">
						<FontAwesomeIcon
							icon={faSpinner}
							className="mr-2 h-4 w-4 animate-spin"
						/>
						{t("status.checking")}
					</p>
				);
			case "available":
				return (
					<p className="flex items-center text-sm text-green-500">
						<FontAwesomeIcon
							icon={faCheckCircle}
							className="mr-2 h-4 w-4"
						/>
						{t("status.available")}
					</p>
				);
			case "taken":
				return (
					<p className="flex items-center text-sm text-destructive">
						<FontAwesomeIcon
							icon={faTimesCircle}
							className="mr-2 h-4 w-4"
						/>
						{t("status.taken")}
					</p>
				);
			default:
				return <p className="h-5">&nbsp;</p>; // Placeholder to prevent layout shift
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Enhanced backdrop with layered blur effect */}
			<div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

			{/* Modal container with enhanced glassmorphism */}
			<div className="relative w-full max-w-lg">
				{/* Outer glow effect */}
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl opacity-50" />

				{/* Main modal */}
				<div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 backdrop-blur-xl shadow-2xl">
					{/* Top accent line */}
					<div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

					{/* Header section */}
					<div className="relative p-8 pb-6">
						<div className="flex items-start justify-between">
							<div className="space-y-2">
								<h2 className="text-3xl font-semibold text-foreground brightness-160">
									{t("title")}
								</h2>
								<p className="text-sm text-foreground/80">
									{t("subtitle")}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={logout}
								className="h-10 w-10 rounded-full border border-white/20 bg-background/20 text-foreground hover:bg-destructive/20 hover:text-destructive"
								aria-label={t("logoutAria")}
							>
								<FontAwesomeIcon
									icon={faSignOut}
									className="h-5 w-5"
								/>
							</Button>
						</div>
					</div>

					{/* Input section */}
					<div className="px-8 pb-6 ">
						<div className="space-y-4 ">
							<div className="relative space-y-4">
								<Input
									placeholder={t("inputPlaceholder")}
									value={nickname}
									onChange={(e) =>
										setNickname(
											sanitizeNicknameInput(
												e.target.value
											)
										)
									}
									disabled={isRegistering}
									className="h-14 text-lg font-medium bg-background/30 border-white/20 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl"
									maxLength={14}
								/>
								{/* Input accent border
								<div className="absolute inset-0 rounded-xl border border-gradient-to-r from-primary/20 via-transparent to-primary/20 pointer-events-none" /> */}

								{/* Referrer checkbox */}
								<label className="flex items-center gap-2 mt-8 text-sm font-medium text-foreground/80 select-none">
									<input
										type="checkbox"
										className="h-4 w-4 rounded border border-white/30 bg-background/40 focus:ring-primary/40"
										checked={hasReferrer}
										onChange={(e) =>
											setHasReferrer(e.target.checked)
										}
										disabled={isRegistering}
									/>
									{t("referrerCheckbox")}
								</label>

								{hasReferrer && (
									<div className="space-y-2">
										<Input
											placeholder={t(
												"referrerPlaceholder"
											)}
											value={referrerId}
											onChange={(e) =>
												setReferrerId(
													sanitizeReferralIdInput(
														e.target.value
													)
												)
											}
											disabled={isRegistering}
											className="h-12 text-sm font-medium bg-background/30 border-white/20 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl"
											maxLength={30}
										/>
										<p className="text-xs text-muted-foreground/70">
											{t("referrerHelp")}
										</p>
									</div>
								)}
							</div>

							{/* Status message with enhanced styling */}
							<div className="min-h-[24px] flex items-center">
								{getStatusMessage()}
							</div>
						</div>
					</div>

					{/* Error message */}
					{apiError && (
						<div className="px-8 pb-4">
							<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
								<p className="text-sm text-destructive font-medium">
									{apiError}
								</p>
							</div>
						</div>
					)}

					{/* Action button */}
					<div className="px-8 pb-6">
						<Button
							onClick={handleRegister}
							disabled={
								status !== "available" ||
								isRegistering ||
								(hasReferrer && referrerId.trim().length === 0)
							}
							className="w-full h-14 text-lg font-semibold rounded-xl bg-primary/90 hover:bg-primary text-foreground shadow-lg hover:shadow-xl transition-all duration-200"
						>
							{isRegistering ? (
								<FontAwesomeIcon
									icon={faSpinner}
									className="mr-2 h-5 w-5 animate-spin"
								/>
							) : null}
							{t("register")}
						</Button>
					</div>

					{/* Footer terms */}
					<div className="border-t border-white/10 bg-background/10 p-6">
						<div className="rounded-lg border border-white/10 bg-background/20 p-4">
							<p className="text-xs text-muted-foreground/70 leading-relaxed">
								<span className="font-semibold text-foreground/80">
									{t("termsTitle")}
								</span>{" "}
								{t("termsBody")}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
