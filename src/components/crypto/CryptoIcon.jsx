import React from "react";
import { Bitcoin, Coins, DollarSign, Zap } from "lucide-react";

export const CryptoIcon = ({ name, color, size = 20 }) => {
  // In a real app, you would use actual crypto icons
  // This is a simplified version using Lucide icons
  switch (name) {
    case "bitcoin":
    case "btc_testnet":
      return <Bitcoin size={size} color={color} />;
    case "ethereum":
    case "eth":
    case "eth_sepolia":
      return <Coins size={size} color={color} />; // Using Coins as a placeholder
    case "usdc":
      return <DollarSign size={size} color={color} />;
    case "plume":
      return <Zap size={size} color={color} />;
    default:
      return <Coins size={size} color={color} />;
  }
};