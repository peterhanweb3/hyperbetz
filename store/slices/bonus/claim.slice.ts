import { AppStateCreator } from "@/store/store";
import ApiService from "@/services/apiService";
import LocalStorageService from "@/services/localStorageService";
import { toast } from "sonner";

export interface BonusClaimState {
	isClaiming: boolean;
	lastClaimAmount: number | null;
	error: string | null;
}

export interface BonusClaimActions {
	claimBonus: () => Promise<number | null>;
	clearClaimState: () => void;
}

export type BonusClaimSlice = BonusClaimState & BonusClaimActions;

const initialState: BonusClaimState = {
	isClaiming: false,
	lastClaimAmount: null,
	error: null,
};

export const createBonusClaimSlice: AppStateCreator<BonusClaimSlice> = (
	set,
	get
) => ({
	...initialState,

	claimBonus: async () => {
		const storage = LocalStorageService.getInstance();
		const api = ApiService.getInstance();
		const user = storage.getUserData();
		const token = storage.getAuthToken();
		const username = user?.username;

		const claimState = get().bonus.claim;
		const bonusData = get().bonus.dashboard.bonusData;

		// Validation checks
		if (!username || !token || claimState.isClaiming || !bonusData) {
			return null;
		}

		set((state) => {
			state.bonus.claim.isClaiming = true;
			state.bonus.claim.error = null;
		});

		try {
			const response = await api.claimMemberBonus({ username }, token);

			if (response.error) {
				throw new Error(response.message);
			}

			// Update claim state
			set((state) => {
				state.bonus.claim.lastClaimAmount = response.amount_claimed;
			});

			// Show success message
			toast.success(
				`Successfully claimed ₹${response.amount_claimed.toFixed(2)}!`
			);

			// Refresh bonus data to reflect new available amount
			await get().bonus.dashboard.fetchData(true);

			// Return the claimed amount so caller can use it
			return response.amount_claimed;
		} catch (e) {
			const msg = e instanceof Error ? e.message : "Claim failed";
			set((state) => {
				state.bonus.claim.error = msg;
			});
			toast.error(msg);
			return null;
		} finally {
			set((state) => {
				state.bonus.claim.isClaiming = false;
			});
		}
	},

	clearClaimState: () => {
		set((state) => {
			state.bonus.claim.isClaiming = initialState.isClaiming;
			state.bonus.claim.lastClaimAmount = initialState.lastClaimAmount;
			state.bonus.claim.error = initialState.error;
		});
	},
});
