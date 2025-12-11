import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatUsdValue } from "@/lib/utils/formatters";
import type { TokenConfig } from "@/lib/addresses/types";

interface TokenInputProps {
  label: string;
  amount: string;
  onAmountChange: (value: string) => void;
  token: TokenConfig | null;
  onTokenSelect: () => void;
  usdValue: number;
  balance: string;
  balanceLoading: boolean;
  readOnly?: boolean;
  showMaxButton?: boolean;
  onMaxClick?: () => void;
}

export const TokenInput = ({
  label,
  amount,
  onAmountChange,
  token,
  onTokenSelect,
  usdValue,
  balance,
  balanceLoading,
  readOnly = false,
  showMaxButton = false,
  onMaxClick,
}: TokenInputProps) => {
  return (
    <div className="space-y-3 rounded-none border border-border bg-card p-4">
      <div className="flex justify-between mb-3">
        <span className="text-muted-foreground font-medium text-sm">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={amount}
          onChange={(e) => !readOnly && onAmountChange(e.target.value)}
          placeholder="0"
          readOnly={readOnly}
          className={`w-full bg-transparent text-4xl font-medium outline-none placeholder:text-muted-foreground/30 ${
            readOnly ? "text-muted-foreground cursor-not-allowed" : ""
          }`}
        />
        <Button
          variant="secondary"
          onClick={onTokenSelect}
          className="gap-2 rounded-none h-10 px-3 min-w-[110px] justify-between font-semibold shadow-sm hover:bg-background border border-transparent hover:border-border transition-all"
        >
          {token ? (
            <div className="flex items-center gap-2">
              <div className="relative w-5 h-5 rounded-full overflow-hidden">
                <Image
                  src={token.logo}
                  alt={token.symbol}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-lg">{token.symbol}</span>
            </div>
          ) : (
            <span className="text-sm">Select Token</span>
          )}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </div>

      <div className="flex justify-between mt-3 h-5 items-center">
        <span className="text-sm text-muted-foreground">
          ${formatUsdValue(usdValue)}
        </span>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Balance: {balanceLoading ? <Spinner size="sm" /> : balance}
          </span>
          {showMaxButton && onMaxClick && (
            <button
              onClick={onMaxClick}
              className="text-primary text-xs font-semibold hover:underline"
            >
              Max
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
