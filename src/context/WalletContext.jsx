import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { walletAPI } from "@/lib/api";

const WalletContext = createContext();

// Static crypto metadata (since backend only provides balances)
const cryptoMetadata = {
  btc_testnet: {
    id: "btc_testnet",
    symbol: "BTC",
    name: "Bitcoin Testnet",
    icon: "btc_testnet",
    color: "#F7931A",
    price: 65000,
    chain: "bitcoin-testnet",
  },
  eth: {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    icon: "eth",
    color: "#627EEA",
    price: 3500,
    chain: "ethereum",
  },
  eth_sepolia: {
    id: "eth_sepolia",
    symbol: "ETH",
    name: "Ethereum Sepolia",
    icon: "eth_sepolia",
    color: "#8A2BE2",
    price: 3500,
    chain: "ethereum-sepolia",
  },
  usdc: {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    icon: "usdc",
    color: "#2775CA",
    price: 1,
    chain: "ethereum",
  },
  plume: {
    id: "plume",
    symbol: "PLUME",
    name: "Plume Network",
    icon: "plume",
    color: "#FF6B35",
    price: 0.1,
    chain: "plume",
  },
};

export const WalletProvider = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cryptos, setCryptos] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  const [transactions, setTransactions] = useState([]);

  // Fetch transaction history from backend
  const fetchTransactions = async () => {
    if (!user?.id) return;

    setLoadingTransactions(true);
    try {
      console.log('Fetching transaction history for user:', user.id);
      const historyData = await walletAPI.getWalletHistory(user.id);
      console.log('Received transaction history:', historyData);

      if (historyData && historyData.success && Array.isArray(historyData.data)) {
        // Transform backend transaction data to match our transaction structure
        const transformedTransactions = historyData.data.map((transaction) => {
          // Find the correct crypto metadata by matching currency
          const currencyKey = transaction.currency?.toLowerCase();
          let cryptoMeta = null;
          
          // Try to find exact match first
          if (currencyKey && cryptoMetadata[currencyKey]) {
            cryptoMeta = cryptoMetadata[currencyKey];
          } else {
            // Try to find by symbol match
            cryptoMeta = Object.values(cryptoMetadata).find(meta => 
              meta.symbol.toLowerCase() === currencyKey ||
              meta.id.toLowerCase() === currencyKey
            );
          }
          
          // Parse amount and calculate value
          const parsedAmount = parseFloat(transaction.amount) || 0;
          const humanAmount = parseFloat(transaction.humanAmount) || parsedAmount;
          const calculatedValue = cryptoMeta ? humanAmount * cryptoMeta.price : parseFloat(transaction.value) || 0;
          
          return {
            id: transaction.id || Date.now() + Math.random(),
            type: transaction.type || "unknown",
            cryptoId: cryptoMeta ? cryptoMeta.id : (transaction.cryptoId || transaction.currency?.toLowerCase()),
            symbol: cryptoMeta ? cryptoMeta.symbol : (transaction.symbol || transaction.currency),
            amount: humanAmount,
            rawAmount: transaction.amount,
            address: transaction.address || transaction.toAddress || "Unknown",
            timestamp: transaction.timestamp || transaction.createdAt || new Date().toISOString(),
            value: calculatedValue,
            // Additional backend fields for detailed view
            fromAddress: transaction.fromAddress,
            toAddress: transaction.toAddress,
            direction: transaction.direction,
            status: transaction.status,
            txHash: transaction.txHash,
            metadata: transaction.metadata,
            createdAt: transaction.createdAt,
            currency: transaction.currency,
            timeAgo: transaction.timeAgo,
            category: transaction.category,
            // Handle conversion-specific fields
            ...(transaction.type === "convert" && {
              fromCryptoId: transaction.fromCryptoId || transaction.fromCurrency?.toLowerCase(),
              toCryptoId: transaction.toCryptoId || transaction.toCurrency?.toLowerCase(),
              fromSymbol: transaction.fromSymbol || transaction.fromCurrency,
              toSymbol: transaction.toSymbol || transaction.toCurrency,
              fromAmount: transaction.fromHumanAmount || parseFloat(transaction.fromAmount) || 0,
              toAmount: transaction.toHumanAmount || parseFloat(transaction.toAmount) || 0,
              fromRawAmount: transaction.fromAmount,
              toRawAmount: transaction.toAmount,
            }),
          };
        });

        setTransactions(transformedTransactions);
        console.log('Updated transactions state:', transformedTransactions);
      } else {
        console.log('No transaction history found or invalid response format');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      // Fall back to local storage data
      const localTransactions = localStorage.getItem("cryptoTransactions");
      if (localTransactions) {
        try {
          const parsedTransactions = JSON.parse(localTransactions);
          // Ensure all transactions have a value property
          const validatedTransactions = parsedTransactions.map(transaction => ({
            ...transaction,
            value: typeof transaction.value === 'number' ? transaction.value : 0,
          }));
          setTransactions(validatedTransactions);
        } catch (parseError) {
          console.error('Failed to parse local transactions:', parseError);
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Load transactions from localStorage on initial load and validate them
  useEffect(() => {
    const localTransactions = localStorage.getItem("cryptoTransactions");
    if (localTransactions) {
      try {
        const parsedTransactions = JSON.parse(localTransactions);
        // Ensure all transactions have a value property
        const validatedTransactions = parsedTransactions.map(transaction => ({
          ...transaction,
          value: typeof transaction.value === 'number' ? transaction.value : 0,
        }));
        setTransactions(validatedTransactions);
      } catch (error) {
        console.error('Failed to parse local transactions:', error);
        setTransactions([]);
      }
    }
  }, []);

  // Fetch wallet balances function (moved outside useEffect for reusability)
  const fetchWalletBalances = async () => {
    if (!user?.id) return;

    setLoadingBalances(true);
    try {
      console.log('Fetching wallet balances for user:', user.id);
      const balanceData = await walletAPI.getWalletBalances(user.id);
      console.log('Received balance data:', balanceData);

      // Transform backend data to match our crypto structure
      const transformedCryptos = [];
        
      // Iterate through the balance data and merge with metadata
      if (balanceData && balanceData.success && Array.isArray(balanceData.data)) {
        balanceData.data.forEach((balanceItem) => {
          const cryptoKey = balanceItem.currency.toLowerCase();
          const metadata = cryptoMetadata[cryptoKey];
          if (metadata) {
            transformedCryptos.push({
              ...metadata,
              balance: parseFloat(balanceItem.balanceFormatted) || 0,
              address: balanceItem.address,
            });
          }
        });
      }

      // If no balances found, initialize with zero balances
      if (transformedCryptos.length === 0) {
        Object.values(cryptoMetadata).forEach(metadata => {
          transformedCryptos.push({
            ...metadata,
            balance: 0,
          });
        });
      }

      setCryptos(transformedCryptos);
      console.log('Updated cryptos state:', transformedCryptos);

    } catch (error) {
      console.error('Failed to fetch wallet balances:', error);
      toast({
        title: "Failed to Load Balances",
        description: "Could not fetch wallet balances. Using default values.",
        variant: "destructive",
      });

      // Fallback to zero balances
      const fallbackCryptos = Object.values(cryptoMetadata).map(metadata => ({
        ...metadata,
        balance: 0,
      }));
      setCryptos(fallbackCryptos);
    } finally {
      setLoadingBalances(false);
    }
  };

  // Fetch wallet balances when user is authenticated
  useEffect(() => {
    fetchWalletBalances();
    fetchTransactions();
  }, [user?.id, toast]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (cryptos.length > 0) {
      localStorage.setItem("cryptoWallet", JSON.stringify(cryptos));
    }
  }, [cryptos]);

  useEffect(() => {
    localStorage.setItem("cryptoTransactions", JSON.stringify(transactions));
  }, [transactions]);

  // Get total portfolio value
  const getTotalBalance = () => {
    return cryptos.reduce((total, crypto) => {
      return total + crypto.balance * crypto.price;
    }, 0);
  };

  // Helper function to add transactions with proper value calculation
  const addTransaction = (transaction) => {
    // Ensure transaction has a value property
    const transactionWithValue = {
      ...transaction,
      value: typeof transaction.value === 'number' ? transaction.value : 0,
    };
    
    setTransactions(prev => [transactionWithValue, ...prev]);
  };

  // Send crypto
  const sendExternalCrypto = async (cryptoId, amount, address) => {
    const crypto = cryptos.find((c) => c.id === cryptoId);
    
    if (!crypto) {
      toast({
        title: "Crypto Not Found",
        description: "Selected cryptocurrency not found",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the backend API to send external crypto
      const response = await walletAPI.sendExternal(
        crypto.id.toUpperCase().replace('_', '_'), // Keep the format as is for backend
        amount.toString(),
        address
      );

      if (response && response.success) {
        // Refresh wallet balances from backend
        await fetchWalletBalances();

        // Refresh transactions from backend to get the latest data
        await fetchTransactions();

        toast({
          title: "Transaction Successful",
          description: `Sent ${amount} ${crypto.symbol} to ${address.substring(0, 8)}...`,
        });

        return true;
      } else {
        toast({
          title: "Transaction Failed",
          description: response?.message || "Failed to send cryptocurrency",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('External send error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Network error. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Legacy send crypto function (for internal transfers and other uses)
  const sendCrypto = (cryptoId, amount, address) => {
    if (!address || address.length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return false;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const crypto = cryptos.find((c) => c.id === cryptoId);
    
    if (!crypto) {
      toast({
        title: "Crypto Not Found",
        description: "Selected cryptocurrency not found",
        variant: "destructive",
      });
      return false;
    }

    if (crypto.balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${crypto.symbol}`,
        variant: "destructive",
      });
      return false;
    }

    // Update crypto balance
    setCryptos(
      cryptos.map((c) =>
        c.id === cryptoId ? { ...c, balance: c.balance - amount } : c
      )
    );

    // Add transaction
    const newTransaction = {
      id: Date.now(),
      type: "send",
      cryptoId,
      symbol: crypto.symbol,
      amount,
      address,
      timestamp: new Date().toISOString(),
      value: amount * crypto.price,
    };

    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Transaction Successful",
      description: `Sent ${amount} ${crypto.symbol} to ${address.substring(0, 8)}...`,
    });

    return true;
  };

  // Receive crypto (simulate)
  const receiveCrypto = (cryptoId, amount, fromAddress) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const crypto = cryptos.find((c) => c.id === cryptoId);
    
    if (!crypto) {
      toast({
        title: "Crypto Not Found",
        description: "Selected cryptocurrency not found",
        variant: "destructive",
      });
      return false;
    }

    // Update crypto balance
    setCryptos(
      cryptos.map((c) =>
        c.id === cryptoId ? { ...c, balance: c.balance + amount } : c
      )
    );

    // Add transaction
    const newTransaction = {
      id: Date.now(),
      type: "receive",
      cryptoId,
      symbol: crypto.symbol,
      amount,
      address: fromAddress || "External Wallet",
      timestamp: new Date().toISOString(),
      value: amount * crypto.price,
    };

    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Funds Received",
      description: `Received ${amount} ${crypto.symbol}`,
    });

    return true;
  };

  // Convert crypto
  const convertCrypto = (fromCryptoId, toCryptoId, amount) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const fromCrypto = cryptos.find((c) => c.id === fromCryptoId);
    const toCrypto = cryptos.find((c) => c.id === toCryptoId);
    
    if (!fromCrypto || !toCrypto) {
      toast({
        title: "Crypto Not Found",
        description: "One or both selected cryptocurrencies not found",
        variant: "destructive",
      });
      return false;
    }

    if (fromCrypto.balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCrypto.symbol}`,
        variant: "destructive",
      });
      return false;
    }

    // Calculate conversion (with a small fee)
    const fee = 0.01; // 1% fee
    const fromValue = amount * fromCrypto.price;
    const feeAmount = fromValue * fee;
    const toValue = fromValue - feeAmount;
    const toAmount = toValue / toCrypto.price;

    // Update crypto balances
    setCryptos(
      cryptos.map((c) => {
        if (c.id === fromCryptoId) {
          return { ...c, balance: c.balance - amount };
        } else if (c.id === toCryptoId) {
          return { ...c, balance: c.balance + toAmount };
        }
        return c;
      })
    );

    // Add transaction
    const newTransaction = {
      id: Date.now(),
      type: "convert",
      fromCryptoId,
      toCryptoId,
      fromSymbol: fromCrypto.symbol,
      toSymbol: toCrypto.symbol,
      fromAmount: amount,
      toAmount,
      timestamp: new Date().toISOString(),
      value: fromValue,
    };

    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Conversion Successful",
      description: `Converted ${amount} ${fromCrypto.symbol} to ${toAmount.toFixed(6)} ${toCrypto.symbol}`,
    });

    return true;
  };

  // Get wallet address for a crypto
  const getWalletAddress = (cryptoId) => {
    // Get address from the crypto data (now includes address from backend)
    const crypto = cryptos.find((c) => c.id === cryptoId);
    return crypto?.address || "Address not available";
  };

  // Get balance for a specific crypto
  const getWalletBalance = (cryptoId) => {
    const crypto = cryptos.find((c) => c.id === cryptoId);
    return crypto ? crypto.balance : 0;
  };

  return (
    <WalletContext.Provider
      value={{
        cryptos,
        loadingBalances,
        loadingTransactions,
        transactions,
        fetchTransactions,
        getTotalBalance,
        getWalletBalance,
        sendCrypto,
        sendExternalCrypto,
        receiveCrypto,
        convertCrypto,
        getWalletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);