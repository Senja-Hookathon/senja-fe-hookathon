import type { Mode, Tab } from "./pool-action-card.types";

export const resolveAssetSymbol = (
  activeTab: Tab,
  mode: Mode,
  collateralSymbol?: string,
  borrowSymbol?: string,
): string => {
  if (activeTab === "Supply") {
    return mode === "collateral"
      ? collateralSymbol ?? "Collateral"
      : borrowSymbol ?? "Borrow";
  }

  if (activeTab === "Borrow" || activeTab === "Repay") {
    return borrowSymbol ?? "Borrow";
  }

  if (activeTab === "Withdraw") {
    return mode === "liquidity"
      ? borrowSymbol ?? "Borrow"
      : collateralSymbol ?? "Collateral";
  }

  return "Asset";
};

export const resolveAssetLogo = (
  activeTab: Tab,
  mode: Mode,
  collateralLogoUrl?: string,
  borrowLogoUrl?: string,
): string | undefined => {
  if (activeTab === "Supply") {
    return mode === "collateral" ? collateralLogoUrl : borrowLogoUrl;
  }

  if (activeTab === "Borrow" || activeTab === "Repay") {
    return borrowLogoUrl;
  }

  if (activeTab === "Withdraw") {
    return mode === "liquidity" ? borrowLogoUrl : collateralLogoUrl;
  }

  return undefined;
};

export const resolveActionLabel = (activeTab: Tab): string => {
  if (activeTab === "Supply") return "Supply"; 
  if (activeTab === "Withdraw") return "Withdraw";
  if (activeTab === "Borrow") return "Borrow";
  if (activeTab === "Repay") return "Repay";
  return activeTab;
};
