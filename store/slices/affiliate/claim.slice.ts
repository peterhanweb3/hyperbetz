import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { toast } from "sonner";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";

export interface ClaimState {
	isClaiming: boolean;
	lastClaimAmount: number | null;
	error: string | null;
}

export interface ClaimActions {
	claimBonus: () => Promise<void>;
	clearClaimState: () => void;
}

export type ClaimSlice = ClaimState & ClaimActions;

const initialState: ClaimState = {
	isClaiming: false,
	lastClaimAmount: null,
	error: null,
};

export const createClaimSlice: AppStateCreator<ClaimSlice> = (set, get) => ({
	...initialState,

	claimBonus: async () => {
		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();
		const user = storage.getUserData();
		const token = getAuthToken();
		const username = user?.username;

		const claimState = get().affiliate.claim;
		const downlineData = get().affiliate.downline.data;

		// Validation checks
		if (
			!username ||
			!token ||
			claimState.isClaiming ||
			!downlineData ||
			downlineData.total_unclaim <= 0
		) {
			return;
		}

		set((state) => {
			state.affiliate.claim.isClaiming = true;
			state.affiliate.claim.error = null;
		});

		try {
			const response = await api.claimAffiliateBonus({ username }, token);

			if (response.error) {
				throw new Error(response.message);
			}

			// Update claim state
			set((state) => {
				state.affiliate.claim.lastClaimAmount = response.amount_claimed;
			});

			// Show success message
			toast.success(
				`Successfully claimed ₹${response.amount_claimed.toFixed(2)}!`
			);

			// Refresh affiliate data to reflect new unclaimed amount
			await get().affiliate.manager.refreshAll(true);
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Claim failed";
			set((state) => {
				state.affiliate.claim.error = msg;
			});
			toast.error(msg);
		} finally {
			set((state) => {
				state.affiliate.claim.isClaiming = false;
			});
		}
	},

	clearClaimState: () => {
		set((state) => {
			state.affiliate.claim.isClaiming = initialState.isClaiming;
			state.affiliate.claim.lastClaimAmount =
				initialState.lastClaimAmount;
			state.affiliate.claim.error = initialState.error;
		});
	},
});
