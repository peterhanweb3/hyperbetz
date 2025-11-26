"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteSeoPage } from "@/modules/seo/actions";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteSeoPageButtonProps {
	pageId: string;
	pageTitle: string;
}

export function DeleteSeoPageButton({
	pageId,
	pageTitle,
}: DeleteSeoPageButtonProps) {
	const [showDialog, setShowDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteSeoPage(pageId);
			if (result?.success) {
				toast.success("SEO page deleted successfully");
				window.location.reload();
			}
		} catch {
			toast.error("Failed to delete SEO page");
			setIsDeleting(false);
			setShowDialog(false);
		}
	};

	return (
		<>
			<Button
				variant="destructive"
				size="icon"
				onClick={() => setShowDialog(true)}
			>
				<Trash2 className="h-4 w-4" />
			</Button>

			<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the SEO page{" "}
							<span className="font-semibold text-[17px] text-primary">
								&quot;
								{pageTitle}&quot;
							</span>{" "}
							. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
