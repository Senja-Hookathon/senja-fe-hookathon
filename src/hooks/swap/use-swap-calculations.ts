import { useMemo } from "react";
import type { TokenConfig } from "@/lib/addresses/types";

export const useSwapCalculations = (
  inputAmount: string,
  exchangeRate: number | null,
  inputToken: TokenConfig | null,
  outputToken: TokenConfig | null
) => {
  const calculatedOutputAmount = useMemo(() => {
    if (!inputAmount || !exchangeRate || isNaN(parseFloat(inputAmount))) {
      return "";
    }
    const output = parseFloat(inputAmount) * exchangeRate;
    return output.toFixed(6);
  }, [inputAmount, exchangeRate]);

  const inputUsdValue = useMemo(() => {
    if (!inputAmount || !exchangeRate) return 0;
    const amount = parseFloat(inputAmount);
    if (isNaN(amount)) return 0;

    const isOutputStablecoin = ["USDC", "USDT", "DAI"].includes(
      outputToken?.symbol || ""
    );
    return isOutputStablecoin ? amount * exchangeRate : 0;
  }, [inputAmount, exchangeRate, outputToken]);

  const outputUsdValue = useMemo(() => {
    if (!calculatedOutputAmount) return 0;
    const amount = parseFloat(calculatedOutputAmount);
    if (isNaN(amount)) return 0;

    const isOutputStablecoin = ["USDC", "USDT", "DAI"].includes(
      outputToken?.symbol || ""
    );
    return isOutputStablecoin ? amount : 0;
  }, [calculatedOutputAmount, outputToken]);

  return {
    calculatedOutputAmount,
    inputUsdValue,
    outputUsdValue,
  };
};
