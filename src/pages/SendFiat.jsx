import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const SendFiat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample fiat balances
  const fiatBalances = [
    { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", balance: 125000, symbol: "₦" },
    { code: "ZAR", name: "South African Rand", flag: "🇿🇦", balance: 2500, symbol: "R" },
    { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭", balance: 850, symbol: "₵" },
    { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", balance: 15000, symbol: "KSh" },
  ];

  // Sample banks (you can expand this based on the selected currency)
  const banks = [
    { code: "GTB", name: "Guaranty Trust Bank" },
    { code: "UBA", name: "United Bank for Africa" },
    { code: "ZENITH", name: "Zenith Bank" },
    { code: "FIRST", name: "First Bank of Nigeria" },
    { code: "ACCESS", name: "Access Bank" },
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const currency = fiatBalances.find((c) => c.code === selectedCurrency);
    if (currency) {
      setAmount(currency.balance.toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!recipientName || !accountNumber || !selectedBank) {
      toast({
        title: "Missing Information",
        description: "Please fill in all recipient details.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
    if (parseFloat(amount) > selectedCurrencyData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCurrencyData.code}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate bank transfer
    setTimeout(() => {
      toast({
        title: "Transfer Initiated",
        description: `Bank transfer of ${selectedCurrencyData.symbol}${amount} to ${recipientName} has been initiated.`,
      });
      
      setIsSubmitting(false);
      setAmount("");
      setRecipientName("");
      setAccountNumber("");
      setSelectedBank("");
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }, 2000);
  };

  const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
  const maxAmount = selectedCurrencyData ? selectedCurrencyData.balance : 0;

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Send to Bank</h1>
          <p className="text-sm text-muted-foreground">Transfer to external bank accounts</p>
        </div>

        {/* Currency Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Select Currency</h2>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="h-14 bg-card/80 border-border/50 rounded-xl">
              <SelectValue placeholder="Choose currency" />
            </SelectTrigger>
            <SelectContent>
              {fiatBalances.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-3 py-1">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <p className="font-medium">{currency.code}</p>
                      <p className="text-xs text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Amount Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Amount</h2>
            {selectedCurrencyData && (
              <p className="text-xs text-muted-foreground">
                Balance: {selectedCurrencyData.symbol}{maxAmount.toLocaleString()}
              </p>
            )}
          </div>
          
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

        {/* Recipient Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Recipient Details</h2>
          <div className="bg-card/80 rounded-xl p-4 space-y-4">
            <div>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Recipient's full name"
                className="h-12 bg-background/50 border-border/50 rounded-lg"
              />
            </div>
            
            <div>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
                className="h-12 bg-background/50 border-border/50 rounded-lg"
              />
            </div>

            <div>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-lg">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      <div className="flex items-center gap-3 py-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{bank.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card/80 rounded-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-medium">Transaction Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Transfer Fee</span>
              <span className="text-sm font-medium text-orange-500">
                {selectedCurrencyData?.symbol}50
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm text-muted-foreground">1-3 business days</span>
            </div>
            <div className="h-px bg-border/50 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Amount</span>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {selectedCurrencyData?.symbol}{amount ? (parseFloat(amount) + 50).toLocaleString() : "50"}
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
            disabled={!selectedCurrency || !amount || !recipientName || !accountNumber || !selectedBank || isSubmitting}
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
            {isSubmitting ? "Processing..." : "Send to Bank"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendFiat;