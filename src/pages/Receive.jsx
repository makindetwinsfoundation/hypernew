import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import QRCodeStylized from 'qrcode.react'; // For actual QR code generation

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cryptos, getWalletAddress, receiveCrypto } = useWallet();
  
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (cryptos.length > 0) {
      setSelectedCrypto(cryptos[0].id);
    }
  }, [cryptos]);

  useEffect(() => {
    if (selectedCrypto) {
      setWalletAddress(getWalletAddress(selectedCrypto));
    }
  }, [selectedCrypto, getWalletAddress]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);

  return (
    <div className="min-h-screen bg-background bg-mesh flex flex-col">
      {/* Content */}
      <div className="flex-1 px-4 pt-6 pb-6 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Receive Crypto</h1>
          <p className="text-sm text-muted-foreground">Get cryptocurrency to your wallet</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Asset Selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Select Asset</h2>
            <Select 
              value={selectedCrypto} 
              onValueChange={setSelectedCrypto}
            >
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
          </div>

          {/* QR Code Section */}
          {walletAddress && (
            <div className="bg-card/80 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-medium text-center">QR Code</h3>
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeStylized
                    value={walletAddress}
                    size={180}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="Q"
                    includeMargin={true}
                    imageSettings={{
                      src: "/my-new-logo.png",
                      excavate: true,
                      width: 40,
                      height: 40,
                    }}
                  />
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Scan this QR code to receive {selectedCryptoData?.name}
              </p>
            </div>
          )}

          {/* Wallet Address */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Your {selectedCryptoData?.name} Address</h2>
            <div className="bg-card/80 rounded-xl p-4 space-y-3">
              <div className="relative">
                <Input
                  value={walletAddress}
                  readOnly
                  className="h-12 pr-12 bg-background/50 border-border/50 rounded-lg text-sm font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 rounded-lg hover:bg-primary/10"
                  onClick={handleCopyAddress}
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-primary" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Only send {selectedCryptoData?.name} ({selectedCryptoData?.symbol}) to this address
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-card/80 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-orange-500">Important Notice</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Only send {selectedCryptoData?.name} to this address</p>
              <p>• Sending other cryptocurrencies may result in permanent loss</p>
              <p>• Always verify the address before sending</p>
              <p>• Transactions are irreversible once confirmed</p>
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
            Back
          </Button>
          <Button 
            onClick={handleCopyAddress}
            className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            {copied ? "Copied!" : "Copy Address"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Receive;