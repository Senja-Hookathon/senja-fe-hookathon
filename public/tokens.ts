import { TOKENS as NETWORK_TOKENS } from "@/lib/addresses/tokens";
import { Network, TokenConfig, TokenSymbol } from "@/lib/addresses/types";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
}

export type ChainName = Network;

export const CURRENT_CHAIN: ChainName = Network.Avalanche;

const buildTokensByAddress = (
  network: Network
): Record<string, Token & { address: string }> => {
  const networkTokens = NETWORK_TOKENS[network];
  const byAddress: Record<string, Token & { address: string }> = {};

  Object.values(networkTokens).forEach((token: TokenConfig) => {
    byAddress[token.address.toLowerCase()] = {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoUrl: token.logo,
    };
  });

  return byAddress;
};

export const TOKENS: Record<string, Token & { address: string }> =
  buildTokensByAddress(CURRENT_CHAIN);

export const getTokenByAddress = (
  address: string
): (Token & { address: string }) | null => {
  if (!address) return null;
  const normalizedAddress = address.toLowerCase();
  return TOKENS[normalizedAddress] || null;
};

export const formatTokenSymbol = (address: string): string => {
  if (!address) return "";
  const token = getTokenByAddress(address);
  return token?.symbol || `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getTokenLogo = (address: string): string => {
  const token = getTokenByAddress(address);
  return token?.logoUrl || "/placeholder-token.png";
};

export const getTokenAddress = (symbol: string): string | null => {
  const tokenSymbol = symbol as TokenSymbol;
  const tokenConfig = NETWORK_TOKENS[CURRENT_CHAIN][tokenSymbol];
  return tokenConfig?.address ?? null;
};
