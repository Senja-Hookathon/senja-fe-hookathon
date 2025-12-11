import { waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/lib/config";

/**
 * Wait for transaction receipt with retry logic for Avalanche RPC issues
 * Handles "cannot query unfinalized data" errors by retrying with longer polling interval
 */
export const waitForTxReceipt = async (hash: `0x${string}`) => {
  try {
    return await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
      pollingInterval: 1000,
      timeout: 60_000,
    });
  } catch (error: unknown) {
    // If error is about unfinalized data, wait and retry with slower polling
    if (error instanceof Error && error.message?.includes("unfinalized")) {
      console.warn(
        "⚠️ Unfinalized data error, retrying with slower polling..."
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return await waitForTransactionReceipt(config, {
        hash,
        confirmations: 1,
        pollingInterval: 2000,
        timeout: 30_000,
      });
    }
    throw error;
  }
};
