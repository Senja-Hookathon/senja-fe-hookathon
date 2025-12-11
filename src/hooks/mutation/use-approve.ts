"use client";
import { useState, useEffect, useRef } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { erc20Abi } from "viem";
import { parseAmountToBigInt } from "@/utils/format";

export type HexAddress = `0x${string}`;

interface ApproveParams {
  tokenAddress: HexAddress;
  spenderAddress: HexAddress;
  amount: string;
  decimals: number;
}

export const useApprove = (onSuccess?: (txHash?: HexAddress) => void) => {
  const [txHash, setTxHash] = useState<HexAddress | undefined>();
  const processedTxRef = useRef<Set<string>>(new Set());
  const { address } = useConnection();

  const approve = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxSuccess && txHash && !processedTxRef.current.has(txHash)) {
      processedTxRef.current.add(txHash);
      if (onSuccess) {
        onSuccess(txHash);
      }
    }
  }, [isTxSuccess, txHash, onSuccess]);

  const mutate = ({
    tokenAddress,
    spenderAddress,
    amount,
    decimals,
  }: ApproveParams) => {
    if (!address) {
      console.error("Wallet not connected");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.error("Invalid amount");
      return;
    }

    const amountBigInt = parseAmountToBigInt(amount, decimals);

    approve.mutate(
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress, amountBigInt],
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash as HexAddress);
        },
      }
    );
  };

  const reset = () => {
    approve.reset();
    setTxHash(undefined);
    processedTxRef.current.clear();
  };

  return {
    mutate,
    isPending: approve.isPending || isConfirming,
    error: approve.error || confirmError,
    isConfirming,
    isSuccess: isTxSuccess,
    txHash,
    reset,
  };
};
