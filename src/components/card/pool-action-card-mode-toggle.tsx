import { Button } from "@/components/ui/button";
import type { Mode, Tab } from "./pool-action-card.types";

interface ModeToggleProps {
  activeTab: Tab;
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export const ModeToggle = ({ activeTab, mode, onChange }: ModeToggleProps) => {
  if (activeTab !== "Supply" && activeTab !== "Withdraw") {
    return null;
  }

  const isWithdraw = activeTab === "Withdraw";

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={() => onChange("liquidity")}
        className={[
          "h-8 flex-1 rounded-none text-xs font-medium",
          mode === "liquidity"
            ? "bg-pink-600 text-white hover:bg-pink-600"
            : "bg-neutral-900 text-neutral-200 hover:bg-neutral-800",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isWithdraw ? "Withdraw Liquidity" : "Supply Liquidity"}
      </Button>
      <Button
        type="button"
        onClick={() => onChange("collateral")}
        className={[
          "h-8 flex-1 rounded-none text-xs font-medium",
          mode === "collateral"
            ? "bg-pink-600 text-white hover:bg-pink-600"
            : "bg-neutral-900 text-neutral-200 hover:bg-neutral-800",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isWithdraw ? "Withdraw Collateral" : "Supply Collateral"}
      </Button>
    </div>
  );
};
