export const helperAbi = [
  {
    inputs: [{ internalType: "address", name: "_factory", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "uint16", name: "optionType", type: "uint16" }],
    name: "InvalidOptionType",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint8", name: "bits", type: "uint8" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "SafeCastOverflowedUintDowncast",
    type: "error",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
    ],
    name: "getAPY",
    outputs: [
      { internalType: "uint256", name: "supplyAPY", type: "uint256" },
      { internalType: "uint256", name: "borrowAPY", type: "uint256" },
      { internalType: "uint256", name: "utilizationRate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
    ],
    name: "getBorrowAPY",
    outputs: [{ internalType: "uint256", name: "borrowAPY", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "getCollateralBalance",
    outputs: [
      { internalType: "uint256", name: "collateralBalance", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_tokenIn", type: "address" },
      { internalType: "address", name: "_tokenOut", type: "address" },
      { internalType: "uint256", name: "_amountIn", type: "uint256" },
      { internalType: "address", name: "_position", type: "address" },
    ],
    name: "getExchangeRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_oftAddress", type: "address" },
      { internalType: "uint32", name: "_dstEid", type: "uint32" },
      { internalType: "address", name: "_toAddress", type: "address" },
      { internalType: "uint256", name: "_tokensToSend", type: "uint256" },
    ],
    name: "getFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "getHealthFactor",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
    ],
    name: "getLendingPoolMetrics",
    outputs: [
      { internalType: "uint256", name: "supplyAPY", type: "uint256" },
      { internalType: "uint256", name: "borrowAPY", type: "uint256" },
      { internalType: "uint256", name: "utilizationRate", type: "uint256" },
      { internalType: "uint256", name: "totalSupplyAssets", type: "uint256" },
      { internalType: "uint256", name: "totalBorrowAssets", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "getMaxBorrowAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
    ],
    name: "getRouter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
    ],
    name: "getSupplyAPY",
    outputs: [{ internalType: "uint256", name: "supplyAPY", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_token", type: "address" }],
    name: "getTokenValue",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
    ],
    name: "getTotalLiquidity",
    outputs: [
      { internalType: "uint256", name: "totalLiquidity", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_lendingPool", type: "address" },
    ],
    name: "getUtilizationRate",
    outputs: [
      { internalType: "uint256", name: "utilizationRate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_factory", type: "address" }],
    name: "setFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
