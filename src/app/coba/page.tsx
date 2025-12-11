"use client";

import { helperAbi } from "@/lib/abis/helper-abi";
import React from "react";
import { useReadContract } from "wagmi";

const Page = () => {
  const router = useReadContract({
    functionName: "getRouter",
    abi: helperAbi,
    address: "0x4611E31A702BA4945475ce56cE2Dfe19c681538c",
    args: ["0xf1d4772c92215c8cad22913d8c57f695cf8b7dbe" as `0x${string}`],
  });
  return <div>{router.data?.toString()}</div>;
};

export default Page;
