import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, List, Search, Eye, EyeOff, ChevronDown, History, Repeat, Filter, Wallet, Bell, HelpCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransferTypeModal from "@/components/modals/TransferTypeModal";
import DepositTypeModal from "@/components/modals/DepositTypeModal";
import NotificationModal from "@/components/modals/NotificationModal";

const ActionButton = ({ icon: Icon, label, onClick, className }) => (
  <motion.div 
    className="flex flex-col items-center gap-1"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Button
      variant="outline"
      size="icon"
      className={cn("bg-card hover:bg-muted/80 border-border/50 rounded-full w-14 h-14", className)}
      onClick={onClick}
    >
      <Icon className="h-6 w-6 text-primary" />
    </Button>
    <span className="text-xs text-muted-foreground">{label}</span>
  </motion.div>
);

const AssetRowNew = ({ crypto, onClick, isBalanceVisible }) => {
  const { symbol, name, balance, price, color } = crypto;
  const value = balance * price;
  const percentChange = (Math.random() * 2 - 1).toFixed(2); 
  const isPositive = parseFloat(percentChange) >= 0;

  return (
    <motion.div
      className="flex items-center justify-between p-3 hover:bg-muted/30 cursor-pointer rounded-lg transition-colors duration-150"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center" 
          style={{ backgroundColor: `${color}20` }}
        >
          <CryptoIcon name={crypto.id} color={color} size={22}/>
        </div>
        <div>
          <p className="font-medium text-sm">{symbol}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>{isBalanceVisible ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : '****'}</span>
            <span className={cn("ml-2", isPositive ? "text-green-500" : "text-red-500")}>
              {isBalanceVisible ? `${isPositive ? "+" : ""}${percentChange}%` : '****'}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">{isBalanceVisible ? balance.toFixed(crypto.id === 'bitcoin' ? 8 : 4) : '****'}</p>
        <p className="text-xs text-muted-foreground">{isBalanceVisible ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '****'}</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { cryptos, getTotalBalance, loadingBalances } = useWallet();
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("crypto");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: "deposit",
      title: "Deposit Received",
      message: "Your Bitcoin deposit has been confirmed and added to your wallet.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isRead: false,
      amount: "0.00125",
      currency: "BTC"
    },
    {
      id: 2,
      type: "promotion",
      title: "Special Offer: 0% Trading Fees",
      message: "Trade with zero fees for the next 24 hours! Limited time offer for premium users.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false
    },
    {
      id: 3,
      type: "security",
      title: "New Login Detected",
      message: "We detected a new login from Chrome on Windows. If this wasn't you, please secure your account.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      isRead: true
    },
    {
      id: 4,
      type: "withdrawal",
      title: "Withdrawal Processed",
      message: "Your Ethereum withdrawal has been successfully processed and sent to your external wallet.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
      amount: "2.5",
      currency: "ETH"
    },
    {
      id: 5,
      type: "account",
      title: "Account Verification Complete",
      message: "Your identity verification has been approved. You can now access all platform features.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      isRead: true
    },
    {
      id: 6,
      type: "promotion",
      title: "New Feature: Auto-Invest",
      message: "Set up automatic recurring purchases for your favorite cryptocurrencies. Start building your portfolio effortlessly!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      isRead: true
    },
    {
      id: 7,
      type: "system",
      title: "Scheduled Maintenance",
      message: "We'll be performing scheduled maintenance on Sunday, 2:00 AM - 4:00 AM UTC. Trading will be temporarily unavailable.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      isRead: true
    }
  ];

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const handleDepositClick = () => {
    setIsDepositModalOpen(true);
  };

  const handleDepositTypeSelect = (type) => {
    if (type === "fiat") {
      // Navigate to fiat deposit page (placeholder)
      console.log("Fiat deposit selected");
    } else if (type === "crypto") {
      navigate("/receive");
    }
  };

  const handleSendClick = () => {
    setIsTransferModalOpen(true);
  };

  const handleTransferTypeSelect = (type) => {
    if (type === "internal") {
      navigate("/internal-transfer");
    } else {
      navigate("/send");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };
  
  const filteredCryptos = cryptos.filter(c => 
    c.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(assetSearchTerm.toLowerCase())
  );

  const totalBalance = getTotalBalance();
  const simulatedDailyChange = (totalBalance * (Math.random() * 0.02 - 0.01)); 
  const simulatedDailyPercent = (simulatedDailyChange / (totalBalance || 1)) * 100;

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <motion.div 
        variants={item} 
        initial="hidden" 
        animate="show" 
        className="flex items-center justify-between gap-4 mb-4 px-1"
      >
        <div className="relative flex-grow max-w-xs sm:max-w-sm md:max-w-md">
          <Input 
            type="text"
            placeholder="Search wallet (e.g. Bitcoin, send...)"
            className="pl-10 bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary h-10 text-sm rounded-full"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full relative"
            onClick={() => setIsNotificationModalOpen(true)}
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {unreadNotificationsCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full">
            <HelpCircle size={20} />
          </Button>
        </div>
      </motion.div>
      
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="crypto-card border-none p-5 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet size={16} />
              <span>Wallet Balance</span>
              <ChevronDown size={16} className="cursor-pointer hover:text-primary" />
            </div>
            <button 
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isBalanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {loadingBalances ? (
            <div className="flex items-center gap-2 mb-1">
              <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
            </div>
          ) : (
            <h1 className="text-4xl font-bold mb-1">
              {isBalanceVisible ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '********'}
            </h1>
          )}
          <div className="flex items-center text-xs mb-3">
            <span className={cn(simulatedDailyChange >= 0 ? "text-green-500" : "text-red-500")}>
              {isBalanceVisible ? 
                `${simulatedDailyChange >= 0 ? "+" : ""}$${Math.abs(simulatedDailyChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${simulatedDailyPercent.toFixed(2)}%) 1D` : 
                '******** 1D'
              }
            </span>
          </div>
          
          <div className="flex flex-row items-center justify-between md:flex-col md:items-start mt-4">
            <Button
              onClick={handleDepositClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </Button>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 gap-x-2 gap-y-4 items-start justify-items-center px-2 py-4"
      >
        <ActionButton icon={ArrowUpRight} label="Send" onClick={handleSendClick} className="hover:scale-105 transition-transform duration-200" />
        <ActionButton icon={ArrowDownLeft} label="Receive" onClick={() => navigate("/receive")} />
        <ActionButton icon={Repeat} label="Convert" onClick={() => navigate("/convert")} />
        <ActionButton icon={History} label="History" onClick={() => navigate("/history")} />
      </motion.div>
      
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="crypto-card border-none p-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Check $NEW_COIN airdrop!</p>
              <p className="text-xs text-muted-foreground">Exclusively on YourWallet.</p>
            </div>
            <Button variant="link" size="sm" className="text-primary p-0 h-auto">Check <ArrowUpRight size={14} className="ml-1"/></Button>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} initial="hidden" animate="show">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card crypto-card border-none">
            <TabsTrigger value="crypto" className="data-[state=active]:bg-muted/70 data-[state=active]:text-primary transition-all duration-200">Crypto</TabsTrigger>
            <TabsTrigger value="nft" disabled>NFT</TabsTrigger>
            <TabsTrigger value="defi" disabled>DeFi</TabsTrigger>
            <TabsTrigger value="approvals" disabled>Approvals</TabsTrigger>
          </TabsList>
          <TabsContent value="crypto" className="mt-4">
            <Card className="crypto-card border-none">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <CardTitle className="text-sm font-normal text-muted-foreground">Total assets</CardTitle>
                    {loadingBalances ? (
                      <div className="h-6 w-24 bg-muted animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-lg font-semibold">
                        {isBalanceVisible ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '********'}
                      </p>
                    )}
                  </div>
                  <Filter size={18} className="text-muted-foreground cursor-pointer hover:text-primary" />
                </div>
                <div className="relative">
                  <Input 
                    type="text"
                    placeholder="Search assets..."
                    className="pl-9 bg-background/50 border-border/50 focus:border-primary h-9 text-sm rounded-full"
                    value={assetSearchTerm}
                    onChange={(e) => setAssetSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-2 pt-0 max-h-[400px] overflow-y-auto">
                {loadingBalances ? (
                  <div className="space-y-3 p-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted animate-pulse rounded-full"></div>
                          <div>
                            <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1"></div>
                            <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredCryptos.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCryptos.map((crypto) => (
                      <AssetRowNew 
                        key={crypto.id} 
                        crypto={crypto} 
                        onClick={handleSendClick}
                        isBalanceVisible={isBalanceVisible}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-sm text-muted-foreground">
                    {assetSearchTerm ? "No assets found matching your search." : "No assets yet."}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="nft"><p className="text-center py-10 text-muted-foreground">NFTs coming soon!</p></TabsContent>
          <TabsContent value="defi"><p className="text-center py-10 text-muted-foreground">DeFi features coming soon!</p></TabsContent>
          <TabsContent value="approvals"><p className="text-center py-10 text-muted-foreground">Approvals management coming soon!</p></TabsContent>
        </Tabs>
      </motion.div>

      <TransferTypeModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSelectType={handleTransferTypeSelect}
      />

      <DepositTypeModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSelectType={handleDepositTypeSelect}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
      />
    </div>
  );
};

export default Dashboard;