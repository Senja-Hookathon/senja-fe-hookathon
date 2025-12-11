export const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
};

export const formatLtvFromRaw = (ltvRaw: string): string => {
  const num = Number(ltvRaw);
  if (!Number.isFinite(num)) return "-";

  const ratio = num / 1e18;
  const pct = ratio * 100;
  return `${pct.toFixed(0)}%`;
};
