import { sanitizeAmountInput } from "@/lib/utils";

// Helper functions
const formatAmount = (amount: string) => {
	if (!amount) return "0.00";
	const num = parseFloat(amount);
	if (num === 0) return "0.00";
	if (num < 0.001) return "< 0.001";
	return sanitizeAmountInput(num.toString(), 6);
};

const formatUSD = (amount: string, price: string) => {
	if (!amount || !price) return "$0.00";
	const usdValue = parseFloat(amount) * parseFloat(price);
	if (usdValue < 0.01) return "< $0.01";
	return `$${usdValue.toFixed(2)}`;
};

export { formatAmount, formatUSD };
