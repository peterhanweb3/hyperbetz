"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { nanoid } from "nanoid";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DownlineEntry } from "@/types/affiliate/affiliate.types";
import { ReferralsSortOrder } from "@/hooks/affiliate/useAffiliateReferrals";
import { Users, TrendingUp, Calendar, Coins } from "lucide-react";
import { useTranslations } from "@/lib/locale-provider";

interface ReferralsTableProps {
	data: DownlineEntry[];
	totalRecords: number;
	isLoading: boolean;
	currentPage: number;
	sortOrder: ReferralsSortOrder;
	onPageChange: (page: number) => void;
	onSortChange: (order: ReferralsSortOrder) => void;
}

const TableSkeleton = () => (
	<>
		{[...Array(5)].map((_, i) => (
			<TableRow key={i} className="hover:bg-muted/30">
				<TableCell className="py-4">
					<div className="flex items-center space-x-3">
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-4 w-24" />
					</div>
				</TableCell>
				<TableCell className="py-4">
					<Skeleton className="h-4 w-20" />
				</TableCell>
				<TableCell className="py-4">
					<Skeleton className="h-4 w-28" />
				</TableCell>
				<TableCell className="py-4">
					<Skeleton className="h-4 w-28" />
				</TableCell>
				<TableCell className="py-4">
					<Skeleton className="h-4 w-24" />
				</TableCell>
				<TableCell className="py-4">
					<Skeleton className="h-4 w-28" />
				</TableCell>
				<TableCell className="py-4">
					<Skeleton className="h-6 w-16 rounded-full" />
				</TableCell>
			</TableRow>
		))}
	</>
);

const formatCurrency = (amount: number, token: string) => (
	<span className="font-mono text-sm">
		<span className="font-semibold text-primary">{amount.toFixed(2)}</span>
		<span className="ml-1 text-muted-foreground text-xs uppercase">
			{token}
		</span>
	</span>
);

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
};

