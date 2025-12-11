import { Info } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { formatExchangeRate } from "@/lib/utils/formatters";

interface ExchangeRateDisplayProps {
  fromSymbol: string;
  toSymbol: string;
  rate: number | null;
  loading: boolean;
}

export const ExchangeRateDisplay = ({
  fromSymbol,
  toSymbol,
  rate,
  loading,
}: ExchangeRateDisplayProps) => {
  return (
    <div className="flex justify-between items-center px-2 py-2 text-xs font-medium text-muted-foreground">
      <div className="flex items-center gap-1">
        <span>
          1 {fromSymbol} ={" "}
          {loading ? (
            <Spinner size="sm" />
          ) : rate ? (
            `${formatExchangeRate(rate)} ${toSymbol}`
          ) : (
            <span className="text-red-400">N/A</span>
          )}
        </span>
        <Info className="w-3 h-3" />
      </div>
    </div>
  );
};
