import { Network, TokensConfig, TokenSymbol, TokenConfig } from "./types";
export const TOKENS: Record<Network, TokensConfig> = {
  [Network.Avalanche]: {
    [TokenSymbol.AVAX]: {
      name: "AVAX",
      symbol: "AVAX",
      logo: "/token/avax.svg",
      decimals: 18,
      address: "0x0000000000000000000000000000000000000001",
      oftAddress: "0x0000000000000000000000000000000000000000",
    },
    [TokenSymbol.USDT]: {
      name: "Tether USD",
      symbol: "USDT",
      logo: "/token/usdt.png",
      decimals: 6,
      address: "0x3De8C22F6b84C575429c1B9cbf5bdDd49cf129fC", // mock usdt
      oftAddress: "0xcDA0BeBC32BEC4813e6307a3d7774702Fdf6392f",
    },
    [TokenSymbol.USDC]: {
      name: "USD Coin",
      symbol: "USDC",
      logo: "/token/usdc.png",
      decimals: 6,
      address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // mock usdc
      oftAddress: "0xF6d95EeFF99E171Bb150d736eb2BE23c9cF6a6ef",
    },
    [TokenSymbol.WETH]: {
      name: "Wrapped Ether",
      symbol: "WETH",
      logo: "/token/weth.png",
      decimals: 18,
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", // mock weth
      oftAddress: "0x46dA9F76c20a752132dDaefD2B14870e0A152D71",
    },
  },
};

// get token by network and symbol
export const getToken = (
  network: Network,
  symbol: TokenSymbol
): TokenConfig => {
  return TOKENS[network][symbol];
};

// get token address by network and symbol
export const getTokenAddress = (
  network: Network,
  symbol: TokenSymbol
): string => {
  return TOKENS[network][symbol].address;
};

// get token OFT address for cross-chain (LayerZero)
export const getTokenOftAddress = (
  network: Network,
  symbol: TokenSymbol
): string | undefined => {
  return TOKENS[network][symbol].oftAddress;
};

// Get all tokens for a specific network
export const getAllTokens = (network: Network): TokensConfig => {
  return TOKENS[network];
};

// get all tokens
export const getTokensArray = (network: Network): TokenConfig[] => {
  const networkTokens = TOKENS[network];
  if (!networkTokens) {
    console.warn(`No tokens found for network: ${network}`);
    return [];
  }
  return Object.values(networkTokens);
};
