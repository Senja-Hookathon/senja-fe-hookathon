import { formatUnits, parseUnits } from "viem";

/**
 * Convert a string amount to BigInt based on token decimals
 * @param amount - The amount as a string (e.g., "100.5")
 * @param decimals - The token decimals (e.g., 18 for most ERC20 tokens)
 * @returns BigInt representation of the amount
 *
 * For dynamic decimal detection, use parseTokenAmount from @/utils/token
 */
export function parseAmountToBigInt(amount: string, decimals: number): bigint {
  try {
    return parseUnits(amount, decimals);
  } catch (error) {
    console.error("Error parsing amount to BigInt:", error);
    return BigInt(0);
  }
}

/**
 * Convert a BigInt amount to a readable string based on token decimals
 * @param amount - The amount as BigInt
 * @param decimals - The token decimals (e.g., 18 for most ERC20 tokens)
 * @param maxDecimals - Maximum number of decimals to display (optional)
 * @returns Formatted string representation of the amount
 *
 * For dynamic decimal detection, use formatTokenAmount from @/utils/token
 */
export function formatBigIntToAmount(
  amount: bigint,
  decimals: number,
  maxDecimals?: number
): string {
  try {
    const formatted = formatUnits(amount, decimals);

    if (maxDecimals !== undefined) {
      const num = parseFloat(formatted);
      return num.toFixed(maxDecimals);
    }

    return formatted;
  } catch (error) {
    console.error("Error formatting BigInt to amount:", error);
    return "0";
  }
}

/**
 * Format a number with commas for better readability
 * @param value - The value to format
 * @param decimals - Number of decimal places to show
 * @returns Formatted string with commas
 */
export function formatNumberWithCommas(
  value: string | number,
  decimals: number = 2
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Shorten an address for display
 * @param address - The full address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  if (address.length < chars * 2 + 2) return address;

  return `${address.substring(0, chars + 2)}...${address.substring(
    address.length - chars
  )}`;
}
