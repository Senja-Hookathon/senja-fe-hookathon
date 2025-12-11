export const formatUsdValue = (value: number): string => {
  return value > 0 ? value.toFixed(2) : "0.00";
};

export const formatTokenAmount = (
  amount: string | number,
  decimals: number = 4
): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return isNaN(num) ? "0.00" : num.toFixed(decimals);
};

export const formatExchangeRate = (rate: number | null): string => {
  return rate ? rate.toFixed(6) : "0.00";
};

export const parseTokenAmount = (
  amount: string,
  decimals: number
): bigint | null => {
  const amountFloat = parseFloat(amount);
  if (isNaN(amountFloat) || amountFloat <= 0) return null;

  return BigInt(Math.floor(amountFloat * Math.pow(10, decimals)));
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};
