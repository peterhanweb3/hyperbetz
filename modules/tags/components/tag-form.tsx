"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createTag } from "@/modules/tags/actions/actions";
import { toast } from "sonner";

export function TagForm() {
	const [state, formAction, isPending] = useActionState(createTag, null);

	useEffect(() => {
		if (state?.success) {
			toast.success("Tag created successfully");
			window.location.reload();
		}
	}, [state]);

	return (
		<Card>
			<CardContent className="p-6">
				<form action={formAction} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Tag Name</Label>
						<Input id="name" name="name" required />
					</div>
					{state?.error && (
						<p className="text-sm text-destructive">
							{state.error}
						</p>
					)}
					<Button type="submit" disabled={isPending}>
						{isPending ? "Creating..." : "Create Tag"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
