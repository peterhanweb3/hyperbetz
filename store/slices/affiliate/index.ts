import { AppStateCreator } from "@/store/store";
import { createDownlineSlice, DownlineSlice } from "./downline.slice";
import { createRatesSlice, RatesSlice } from "./rates.slice";
import { createClaimSlice, ClaimSlice } from "./claim.slice";
import { createReferralsSlice, ReferralsSlice } from "./referrals.slice";
import {
	AffiliateDashboardSlice,
	createAffiliateDashboardSlice,
} from "./dashboard.slice";

export interface AffiliateSliceBranch {
	downline: DownlineSlice;
	rates: RatesSlice;
	claim: ClaimSlice;
	referrals: ReferralsSlice;
	dashboard: AffiliateDashboardSlice;
	// future: history, stats slices
}

export const createAffiliateSlice: AppStateCreator<AffiliateSliceBranch> = (
	...args
) => ({
	downline: createDownlineSlice(...args),
	rates: createRatesSlice(...args),
	claim: createClaimSlice(...args),
	referrals: createReferralsSlice(...args),
	dashboard: createAffiliateDashboardSlice(...args),
});
