export type Address = `0x${string}`;

export enum Network {
  Avalanche = "avalanche",
}

export interface TokenConfig {
  name: string;
  symbol: string;
  logo: string;
  decimals: number;
  address: Address;
  oftAddress?: Address; // OFT address for LayerZero cross-chain
}

export enum TokenSymbol {
  AVAX = "AVAX",
  USDT = "USDT",
  USDC = "USDC",
  WETH = "WETH",
}

export type TokensConfig = {
  [key in TokenSymbol]: TokenConfig;
};

export interface ContractAddresses {
  FACTORY: Address;
  HELPER: Address;
}
