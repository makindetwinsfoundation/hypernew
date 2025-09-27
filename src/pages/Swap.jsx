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
import { walletAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import PinConfirmationModal from "@/components/modals/PinConfirmationModal";

const Swap = () => {
  const navigate = useNavigate();
  const { cryptos, convertCrypto } = useWallet();
  const { toast } = useToast();
  
  const [fromCrypto, setFromCrypto] = useState("");
  const [toCrypto, setToCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  useEffect(() => {
    if (cryptos.length > 0) {
      setFromCrypto(cryptos[0].id);
      if (cryptos.length > 1) {
        setToCrypto(cryptos[1].id);
      }
    }
  }, [cryptos]);

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
    // Clear quote when swapping currencies
    setQuoteDetails(null);
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

    // Get swap quote from backend
    setLoadingQuote(true);
    try {
      const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
      const toCryptoData = cryptos.find((c) => c.id === toCrypto);
      
      const quote = await walletAPI.getSwapQuote(
        fromCryptoData.symbol.toUpperCase(),
        toCryptoData.symbol.toUpperCase(),
        amount
      );

      if (quote && quote.success) {
        setQuoteDetails(quote.data);
        
        // Store transaction details and open PIN modal
        setPendingTransaction({
          fromCrypto,
          toCrypto,
          amount: parseFloat(amount),
          quote: quote.data
        });
        setIsPinModalOpen(true);
      } else {
        toast({
          title: "Quote Failed",
          description: (quote?.message || "Failed to get swap quote") + ". Please check your internet connection and try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Swap quote error:', error);
      toast({
        title: "Quote Failed",
        description: (error.message || "Network error") + ". Please check your internet connection and try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingQuote(false);
    }
  };

  const handlePinConfirmed = async (pin) => {
    if (!pendingTransaction) return;

    setIsSubmitting(true);
    
    try {
      const fromCryptoData = cryptos.find((c) => c.id === pendingTransaction.fromCrypto);
      const toCryptoData = cryptos.find((c) => c.id === pendingTransaction.toCrypto);
      
      const result = await walletAPI.executeSwap(
        fromCryptoData.symbol.toUpperCase(),
        toCryptoData.symbol.toUpperCase(),
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
          description: result?.message || "Failed to execute swap. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Swap execution error:', error);
      toast({
        title: "Swap Failed",
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
    setQuoteDetails(null);
  };

  const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
  const toCryptoData = cryptos.find((c) => c.id === toCrypto);
  
  const maxAmount = fromCryptoData ? fromCryptoData.balance : 0;
  

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
                value={quoteDetails ? parseFloat(quoteDetails.toAmount).toFixed(6) : ""}
                readOnly
                placeholder="0.00"
                className="text-center text-2xl font-bold border-none bg-transparent focus:ring-0 h-auto p-0 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {loadingQuote ? "Getting quote..." : "You'll receive approximately"}
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
            disabled={!fromCrypto || !toCrypto || !amount || isSubmitting || loadingQuote || fromCrypto === toCrypto || isPinModalOpen}
          >
            {isSubmitting || loadingQuote ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            {isSubmitting ? "Processing..." : loadingQuote ? "Getting Quote..." : "Swap"}
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