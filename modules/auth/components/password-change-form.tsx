"use client";

// import { useFormState } from 'react-dom'
import { useEffect, useRef, useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { updatePassword } from "@/modules/users/actions/action";

export function PasswordChangeForm() {
	const [state, formAction] = useActionState(updatePassword, null);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (state?.success) {
			formRef.current?.reset();
		}
	}, [state]);

	return (
		<form ref={formRef} action={formAction} className="space-y-4">
			{state?.error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{state.error}</AlertDescription>
				</Alert>
			)}

			{state?.success && (
				<Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
					<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
					<AlertDescription className="text-green-800 dark:text-green-200">
						{state.message}
					</AlertDescription>
				</Alert>
			)}

			<div className="space-y-2">
				<Label htmlFor="currentPassword">Current Password</Label>
				<div className="relative">
					<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="currentPassword"
						name="currentPassword"
						type="password"
						required
						className="pl-10"
						placeholder="Enter current password"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="newPassword">New Password</Label>
				<div className="relative">
					<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="newPassword"
						name="newPassword"
						type="password"
						required
						minLength={6}
						className="pl-10"
						placeholder="Enter new password"
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					Must be at least 6 characters
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm New Password</Label>
				<div className="relative">
					<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						minLength={6}
						className="pl-10"
						placeholder="Confirm new password"
					/>
				</div>
			</div>

			<Button type="submit" className="w-full">
				Update Password
			</Button>
		</form>
	);
}
