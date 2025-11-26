"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser } from "@/modules/users/actions/action";
import { toast } from "sonner";

export function UserForm() {
	const [state, formAction, isPending] = useActionState(createUser, null);

	useEffect(() => {
		if (state?.success) {
			toast.success("User created successfully");
			window.location.reload();
		}
	}, [state]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create New User</CardTitle>
			</CardHeader>
			<CardContent>
				<form action={formAction} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input id="username" name="username" required />
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="role">Role</Label>
						<Select name="role" defaultValue="BLOG_ADMIN">
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="BLOG_ADMIN">
									Blog Admin
								</SelectItem>
								<SelectItem value="SUPER_ADMIN">
									Super Admin
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{state?.error && (
						<p className="text-sm text-destructive">
							{state.error}
						</p>
					)}
					<Button
						type="submit"
						disabled={isPending}
						className="w-full"
					>
						{isPending ? "Creating..." : "Create User"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
