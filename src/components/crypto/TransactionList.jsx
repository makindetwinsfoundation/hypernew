import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowUpRight, ArrowDownLeft, RefreshCw, Check, X } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions) => {
  const groups = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    const dateKey = transactionDate.toDateString();
    const todayKey = today.toDateString();
    const yesterdayKey = yesterday.toDateString();

    let groupLabel;
    if (dateKey === todayKey) {
      groupLabel = "Today";
    } else if (dateKey === yesterdayKey) {
      groupLabel = "Yesterday";
    } else {
      groupLabel = transactionDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    if (!groups[groupLabel]) {
      groups[groupLabel] = [];
    }
    groups[groupLabel].push(transaction);
  });

  return groups;
};

// Helper function to get transaction status icon
const getStatusIcon = (transaction) => {
  if (transaction.type === 'interaction') {
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  }
  return <CheckCircle className="h-4 w-4 text-green-500" />;
};

// Helper function to format transaction title
const getTransactionTitle = (transaction) => {
  // Use the backend transaction type directly, with proper capitalization
  if (!transaction.type) return 'Transaction';
  
  // Capitalize first letter of the transaction type
  return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
};

// Helper function to format address display
const formatAddress = (address, type) => {
  if (!address || address === "Unknown") return address;
  if (address.startsWith("Internal:")) return address.replace("Internal: ", "");
  
  // For blockchain addresses, show shortened version
  if (address.length > 20) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  return address;
};

// Helper function to get transaction amount display
const getAmountDisplay = (transaction, privateMode) => {
  if (privateMode) {
    return {
      primary: "****",
      secondary: "****"
    };
  }

  const { type, amount, symbol, fromAmount, fromSymbol, toAmount, toSymbol } = transaction;
  
  switch (type) {
    case "send":
    case "withdraw":
      return {
        primary: `-${Math.abs(amount)} ${symbol}`,
        secondary: `$${(transaction.value || 0).toFixed(2)}`,
        color: "text-destructive"
      };
    case "receive":
      return {
        primary: `+${amount} ${symbol}`,
        secondary: `$${(transaction.value || 0).toFixed(2)}`,
        color: "text-green-500"
      };
    case "convert":
    case "swap":
      return {
        primary: `+${toAmount?.toFixed(4)} ${toSymbol}`,
        secondary: `-${fromAmount} ${fromSymbol}`,
        color: "text-primary"
      };
    case "interaction":
      return {
        primary: `${symbol || 'ETH'}`,
        secondary: "",
        color: "text-muted-foreground"
      };
    case "approval":
      return {
        primary: `${symbol || 'BTC'}`,
        secondary: "",
        color: "text-green-500"
      };
    default:
      return {
        primary: `${amount || 0} ${symbol}`,
        secondary: `$${(transaction.value || 0).toFixed(2)}`,
        color: "text-muted-foreground"
      };
  }
};

const TransactionList = ({ transactions, cryptos, privateMode = false, onTransactionClick }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium mb-2">No transactions yet</p>
        <p className="text-sm">Your transaction history will appear here</p>
      </div>
    );
  }

  // Use only real transactions from the backend
  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([dateLabel, dateTransactions]) => (
        <div key={dateLabel}>
          {/* Date Header */}
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {dateLabel}
          </h3>
          
          {/* Transactions for this date */}
          <div className="space-y-3">
            {dateTransactions.map((transaction, index) => {
              const amountDisplay = getAmountDisplay(transaction, privateMode);
              const cryptoMeta = cryptos?.find(c => c.id === transaction.cryptoId);
              
              return (
                <motion.div
                  key={transaction.id}
                  className="bg-card/80 rounded-xl p-4 border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onTransactionClick && onTransactionClick(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Crypto Icon */}
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center relative"
                        style={{ backgroundColor: `${cryptoMeta?.color || '#6B7280'}20` }}
                      >
                        <CryptoIcon 
                          name={transaction.cryptoId} 
                          color={cryptoMeta?.color || '#6B7280'} 
                          size={24} 
                        />
                      </div>
                      
                      {/* Transaction Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground text-base">
                            {getTransactionTitle(transaction)}
                          </h4>
                          {getStatusIcon(transaction)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-3 h-3 bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-xs text-primary-foreground">🔷</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.type === 'send' ? 'To ' : 
                             transaction.type === 'receive' ? 'From ' : 
                             transaction.type === 'swap' ? '' : ''}
                            {formatAddress(transaction.address, transaction.type)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right">
                      <p className={`font-semibold text-base ${amountDisplay.color || 'text-foreground'}`}>
                        {amountDisplay.primary}
                      </p>
                      {amountDisplay.secondary && (
                        <p className="text-sm text-muted-foreground">
                          {amountDisplay.secondary}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Bottom spacing for mobile navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default TransactionList;