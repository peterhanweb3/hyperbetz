"use client";

import { useWithdraw } from "@/hooks/walletProvider/withdrawal/useWithdraw";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Import all our specialized child components
import { WithdrawTokenSelector } from "./withdraw-token-selector";
import { WithdrawAmountInput } from "./withdraw-amount-input";
// import { WithdrawAddressInput } from "./withdraw-address-input";
import { WithdrawSummary } from "./withdraw-summary";
import { WithdrawTransactionPending } from "./withdraw-transaction-pending";
import { WithdrawReservedModal } from "./withdraw-reserved-modal"; // <-- THE MISSING MODAL

export const WithdrawPanel = () => {
	const {
		// State
		withdrawAmount,
		selectedToken,
		fee,
		totalPayout,
		maxWithdrawAmount,
		pendingStatus,
		timeLeft,
		// isLoading,
		// isAddressValid,
		// withdrawAddress,
		isWithdrawalSuccessful,
		withdrawTxHash,
		isBalanceInsufficient,
		isBelowMinimum,
		isNetworkSupported,
		availableTokens,
		isLoadingTokens,
		minWithdrawAmount,
		showReservedModal,
		// Actions
		handleAmountChange,
		// handleAddressChange,
		setMaxAmount,
		updateSelectedToken,
		executeWithdraw,
		resetPage,
		setShowingConfetti,
		setShowReservedModal,
		// UI Helpers
		getButtonText,
		isWithdrawDisabled,
	} = useWithdraw();

	return (
		<>
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Withdraw</CardTitle>
					<CardDescription>
						Withdraw funds to your personal wallet.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* --- STATE 1: Transaction is Pending or Successful --- */}
					{pendingStatus || isWithdrawalSuccessful ? (
						<WithdrawTransactionPending
							transactionHash={withdrawTxHash}
							timeLeft={timeLeft}
							isSuccessful={isWithdrawalSuccessful}
							onNewWithdrawal={resetPage}
							setShowingConfetti={setShowingConfetti}
						/>
					) : (
						// --- STATE 2: Standard Withdrawal Form ---
						<>
							{!isNetworkSupported && (
								<Alert variant="destructive">
									<Terminal className="h-4 w-4" />
									<AlertTitle>
										Network Not Supported
									</AlertTitle>
									<AlertDescription>
										Withdrawals are not available on the
										currently connected network.
									</AlertDescription>
								</Alert>
							)}
							<WithdrawTokenSelector
								tokens={availableTokens}
								isLoading={isLoadingTokens}
								selectedToken={selectedToken}
								onSelectToken={updateSelectedToken}
							/>
							<WithdrawAmountInput
								amount={withdrawAmount}
								onAmountChange={(val) =>
									handleAmountChange(val, minWithdrawAmount)
								}
								onSetMax={setMaxAmount}
								maxAmount={maxWithdrawAmount}
								tokenSymbol={selectedToken?.token_symbol}
								isInsufficient={isBalanceInsufficient}
								isBelowMinimum={isBelowMinimum}
								minAmount={minWithdrawAmount}
							/>
							{/* <WithdrawAddressInput
								address={withdrawAddress}
								onAddressChange={handleAddressChange}
								isAddressValid={isAddressValid}
							/> */}
							<WithdrawSummary
								fee={fee}
								totalPayout={totalPayout}
								tokenSymbol={selectedToken?.token_symbol}
							/>
						</>
					)}
				</CardContent>

				<CardFooter>
					{!(pendingStatus || isWithdrawalSuccessful) && (
						<Button
							onClick={executeWithdraw}
							disabled={isWithdrawDisabled()}
							className="w-full"
						>
							{getButtonText()}
						</Button>
					)}
				</CardFooter>
			</Card>

			{/* --- STATE 3: The "Reserved" Modal --- */}
			<WithdrawReservedModal
				isOpen={showReservedModal}
				onClose={() => setShowReservedModal(false)}
			/>
		</>
	);
};
