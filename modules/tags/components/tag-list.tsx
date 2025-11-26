"use client";

import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { deleteTag } from "@/modules/tags/actions/actions";

export function TagList({
	tags,
}: {
	tags: {
		_count: {
			posts: number;
		};
		id: string;
		slug: string;
		createdAt: Date;
		updatedAt: Date;
		name: string;
	}[];
}) {
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [showDialog, setShowDialog] = useState(false);
	const [selectedTag, setSelectedTag] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const handleDelete = async () => {
		if (!selectedTag) return;

		setDeletingId(selectedTag.id);
		try {
			const result = await deleteTag(selectedTag.id);
			if (result?.error) {
				toast.error(result.error);
				setDeletingId(null);
			} else if (result?.success) {
				toast.success("Tag deleted successfully");
				window.location.reload();
			}
		} catch {
			toast.error("Failed to delete tag");
			setDeletingId(null);
			setShowDialog(false);
		}
	};

	return (
		<div className="rounded-md border bg-background">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Slug</TableHead>
						<TableHead>Posts</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{tags.map((tag) => (
						<TableRow key={tag.id}>
							<TableCell className="font-medium">
								{tag.name}
							</TableCell>
							<TableCell>{tag.slug}</TableCell>
							<TableCell>{tag._count.posts}</TableCell>
							<TableCell className="text-right">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										setSelectedTag({
											id: tag.id,
											name: tag.name,
										});
										setShowDialog(true);
									}}
									disabled={deletingId === tag.id}
								>
									<Trash className="h-4 w-4 text-destructive" />
								</Button>
							</TableCell>
						</TableRow>
					))}
					{tags.length === 0 && (
						<TableRow>
							<TableCell
								colSpan={4}
								className="text-center py-4 text-muted-foreground"
							>
								No tags found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the tag{" "}
							<span className="font-semibold text-[17px] text-primary">
								&quot;{selectedTag?.name}&quot;
							</span>
							. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={!!deletingId}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={!!deletingId}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deletingId ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
