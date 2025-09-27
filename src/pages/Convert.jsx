import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import PinConfirmationModal from "@/components/modals/PinConfirmationModal";

const fiatCurrencies = [
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", rate: 1200 },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", rate: 18.5 },
  { code: "GHC", name: "Ghanaian Cedi", flag: "🇬🇭", rate: 12.5 },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", rate: 130 },
];

const ConvertPage = () => {
  const navigate = useNavigate();
  const { cryptos, getWalletBalance } = useWallet();
  const { toast } = useToast();
  
  const [fromCrypto, setFromCrypto] = useState("");
  const [toFiat, setToFiat] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);

  useEffect(() => {
    if (cryptos.length > 0) {
      setFromCrypto(cryptos[0].id);
    }
    if (fiatCurrencies.length > 0) {
      setToFiat(fiatCurrencies[0].code);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromCrypto || !toFiat || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a crypto, fiat currency, and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const cryptoBalance = getWalletBalance(fromCrypto);
    if (parseFloat(amount) > cryptoBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You do not have enough ${fromCryptoData?.symbol}.`,
        variant: "destructive",
      });
      return;
    }

    // Store transaction details and open PIN modal
    setPendingTransaction({
      fromCrypto,
      toFiat,
      amount: parseFloat(amount)
    });
    setIsPinModalOpen(true);
  };

  const handlePinConfirmed = (pin) => {
    if (!pendingTransaction) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Conversion Initiated",
        description: `Your request to convert ${pendingTransaction.amount} ${fromCryptoData?.symbol} to ${toFiatData?.code} is being processed.`,
      });
      setIsSubmitting(false);
      setPendingTransaction(null);
      setAmount("");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }, 1500);
  };

  const handlePinModalClose = () => {
    setIsPinModalOpen(false);
    setPendingTransaction(null);
  };

  const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
  const toFiatData = fiatCurrencies.find((f) => f.code === toFiat);
  
  const maxAmount = fromCryptoData ? fromCryptoData.balance : 0;
  
  const getConversionRate = () => {
    if (!fromCryptoData || !toFiatData) return 0;
    return fromCryptoData.price * toFiatData.rate;
  };
  
  const getEstimatedAmount = () => {
    if (!amount || !fromCryptoData || !toFiatData) return 0;
    const feePercentage = 0.01; // 1% fee
    const cryptoValueInUSD = parseFloat(amount) * fromCryptoData.price;
    const feeInUSD = cryptoValueInUSD * feePercentage;
    const valueAfterFeeInUSD = cryptoValueInUSD - feeInUSD;
    return valueAfterFeeInUSD * toFiatData.rate;
  };

  const conversionRate = getConversionRate();
  const estimatedAmount = getEstimatedAmount();

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Convert Crypto</h1>
          <p className="text-sm text-muted-foreground">Crypto to fiat</p>
        </div>

        {/* From Crypto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">From (Crypto)</h2>
            {fromCryptoData && (
              <p className="text-xs text-muted-foreground">
                Balance: {maxAmount.toFixed(fromCryptoData.id === 'bitcoin' ? 8 : 4)} {fromCryptoData.symbol}
              </p>
            )}
          </div>
          
          <Select value={fromCrypto} onValueChange={setFromCrypto}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {cryptos.map((crypto) => (
                <SelectItem key={crypto.id} value={crypto.id}>
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

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* To Fiat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">To (Fiat Currency)</h2>
          
          <Select value={toFiat} onValueChange={setToFiat}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose fiat currency" />
            </SelectTrigger>
            <SelectContent>
              {fiatCurrencies.map((fiat) => (
                <SelectItem key={fiat.code} value={fiat.code}>
                  <div className="flex items-center gap-3 py-1">
                    <span className="text-2xl">{fiat.flag}</span>
                    <div>
                      <p className="font-medium">{fiat.code}</p>
                      <p className="text-xs text-muted-foreground">{fiat.name}</p>
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
                value={estimatedAmount ? estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                readOnly
                placeholder="0.00"
                className="text-center text-2xl font-bold border-none bg-transparent focus:ring-0 h-auto p-0 text-muted-foreground"
              />
              <p className="text-sm text-muted-foreground mt-1">
                You'll receive approximately
              </p>
            </div>
          </div>
        </motion.div>

        {/* Conversion Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card/80 rounded-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-medium">Conversion Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Exchange Rate</span>
              <span className="text-sm font-medium">
                1 {fromCryptoData?.symbol} ≈ {conversionRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toFiatData?.code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Conversion Fee</span>
              <span className="text-sm font-medium text-orange-500">
                1% (~${amount ? (parseFloat(amount) * (fromCryptoData?.price || 0) * 0.01).toFixed(2) : "0.00"})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm text-muted-foreground">1-3 business days</span>
            </div>
            <div className="h-px bg-border/50 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">You'll receive</span>
              <div className="text-right">
                <p className="text-sm font-medium">{estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toFiatData?.code}</p>
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
            disabled={!fromCrypto || !toFiat || !amount || parseFloat(amount) <= 0 || isSubmitting || isPinModalOpen}
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
            {isSubmitting ? "Processing..." : `Convert to ${toFiatData?.code || "Fiat"}`}
          </Button>
        </div>
      </div>

      <PinConfirmationModal
        isOpen={isPinModalOpen}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirmed}
        transactionType="conversion"
      />
    </div>
  );
};

export default ConvertPage;