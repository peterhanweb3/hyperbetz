"use client";

import React, { useEffect, useState } from "react";
// import { Mail, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
	useConnectWithOtp,
	useSignInWithPasskey,
} from "@dynamic-labs/sdk-react-core";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useTranslations } from "@/lib/locale-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheckCircle,
	faCircleExclamation,
	faClock,
	faEnvelope,
	faSpinnerThird,
	faKey,
} from "@fortawesome/pro-light-svg-icons";

interface EmailVerificationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type VerificationStep = "email" | "code" | "success";
type VerificationStatus = "idle" | "loading" | "error" | "success";

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();
	const signInWithPasskey = useSignInWithPasskey();
	const t = useTranslations("auth.email");
	const [step, setStep] = useState<VerificationStep>("email");
	const [status, setStatus] = useState<VerificationStatus>("idle");
	const [email, setEmail] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const RESEND_SECONDS = 30;
	const [resendLeft, setResendLeft] = useState<number>(RESEND_SECONDS);
	const [canResend, setCanResend] = useState<boolean>(false);

	// Reset modal state when closed
	const handleClose = () => {
		setStep("email");
		setStatus("idle");
		setEmail("");
		setVerificationCode("");
		setErrorMessage("");
		onClose();
	};

	const isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Send OTP using Dynamic Labs
	const handleSendCode = async () => {
		if (!isValidEmail(email)) {
			setStatus("error");
			setErrorMessage(t("errors.invalidEmail"));
			return;
		}

		setStatus("loading");
		setErrorMessage("");

		try {
			await connectWithEmail(email); // Dynamic Labs API
			setStatus("success");
			setStep("code");
			setCanResend(false);
			setResendLeft(RESEND_SECONDS);
		} catch (error: unknown) {
			setStatus("error");
			setErrorMessage(
				(error as Error)?.message || t("errors.sendFailed")
			);
		}
	};

	// Verify OTP using Dynamic Labs
	const handleVerifyCode = async () => {
		if (verificationCode.length !== 6) {
			setStatus("error");
			setErrorMessage(t("errors.invalidCode"));
			return;
		}

		setStatus("loading");
		setErrorMessage("");

		try {
			await verifyOneTimePassword(verificationCode); // Dynamic Labs API
			setStatus("success");
			setStep("success");

			// Optionally, show the success state briefly then close
			setTimeout(() => {
				handleClose();
			}, 2000);
		} catch (error: unknown) {
			setStatus("error");
			setErrorMessage(
				(error as Error)?.message || t("errors.invalidCode")
			);
		}
	};

	// Handle passkey sign in
	const handlePasskeySignIn = async () => {
		setStatus("loading");
		setErrorMessage("");

		try {
			await signInWithPasskey();
			setStatus("success");
			setStep("success");

			// Close modal after successful authentication
			setTimeout(() => {
				handleClose();
			}, 2000);
		} catch (error: unknown) {
			setStatus("error");
			setErrorMessage(
				(error as Error)?.message || "Passkey authentication failed"
			);
		}
	};

	// handle resend timer when on code step
	useEffect(() => {
		if (step !== "code") return;
		if (canResend) return;
		setResendLeft((prev) => (prev <= 0 ? RESEND_SECONDS : prev));
		const id = setInterval(() => {
			setResendLeft((s) => {
				if (s <= 1) {
					clearInterval(id);
					setCanResend(true);
					return 0;
				}
				return s - 1;
			});
		}, 1000);
		return () => clearInterval(id);
	}, [step, canResend]);

	const handleResend = async () => {
		if (!canResend) return;
		await handleSendCode();
	};

	const renderEmailStep = () => (
		<div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
			<div className="text-center space-y-2">
				<div className="size-16 bg-primary/15 rounded-2xl backdrop-blur flex items-center justify-center mx-auto shadow-sm ring-1 ring-primary/20">
					{/* <Mail className="size-7 text-primary" /> */}
					<FontAwesomeIcon
						icon={faEnvelope}
						fontSize={30}
						className="text-primary"
					/>
				</div>
				<DialogHeader>
					<DialogTitle asChild>
						<div className="text-xl">{t("title")}</div>
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{t("description")}
					</DialogDescription>
				</DialogHeader>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email" className="sr-only">
						{t("emailLabel")}
					</Label>
					<div className="relative">
						{/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" /> */}
						<FontAwesomeIcon
							icon={faEnvelope}
							className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70"
						/>
						<Input
							id="email"
							type="email"
							inputMode="email"
							autoComplete="email"
							placeholder={t("emailPlaceholder")}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={status === "loading"}
							className="pl-10 h-11"
						/>
					</div>
				</div>

				{status === "error" && (
					<Alert variant="destructive" className="py-2">
						{/* <AlertCircle className="h-4 w-4" /> */}
						<FontAwesomeIcon
							icon={faCircleExclamation}
							fontSize={16}
						/>
						<AlertDescription className="text-sm">
							{errorMessage}
						</AlertDescription>
					</Alert>
				)}

				<div className="flex gap-2 pt-1">
					<Button
						onClick={handleClose}
						variant="outline"
						disabled={status === "loading"}
						className="h-10"
					>
						{t("cancel")}
					</Button>
					<Button
						className="h-10 text-foreground flex-1"
						onClick={handleSendCode}
						disabled={!email || status === "loading"}
					>
						{status === "loading" ? (
							<>
								{/* <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "} */}
								<FontAwesomeIcon
									icon={faSpinnerThird}
									className="w-4 h-4 mr-2 animate-spin"
								/>
								{t("sending")}
							</>
						) : (
							t("continue")
						)}
					</Button>
				</div>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							or
						</span>
					</div>
				</div>

				<Button
					onClick={handlePasskeySignIn}
					variant="outline"
					disabled={status === "loading"}
					className="w-full h-10"
				>
					{status === "loading" ? (
						<>
							<FontAwesomeIcon
								icon={faSpinnerThird}
								className="w-4 h-4 mr-2 animate-spin"
							/>
							Signing in...
						</>
					) : (
						<>
							<FontAwesomeIcon
								icon={faKey}
								className="w-4 h-4 mr-2"
							/>
							Sign in with Passkey
						</>
					)}
				</Button>
			</div>
		</div>
	);

	const renderCodeStep = () => (
		<div className="space-y-6 animate-in fade-in-0 zoom-in-95 duration-300">
			<div className="text-center space-y-2">
				<div className="size-16 bg-primary/15 rounded-2xl backdrop-blur flex items-center justify-center mx-auto shadow-sm ring-1 ring-primary/20">
					{/* <Mail className="size-7 text-primary" /> */}
					<FontAwesomeIcon
						icon={faEnvelope}
						fontSize={28}
						className="text-primary"
					/>
				</div>
				<DialogHeader>
					<DialogTitle>
						<div className="text-xl">{t("enterCodeTitle")}</div>
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{t("sentTo", { email })}
					</DialogDescription>
				</DialogHeader>
			</div>

			<div className="space-y-4">
				<div className="flex justify-center">
					<InputOTP
						maxLength={6}
						value={verificationCode}
						onChange={(value) =>
							setVerificationCode(
								value.replace(/\D/g, "").slice(0, 6)
							)
						}
						inputMode="numeric"
						autoFocus
					>
						<InputOTPGroup>
							{Array.from({ length: 6 }).map((_, i) => (
								<InputOTPSlot
									key={i}
									index={i}
									className="h-12 w-12 text-lg"
								/>
							))}
						</InputOTPGroup>
					</InputOTP>
				</div>

				{status === "error" && (
					<Alert variant="destructive" className="py-2">
						{/* <AlertCircle className="h-4 w-4" /> */}
						<FontAwesomeIcon
							icon={faCircleExclamation}
							fontSize={16}
						/>
						<AlertDescription className="text-sm">
							{errorMessage}
						</AlertDescription>
					</Alert>
				)}

				<div className="flex items-center justify-between pt-1">
					<Button
						onClick={() => setStep("email")}
						variant="ghost"
						size="sm"
						disabled={status === "loading"}
						className="text-muted-foreground"
					>
						{t("changeEmail")}
					</Button>

					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						{/* <Clock className="size-4" /> */}
						<FontAwesomeIcon icon={faClock} fontSize={16} />
						{canResend ? (
							<Button
								variant="link"
								size="sm"
								onClick={handleResend}
								className="px-0"
							>
								{t("resendCode")}
							</Button>
						) : (
							<span>
								{t("resendIn", { seconds: resendLeft })}
							</span>
						)}
					</div>
				</div>

				<Button
					className="w-full h-10"
					onClick={handleVerifyCode}
					disabled={
						verificationCode.length !== 6 || status === "loading"
					}
				>
					{status === "loading" ? (
						<>
							{/* <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "} */}
							<FontAwesomeIcon
								icon={faSpinnerThird}
								className="w-4 h-4 mr-2 animate-spin"
							/>
							{t("verifying")}
						</>
					) : (
						t("continue")
					)}
				</Button>
			</div>
		</div>
	);

	const renderSuccessStep = () => (
		<div className="space-y-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
			<div className="size-16 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/20 flex items-center justify-center mx-auto">
				{/* <CheckCircle2 className="size-8 text-emerald-500" /> */}
				<FontAwesomeIcon
					icon={faCheckCircle}
					fontSize={32}
					className="text-emerald-500"
				/>
			</div>
			<h3 className="text-xl font-medium">{t("successTitle")}</h3>
			<p className="text-muted-foreground">{t("successSubtitle")}</p>
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogTitle asChild>
				<div className="sr-only">{t("modalAria")}</div>
			</DialogTitle>
			<DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-xl border-border/60 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
				{step === "email" && renderEmailStep()}
				{step === "code" && renderCodeStep()}
				{step === "success" && renderSuccessStep()}
			</DialogContent>
		</Dialog>
	);
};
