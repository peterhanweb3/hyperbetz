import { AppStateCreator } from "@/store/store";
import {
	createBonusDashboardSlice,
	BonusDashboardSlice,
} from "./dashboard.slice";
import { createBonusRatesSlice, BonusRatesSlice } from "./rates.slice";
import { createBonusClaimSlice, BonusClaimSlice } from "./claim.slice";
import { createBonusDetailSlice, BonusDetailSlice } from "./detail.slice";
import { createBonusManagerSlice, BonusManagerSlice } from "./manager.slice";

export interface BonusSliceBranch {
	manager: BonusManagerSlice;
	dashboard: BonusDashboardSlice;
	rates: BonusRatesSlice;
	claim: BonusClaimSlice;
	detail: BonusDetailSlice;
}

export const createBonusSlice: AppStateCreator<BonusSliceBranch> = (
	...args
) => ({
	manager: createBonusManagerSlice(...args),
	dashboard: createBonusDashboardSlice(...args),
	rates: createBonusRatesSlice(...args),
	claim: createBonusClaimSlice(...args),
	detail: createBonusDetailSlice(...args),
});
