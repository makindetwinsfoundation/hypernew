import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TransactionList from "@/components/crypto/TransactionList";
import TransactionDetailModal from "@/components/modals/TransactionDetailModal";
import { useWallet } from "@/context/WalletContext";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { transactions, loadingTransactions, cryptos } = useWallet();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="gap-2 mb-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">
          View your recent cryptocurrency transactions
        </p>
      </div>

      <Card className="crypto-card border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              All Transactions
            </CardTitle>
            <CardDescription>
              Your complete transaction log
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading transactions...</p>
              </div>
            </div>
          ) : (
            <TransactionList 
              transactions={transactions} 
              cryptos={cryptos} 
              onTransactionClick={handleTransactionClick}
            />
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        transaction={selectedTransaction}
        cryptos={cryptos}
      />
    </motion.div>
  );
};

export default HistoryPage;