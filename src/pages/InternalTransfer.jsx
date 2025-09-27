import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send as SendIcon, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";

const InternalTransfer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cryptos, sendCrypto } = useWallet();
  const { toast } = useToast();
  
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [activeTab, setActiveTab] = useState("userid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set selected crypto from navigation state if available
  useEffect(() => {
    if (location.state?.selectedCrypto) {
      setSelectedCrypto(location.state.selectedCrypto);
    } else if (cryptos.length > 0) {
      setSelectedCrypto(cryptos[0].id);
    }
  }, [location.state, cryptos]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const crypto = cryptos.find((c) => c.id === selectedCrypto);
    if (crypto) {
      setAmount(crypto.balance.toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recipient = activeTab === "userid" ? recipientId : recipientEmail;
    
    if (!recipient) {
      toast({
        title: "Missing Recipient",
        description: `Please enter a ${activeTab === "userid" ? "User ID" : "email address"}.`,
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

    const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);
    if (!selectedCryptoData) {
      toast({
        title: "Invalid Cryptocurrency",
        description: "Please select a valid cryptocurrency.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > selectedCryptoData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCryptoData.symbol}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate internal transfer (in a real app, this would be an API call)
    setTimeout(() => {
      const success = sendCrypto(
        selectedCrypto,
        parseFloat(amount),
        `Internal: ${recipient}`
      );
      
      setIsSubmitting(false);
      
      if (success) {
        toast({
          title: "Internal Transfer Successful",
          description: `Sent ${amount} ${selectedCryptoData.symbol} to ${recipient}`,
        });
        
        // Reset form
        setAmount("");
        setRecipientId("");
        setRecipientEmail("");
        
        // Navigate back to dashboard
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    }, 1000);
  };

  const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);
  const maxAmount = selectedCryptoData ? selectedCryptoData.balance : 0;
  const estimatedValue = selectedCryptoData && amount 
    ? (parseFloat(amount) * selectedCryptoData.price).toLocaleString('en-US', { maximumFractionDigits: 2 })
    : "0.00";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Internal Transfer</h1>
          <p className="text-sm text-muted-foreground">Free & instant</p>
        </div>

        {/* Asset Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Select Asset</h2>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
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
            {selectedCryptoData && (
              <p className="text-xs text-muted-foreground">
                Balance: {maxAmount.toFixed(6)} {selectedCryptoData.symbol}
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
              <p className="text-sm text-muted-foreground mt-1">
                ≈ ${estimatedValue}
              </p>
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

        {/* Recipient Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Send To</h2>
          <div className="bg-card/80 rounded-xl p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background/50">
                <TabsTrigger value="userid" className="text-sm">User ID</TabsTrigger>
                <TabsTrigger value="email" className="text-sm">Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="userid" className="mt-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter User ID (e.g., @john_doe)"
                    className="h-12 pl-12 bg-background/50 border-border/50 rounded-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Enter the recipient's HyperX User ID
                </p>
              </TabsContent>
              
              <TabsContent value="email" className="mt-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="h-12 pl-12 bg-background/50 border-border/50 rounded-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Enter the recipient's registered email address
                </p>
              </TabsContent>
            </Tabs>
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
              <span className="text-sm font-medium text-green-500">FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm text-primary font-medium">Instant</span>
            </div>
            <div className="h-px bg-border/50 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">You will send</span>
              <div className="text-right">
                <p className="text-sm font-medium">{amount || "0"} {selectedCryptoData?.symbol}</p>
                <p className="text-xs text-muted-foreground">≈ ${estimatedValue}</p>
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
            disabled={!selectedCrypto || !amount || (!recipientId && !recipientEmail) || isSubmitting}
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
            {isSubmitting ? "Processing..." : "Send Internally"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InternalTransfer;