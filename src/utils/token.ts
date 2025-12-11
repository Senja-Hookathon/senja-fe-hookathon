import { formatUnits, parseUnits } from "viem";

export type HexAddress = `0x${string}`;

/**
 * Common token decimals for well-known tokens
 */
export const COMMON_TOKEN_DECIMALS: Record<string, number> = {
  ETH: 18,
  WETH: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
  WBTC: 8,
};

/**
 * Get decimals for a known token symbol, or return default
 * @param symbol - Token symbol
 * @param defaultDecimals - Default decimals if symbol not found (default: 18)
 * @returns Number of decimals
 */
export function getDecimalsBySymbol(
  symbol: string,
  defaultDecimals: number = 18
): number {
  return COMMON_TOKEN_DECIMALS[symbol.toUpperCase()] || defaultDecimals;
}

/**
 * Parse amount to BigInt with automatic decimal detection
 * @param amount - Amount as string
 * @param decimals - Token decimals (if known)
 * @param symbol - Token symbol (optional, for automatic decimal detection)
 * @returns BigInt representation
 */
export function parseTokenAmount(
  amount: string,
  decimals?: number,
  symbol?: string
): bigint {
  try {
    const tokenDecimals =
      decimals ?? (symbol ? getDecimalsBySymbol(symbol) : 18);
    return parseUnits(amount, tokenDecimals);
  } catch (error) {
    console.error("Error parsing token amount:", error);
    return BigInt(0);
  }
}

/**
 * Format BigInt to readable amount with automatic decimal handling
 * @param amount - Amount as BigInt
 * @param decimals - Token decimals (if known)
 * @param symbol - Token symbol (optional, for automatic decimal detection)
 * @param maxDecimals - Maximum decimals to display
 * @returns Formatted string
 */
export function formatTokenAmount(
  amount: bigint,
  decimals?: number,
  symbol?: string,
  maxDecimals?: number
): string {
  try {
    const tokenDecimals =
      decimals ?? (symbol ? getDecimalsBySymbol(symbol) : 18);
    const formatted = formatUnits(amount, tokenDecimals);

    if (maxDecimals !== undefined) {
      const num = parseFloat(formatted);
      return num.toFixed(maxDecimals);
    }

    return formatted;
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return "0";
  }
}

/**
 * Format token amount with symbol
 * @param amount - Amount as BigInt
 * @param decimals - Token decimals
 * @param symbol - Token symbol
 * @param maxDecimals - Maximum decimals to display
 * @returns Formatted string with symbol
 */
export function formatTokenWithSymbol(
  amount: bigint,
  decimals: number,
  symbol: string,
  maxDecimals: number = 4
): string {
  const formatted = formatTokenAmount(amount, decimals, symbol, maxDecimals);
  const withCommas = parseFloat(formatted).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
  return `${withCommas} ${symbol}`;
}

/**
 * Validate if amount is valid for token operations
 * @param amount - Amount as string
 * @returns true if valid, false otherwise
 */
export function isValidTokenAmount(amount: string): boolean {
  if (!amount || amount.trim() === "") return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Get maximum amount from balance (useful for "MAX" button)
 * @param balance - Balance as BigInt
 * @param decimals - Token decimals
 * @param reserveGas - Whether to reserve some for gas (for native tokens)
 * @returns Maximum usable amount as string
 */
export function getMaxAmount(
  balance: bigint,
  decimals: number,
  reserveGas: boolean = false
): string {
  if (balance === BigInt(0)) return "0";

  let maxBalance = balance;

  // Reserve ~0.01 for gas if it's a native token
  if (reserveGas && decimals === 18) {
    const gasReserve = parseUnits("0.01", decimals);
    maxBalance = balance > gasReserve ? balance - gasReserve : BigInt(0);
  }

  return formatUnits(maxBalance, decimals);
}
