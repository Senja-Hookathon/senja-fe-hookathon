export const TABS = ["Supply", "Borrow", "Repay", "Withdraw"] as const;

export type Tab = (typeof TABS)[number];

export type Mode = "liquidity" | "collateral";

export interface PoolActionCardProps {
  poolAddress: string;
  ltv: string;
  collateralSymbol?: string;
  borrowSymbol?: string;
  collateralLogoUrl?: string;
  borrowLogoUrl?: string;
  collateralTokenAddress: string;
  borrowTokenAddress: string;
  collateralDecimals: number;
  borrowDecimals: number;
  borrowOftAddress?: string; // OFT address for crosschain borrow
}
