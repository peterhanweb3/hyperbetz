"use client";

import { memo, useState, useCallback } from "react";
import { useT } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";

interface ContactFormProps {
	onSubmit: (formData: FormData) => Promise<void>;
	isSubmitting: boolean;
}

interface FormErrors {
	name?: string;
	email?: string;
	subject?: string;
	message?: string;
}

function ContactFormBase({ onSubmit, isSubmitting }: ContactFormProps) {
	const t = useT();
	const [errors, setErrors] = useState<FormErrors>({});
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	const validateForm = useCallback(() => {
		const newErrors: FormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = t("contact.form.errors.nameRequired");
		}

		if (!formData.email.trim()) {
			newErrors.email = t("contact.form.errors.emailRequired");
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = t("contact.form.errors.emailInvalid");
		}

		if (!formData.subject.trim()) {
			newErrors.subject = t("contact.form.errors.subjectRequired");
		}

		if (!formData.message.trim()) {
			newErrors.message = t("contact.form.errors.messageRequired");
		} else if (formData.message.trim().length < 10) {
			newErrors.message = t("contact.form.errors.messageTooShort");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData, t]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			setFormData((prev) => ({ ...prev, [name]: value }));
			if (errors[name as keyof FormErrors]) {
				setErrors((prev) => ({ ...prev, [name]: undefined }));
			}
		},
		[errors]
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!validateForm()) return;

			const data = new FormData();
			Object.entries(formData).forEach(([key, value]) => {
				data.append(key, value);
			});

			await onSubmit(data);
			setFormData({ name: "", email: "", subject: "", message: "" });
		},
		[formData, onSubmit, validateForm]
	);

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h2 className="mb-6 text-xl font-semibold text-foreground">
				{t("contact.form.title")}
			</h2>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<label
							htmlFor="name"
							className="text-sm font-medium text-foreground"
						>
							{t("contact.form.name")}
						</label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder={t("contact.form.namePlaceholder")}
							value={formData.name}
							onChange={handleInputChange}
							className={cn(
								"bg-background transition-colors focus:border-primary",
								errors.name &&
									"border-destructive focus:border-destructive"
							)}
							disabled={isSubmitting}
						/>
						{errors.name && (
							<p className="text-xs text-destructive">
								{errors.name}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<label
							htmlFor="email"
							className="text-sm font-medium text-foreground"
						>
							{t("contact.form.email")}
						</label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder={t("contact.form.emailPlaceholder")}
							value={formData.email}
							onChange={handleInputChange}
							className={cn(
								"bg-background transition-colors focus:border-primary",
								errors.email &&
									"border-destructive focus:border-destructive"
							)}
							disabled={isSubmitting}
						/>
						{errors.email && (
							<p className="text-xs text-destructive">
								{errors.email}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="subject"
						className="text-sm font-medium text-foreground"
					>
						{t("contact.form.subject")}
					</label>
					<Input
						id="subject"
						name="subject"
						type="text"
						placeholder={t("contact.form.subjectPlaceholder")}
						value={formData.subject}
						onChange={handleInputChange}
						className={cn(
							"bg-background transition-colors focus:border-primary",
							errors.subject &&
								"border-destructive focus:border-destructive"
						)}
						disabled={isSubmitting}
					/>
					{errors.subject && (
						<p className="text-xs text-destructive">
							{errors.subject}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<label
						htmlFor="message"
						className="text-sm font-medium text-foreground"
					>
						{t("contact.form.message")}
					</label>
					<textarea
						id="message"
						name="message"
						placeholder={t("contact.form.messagePlaceholder")}
						rows={5}
						value={formData.message}
						onChange={handleInputChange}
						className={cn(
							"w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
							"placeholder:text-muted-foreground",
							"focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
							"transition-colors resize-none",
							"disabled:cursor-not-allowed disabled:opacity-50",
							errors.message &&
								"border-destructive focus:border-destructive focus:ring-destructive"
						)}
						disabled={isSubmitting}
					/>
					{errors.message && (
						<p className="text-xs text-destructive">
							{errors.message}
						</p>
					)}
				</div>

				<Button type="submit" disabled={isSubmitting} className="gap-2">
					{isSubmitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							{t("contact.form.sending")}
						</>
					) : (
						<>
							<Send className="h-4 w-4" />
							{t("contact.form.submit")}
						</>
					)}
				</Button>
			</form>
		</div>
	);
}

export const ContactForm = memo(ContactFormBase);