const getTierBadge = (tier: string) => {
	const tierColors: { [key: string]: string } = {
		Bronze: "bg-chart-4/20 text-chart-4 border-chart-4/30",
		Silver: "bg-muted text-muted-foreground border-border",
		Gold: "bg-chart-1/20 text-chart-1 border-chart-1/30",
		Platinum: "bg-chart-3/20 text-chart-3 border-chart-3/30",
		Diamond: "bg-primary/20 text-primary border-primary/30",
	};

	return (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
				tierColors[tier] ||
				"bg-secondary text-secondary-foreground border-border"
			}`}
		>
			{tier}
		</span>
	);
};
const getInitials = (nickname: string) => {
	return nickname.substring(0, 2).toUpperCase();
};

export default function ReferralsTable({
	data,
	totalRecords,
	isLoading,
	currentPage,
	sortOrder,
	onPageChange,
	onSortChange,
}: ReferralsTableProps) {
	const totalPages = Math.ceil(totalRecords / 10);
	const t = useTranslations("affiliate.referrals");

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg">
							<Users className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="text-2xl font-semibold text-foreground">
								{t("title")}
							</h2>
							<p className="text-sm text-muted-foreground">
								{totalRecords} {t("totalReferrals")}
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Select
						value={sortOrder}
						onValueChange={(value: ReferralsSortOrder) =>
							onSortChange(value)
						}
					>
						<SelectTrigger className="w-[220px] bg-card border-border hover:bg-accent/50 transition-colors">
							<SelectValue placeholder={t("sort.placeholder")} />
						</SelectTrigger>
						<SelectContent className="bg-popover border-border">
							<SelectItem
								value="nickname_asc"
								className="focus:bg-accent focus:text-accent-foreground"
							>
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									{t("sort.nicknameAsc")}
								</div>
							</SelectItem>
							<SelectItem
								value="nickname_desc"
								className="focus:bg-accent focus:text-accent-foreground"
							>
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									{t("sort.nicknameDesc")}
								</div>
							</SelectItem>
							<SelectItem
								value="last_login"
								className="focus:bg-accent focus:text-accent-foreground"
							>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									{t("sort.lastLogin")}
								</div>
							</SelectItem>
							<SelectItem
								value="unclaimed_amount"
								className="focus:bg-accent focus:text-accent-foreground"
							>
								<div className="flex items-center gap-2">
									<TrendingUp className="h-4 w-4" />
									{t("sort.unclaimedAmount")}
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Table Container */}
			<div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
							<TableHead className="font-semibold text-foreground py-4 px-6">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									{t("table.nickname")}
								</div>
							</TableHead>
							<TableHead className="font-semibold text-foreground py-4">
								<div className="flex items-center gap-2">
									<TrendingUp className="h-4 w-4" />
									{t("table.totalWager")}
								</div>
							</TableHead>
							<TableHead className="font-semibold text-foreground py-4">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									{t("table.lastLogin")}
								</div>
							</TableHead>
							<TableHead className="font-semibold text-foreground py-4">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									{t("table.registered")}
								</div>
							</TableHead>
							<TableHead className="font-semibold text-foreground py-4">
								<div className="flex items-center gap-2">
									<Coins className="h-4 w-4" />
									{t("table.lastDeposit")}
								</div>
							</TableHead>
							<TableHead className="font-semibold text-foreground py-4">
								{t("table.depositDate")}
							</TableHead>
							<TableHead className="font-semibold text-foreground py-4">
								{t("table.tier")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableSkeleton />
						) : data.length > 0 ? (
							data.map((entry) => (
								<TableRow
									key={entry.nickname + nanoid()}
									className="hover:bg-accent/30 transition-colors border-b border-border/50 group"
								>
									<TableCell className="py-4 px-6">
										<div className="flex items-center space-x-3">
											<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
												<span className="text-xs font-semibold text-primary">
													{getInitials(
														entry.nickname
													)}
												</span>
											</div>
											<span className="font-medium text-foreground group-hover:text-primary transition-colors">
												{entry.nickname}
											</span>
										</div>
									</TableCell>
									<TableCell className="py-4">
										{formatCurrency(
											entry.total_wager,
											entry.token
										)}
									</TableCell>
									<TableCell className="py-4 text-muted-foreground">
										{formatDate(entry.last_login)}
									</TableCell>
									<TableCell className="py-4 text-muted-foreground">
										{formatDate(entry.date_registered)}
									</TableCell>
									<TableCell className="py-4">
										{formatCurrency(
											entry.last_deposit,
											entry.token
										)}
									</TableCell>
									<TableCell className="py-4 text-muted-foreground">
										{formatDate(entry.last_deposit_date)}
									</TableCell>
									<TableCell className="py-4">
										{getTierBadge(entry.tier.toString())}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-32 text-center"
								>
									<div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
										<Users className="h-8 w-8 opacity-50" />
										<div>
											<p className="font-medium">
												{t("empty.title")}
											</p>
											<p className="text-sm">
												{t("empty.subtitle")}
											</p>
										</div>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Enhanced Pagination */}
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
				<div className="text-sm text-muted-foreground">
					{t("pagination.showing", {
						from: data.length > 0 ? (currentPage - 1) * 10 + 1 : 0,
						to: Math.min(currentPage * 10, totalRecords),
						total: totalRecords,
					})}
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage <= 1}
						className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						{t("pagination.prev")}
					</Button>

					<div className="flex items-center gap-2">
						{Array.from(
							{ length: Math.min(5, totalPages) },
							(_, i) => {
								const pageNum =
									currentPage <= 3
										? i + 1
										: currentPage >= totalPages - 2
										? totalPages - 4 + i
										: currentPage - 2 + i;

								if (pageNum < 1 || pageNum > totalPages)
									return null;

								return (
									<Button
										key={pageNum}
										variant={
											currentPage === pageNum
												? "default"
												: "outline"
										}
										size="sm"
										onClick={() => onPageChange(pageNum)}
										className={`w-8 h-8 p-0 transition-colors ${
											currentPage === pageNum
												? "bg-primary text-foreground hover:bg-primary/90"
												: "border-border hover:bg-accent hover:text-accent-foreground"
										}`}
									>
										{pageNum}
									</Button>
								);
							}
						)}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages}
						className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						{t("pagination.next")}
					</Button>
				</div>
			</div>
		</div>
	);
}
