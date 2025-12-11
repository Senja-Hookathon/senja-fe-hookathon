import { useQuery } from "@tanstack/react-query";

interface BinanceTickerResponse {
  symbol: string;
  price: string;
}

// Map token symbols to Binance trading pairs
const TOKEN_PAIR_MAP: Record<string, string> = {
  // ETH pairs
  "WETH-USDC": "ETHUSDT",
  "WETH-USDT": "ETHUSDT",
  "ETH-USDC": "ETHUSDT",
  "ETH-USDT": "ETHUSDT",

  // BTC pairs
  "WBTC-USDC": "BTCUSDT",
  "WBTC-USDT": "BTCUSDT",
  "BTC-USDC": "BTCUSDT",
  "BTC-USDT": "BTCUSDT",

  // Stablecoin pairs
  "USDC-USDT": "USDCUSDT",
  "USDT-USDC": "USDCUSDT",
  "DAI-USDC": "DAIUSDT",
  "USDC-DAI": "DAIUSDT",

  // AVAX pairs
  "WAVAX-USDC": "AVAXUSDT",
  "WAVAX-USDT": "AVAXUSDT",
  "AVAX-USDC": "AVAXUSDT",
  "AVAX-USDT": "AVAXUSDT",
};

// Normalize token symbols (remove W prefix for wrapped tokens)
const normalizeSymbol = (symbol: string): string => {
  return symbol.replace(/^W/, ""); // WETH -> ETH, WBTC -> BTC, WAVAX -> AVAX
};

// Get Binance symbol from token pair
const getBinanceSymbol = (
  fromToken: string,
  toToken: string
): string | null => {
  const normalizedFrom = normalizeSymbol(fromToken);
  const normalizedTo = normalizeSymbol(toToken);

  // Try direct mapping
  const pairKey = `${fromToken}-${toToken}`;
  if (TOKEN_PAIR_MAP[pairKey]) {
    return TOKEN_PAIR_MAP[pairKey];
  }

  // Try normalized mapping
  const normalizedKey = `${normalizedFrom}-${normalizedTo}`;
  if (TOKEN_PAIR_MAP[normalizedKey]) {
    return TOKEN_PAIR_MAP[normalizedKey];
  }

  // Try reverse pair
  const reversePairKey = `${toToken}-${fromToken}`;
  if (TOKEN_PAIR_MAP[reversePairKey]) {
    return TOKEN_PAIR_MAP[reversePairKey];
  }

  // Default: construct symbol (e.g., ETHUSDT)
  if (normalizedTo === "USDC" || normalizedTo === "USDT") {
    return `${normalizedFrom}USDT`;
  }

  return null;
};

// Fetch price from Binance API
const fetchBinancePrice = async (
  fromToken: string,
  toToken: string
): Promise<number | null> => {
  const binanceSymbol = getBinanceSymbol(fromToken, toToken);

  if (!binanceSymbol) {
    console.warn(`⚠️ No Binance mapping for ${fromToken}/${toToken}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data: BinanceTickerResponse = await response.json();
    const price = parseFloat(data.price);

    // If we need to invert the price (e.g., USDC/ETH instead of ETH/USDC)
    const normalizedTo = normalizeSymbol(toToken);
    const shouldInvert = binanceSymbol.startsWith(normalizedTo);

    return shouldInvert ? 1 / price : price;
  } catch (error) {
    console.error("❌ Failed to fetch Binance price:", error);
    return null;
  }
};

interface UseExchangeRateParams {
  fromToken?: string;
  toToken?: string;
  enabled?: boolean;
}

export const useExchangeRate = ({
  fromToken,
  toToken,
  enabled = true,
}: UseExchangeRateParams) => {
  return useQuery({
    queryKey: ["exchangeRate", fromToken, toToken],
    queryFn: async () => {
      if (!fromToken || !toToken) {
        return null;
      }

      // If same token, rate is 1
      if (fromToken === toToken) {
        return 1;
      }

      const rate = await fetchBinancePrice(fromToken, toToken);

      console.log("💱 Exchange Rate Debug:", {
        from: fromToken,
        to: toToken,
        rate,
        formatted: rate
          ? `1 ${fromToken} = ${rate.toFixed(6)} ${toToken}`
          : "N/A",
      });

      return rate;
    },
    enabled: enabled && !!fromToken && !!toToken,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every 60 seconds
    retry: 3,
    retryDelay: 1000,
  });
};

export default useExchangeRate;
