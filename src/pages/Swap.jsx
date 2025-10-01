import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowDown, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { walletAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import PinConfirmationModal from "@/components/modals/PinConfirmationModal";

const Swap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cryptos, convertCrypto, fetchWalletBalances, fetchTransactions } = useWallet();
  const { toast } = useToast();
  
  const [fromCrypto, setFromCrypto] = useState("");
  const [toCrypto, setToCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  useEffect(() => {
    if (cryptos.length > 0) {
      setFromCrypto(cryptos[0].id);
      if (cryptos.length > 1) {
        setToCrypto(cryptos[1].id);
      }
    }
  }, [cryptos]);

  // Auto-fetch quote when amount, fromCrypto, or toCrypto changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || !fromCrypto || !toCrypto || fromCrypto === toCrypto || parseFloat(amount) <= 0) {
        setQuoteDetails(null);
        setQuoteError("");
        return;
      }

      const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
      const toCryptoData = cryptos.find((c) => c.id === toCrypto);
      
      if (!fromCryptoData || !toCryptoData) {
        return;
      }

      // Check if amount exceeds balance
      if (parseFloat(amount) > fromCryptoData.balance) {
        setQuoteDetails(null);
        setQuoteError("Insufficient balance");
        return;
      }

      setLoadingQuote(true);
      setQuoteError("");
      
      try {
        const quote = await walletAPI.getSwapQuote(
          fromCryptoData.symbol.toUpperCase(),
          toCryptoData.symbol.toUpperCase(),
          amount
        );

        if (quote && quote.success) {
          setQuoteDetails(quote.quote);
        } else {
          setQuoteDetails(null);
          setQuoteError("Unable to get quote");
        }
      } catch (error) {
        console.error('Quote fetch error:', error);
        setQuoteDetails(null);
        setQuoteError("Network error");
      } finally {
        setLoadingQuote(false);
      }
    };

    // Debounce the quote fetching to avoid too many API calls
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, fromCrypto, toCrypto, cryptos]);
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const crypto = cryptos.find((c) => c.id === fromCrypto);
    if (crypto) {
      setAmount(crypto.balance.toString());
    }
  };

  const handleSwapCryptos = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fromCrypto || !toCrypto || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    if (fromCrypto === toCrypto) {
      toast({
        title: "Invalid Swap",
        description: "Cannot swap the same cryptocurrency.",
        variant: "destructive",
      });
      return;
    }

    const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
    if (fromCryptoData && parseFloat(amount) > fromCryptoData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCryptoData.symbol}.`,
        variant: "destructive",
      });
      return;
    }

    if (!quoteDetails) {
      toast({
        title: "Quote Failed",
        description: "Unable to get swap quote. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Store transaction details and open PIN modal
    setPendingTransaction({
      fromCrypto,
      toCrypto,
      amount: parseFloat(amount),
      quote: quoteDetails
    });
    setIsPinModalOpen(true);
  };

  const handlePinConfirmed = async (pin) => {
    if (!pendingTransaction) return;

    setIsSubmitting(true);
    
    try {
      // Ensure wallet balances are up to date before attempting swap
      await fetchWalletBalances();
      
      const fromCryptoData = cryptos.find((c) => c.id === pendingTransaction.fromCrypto);
      const toCryptoData = cryptos.find((c) => c.id === pendingTransaction.toCrypto);
      
      // Verify that both cryptocurrencies exist in the user's wallet
      if (!fromCryptoData || !toCryptoData) {
        throw new Error("One or both cryptocurrencies not found in your wallet. Please refresh and try again.");
      }
      
      // Defensive check for walletAPI.executeSwap
      if (!walletAPI || typeof walletAPI.executeSwap !== 'function') {
        console.error('walletAPI.executeSwap is not available:', walletAPI);
        throw new Error("Swap functionality is currently unavailable. Please try again later.");
      }
      
      const result = await walletAPI.executeSwap(
        user.id,
        fromCryptoData.id.toUpperCase(),
        toCryptoData.id.toUpperCase(),
        pendingTransaction.amount.toString(),
        pendingTransaction.quote.quoteId
      );

      if (result && result.success) {
        toast({
          title: "Swap Successful",
          description: `Successfully swapped ${pendingTransaction.amount} ${fromCryptoData.symbol} to ${toCryptoData.symbol}`,
        });
        
        // Refresh wallet balances and transactions
        await fetchWalletBalances();
        await fetchTransactions();
        
        // Reset form
        setAmount("");
        setQuoteDetails(null);
        setPendingTransaction(null);
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast({
          title: "Swap Failed",
          description: result?.error || result?.message || "The swap could not be completed due to a server error. Please check your balance and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Swap execution error:', error);
      toast({
        title: "Swap Error",
        description: error.message || "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setPendingTransaction(null);
    }
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingTransaction(null);
  };

  const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
  const toCryptoData = cryptos.find((c) => c.id === toCrypto);
  
  const maxAmount = fromCryptoData ? fromCryptoData.balance : 0;

  const getDisplayAmount = () => {
    if (loadingQuote) return "Getting quote...";
    if (quoteError) return quoteError;
    if (quoteDetails && quoteDetails.toAmount) {
      return parseFloat(quoteDetails.toAmount).toFixed(6);
    }
    return "";
  };

  const getDisplaySubtext = () => {
    if (loadingQuote) return "Please wait";
    if (quoteError) return "Try adjusting the amount";
    if (quoteDetails) return "You'll receive approximately";
    return "Enter amount to see quote";
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Swap Crypto</h1>
          <p className="text-sm text-muted-foreground">Exchange crypto</p>
        </div>

        {/* From Asset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">From</h2>
            {fromCryptoData && (
              <p className="text-xs text-muted-foreground">
                Balance: {maxAmount.toFixed(6)} {fromCryptoData.symbol}
              </p>
            )}
          </div>
          
          <Select value={fromCrypto} onValueChange={setFromCrypto}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {cryptos.map((crypto) => (
                <SelectItem 
                  key={crypto.id} 
                  value={crypto.id}
                  disabled={crypto.id === toCrypto}
                >
                  <div className="flex items-center gap-3 py-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: `${crypto.color}20` }}
                    >
                      <CryptoIcon name={crypto.id} color={crypto.color} size={18} />
                    </div>
                    <div>
                      <p className="font-medium">{crypto.symbol}</p>
                      <p className="text-xs text-muted-foreground">{crypto.name}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-card/80 rounded-xl p-4 space-y-4">
            <div className="text-center">
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="text-center text-2xl font-bold border-none bg-transparent focus:ring-0 h-auto p-0 text-foreground"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={() => setAmount((maxAmount * 0.25).toString())}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={() => setAmount((maxAmount * 0.5).toString())}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={() => setAmount((maxAmount * 0.75).toString())}
              >
                75%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-full"
                onClick={handleMaxAmount}
              >
                MAX
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12 border-2 hover:bg-primary/10 hover:border-primary/50"
            onClick={handleSwapCryptos}
          >
            <RotateCcw className="h-5 w-5 text-primary" />
          </Button>
        </div>

        {/* To Asset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">To</h2>
          
          <Select value={toCrypto} onValueChange={setToCrypto}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {cryptos.map((crypto) => (
                <SelectItem 
                  key={crypto.id} 
                  value={crypto.id}
                  disabled={crypto.id === fromCrypto}
                >
                  <div className="flex items-center gap-3 py-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: `${crypto.color}20` }}
                    >
                      <CryptoIcon name={crypto.id} color={crypto.color} size={18} />
                    </div>
                    <div>
                      <p className="font-medium">{crypto.symbol}</p>
                      <p className="text-xs text-muted-foreground">{crypto.name}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-card/80 rounded-xl p-4">
            <div className="text-center">
              <Input
                type="text"
                value={getDisplayAmount()}
                readOnly
                placeholder="0.00"
                className={`text-center text-2xl font-bold border-none bg-transparent focus:ring-0 h-auto p-0 ${
                  quoteError ? "text-destructive" : "text-muted-foreground"
                }`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {getDisplaySubtext()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Exchange Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card/80 rounded-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-medium">Exchange Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Exchange Rate</span>
              <span className="text-sm font-medium">
                {quoteDetails ? 
                  `1 ${fromCryptoData?.symbol} ≈ ${(parseFloat(quoteDetails.toAmount) / parseFloat(amount || 1)).toFixed(6)} ${toCryptoData?.symbol}` :
                  `1 ${fromCryptoData?.symbol} ≈ -- ${toCryptoData?.symbol}`
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Exchange Fee</span>
              <span className="text-sm font-medium text-orange-500">
                {quoteDetails ? 
                  `$${parseFloat(quoteDetails.feeAmount || 0).toFixed(2)}` :
                  `~$${amount ? (parseFloat(amount) * (fromCryptoData?.price || 0) * 0.01).toFixed(2) : "0.00"}`
                }
              </span>
            </div>
            <div className="h-px bg-border/50 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">You'll receive</span>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {quoteDetails ? 
                    `${parseFloat(quoteDetails.toAmount).toFixed(6)} ${toCryptoData?.symbol}` :
                    `-- ${toCryptoData?.symbol}`
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border/30 p-4 pb-8">
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-14 px-6 rounded-xl font-semibold text-base"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg"
           disabled={!fromCrypto || !toCrypto || !amount || isSubmitting || fromCrypto === toCrypto || isPinModalOpen || !quoteDetails || !!quoteError}
          >
           {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
           {isSubmitting ? "Processing..." : "Swap"}
          </Button>
        </div>
      </div>

      <PinConfirmationModal
        isOpen={isPinModalOpen}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirmed}
        transactionType="swap"
      />
    </div>
  );
};

export default Swap;