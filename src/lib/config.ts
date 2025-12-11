import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalanche } from "viem/chains";
import { http } from "viem";

// Custom Avalanche chain with private RPC
const avalancheWithPrivateRpc = {
  ...avalanche,
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL ||
          avalanche.rpcUrls.default.http[0],
      ],
    },
    public: {
      http: [
        process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL ||
          avalanche.rpcUrls.default.http[0],
      ],
    },
  },
};

export const config = getDefaultConfig({
  appName: "Senja",
  projectId: "my project id",
  chains: [avalancheWithPrivateRpc],
  transports: {
    [avalanche.id]: http(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL),
  },
  ssr: true,
});
