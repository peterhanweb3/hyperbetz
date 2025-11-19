import { CategoryWithIcon } from "@/types/games/categoryIcon.types";
import { AppStateCreator } from "@/store/store";
import { safeLocalStorage } from "@/lib/utils/safe-storage";

type loadingStatus = "idle" | "loading" | "success" | "error";

interface CategoryListInitialState {
	categories: CategoryWithIcon[];
	status: loadingStatus;
	error: string | null;
}

interface CategoryListActions {
	setCategoriesList: (categories: CategoryWithIcon[]) => void;
}

const initialState: CategoryListInitialState = {
	categories: [],
	status: "idle",
	error: null,
};

const CATEGORIES_LIST_LOCAL_STORAGE_KEY = "categories-list-cache";

const createCategoryListSlice: AppStateCreator<
	CategoryListInitialState & CategoryListActions
> = (set) => ({
	...initialState,

	// --- ACTION 1: The Simple Setter ---
	setCategoriesList: (categories) => {
		set((state) => {
			if (!Array.isArray(categories)) {
				console.error(
					"setCategoriesList received non-array data:",
					categories
				);
				state.game.categories.status = "error";
				state.game.categories.error = "Invalid data format received.";
				return;
			}
			state.game.categories.categories = categories;
			state.game.categories.status = "success";
			state.game.categories.error = null;
		});

		const newCacheData = { categories: categories, timestamp: Date.now() };
		// console.log("Storing categories in localStorage:", newCacheData);
		safeLocalStorage.setItem(
			CATEGORIES_LIST_LOCAL_STORAGE_KEY,
			JSON.stringify(newCacheData)
		);
	},
});

export { createCategoryListSlice };
export type { CategoryListActions, CategoryListInitialState };
