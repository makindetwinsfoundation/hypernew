import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import CandlestickChart from "@/components/crypto/CandlestickChart";
import { cn } from "@/lib/utils";
import { TIMEFRAMES, calculatePriceChange, getHighLowPrices } from "@/lib/candlestick";
import { fetchCandlestickData } from "@/lib/candlestickService";

const ChartTimeframes = ["5M", "15M", "30M", "1H", "4H", "1D", "1W", "1M"];

const AssetChart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const crypto = location.state?.crypto;

  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");
  const [isFavorite, setIsFavorite] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  if (!crypto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No asset selected</p>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const { symbol, name, balance, price, color, id } = crypto;
  const value = balance * price;

  useEffect(() => {
    const loadChartData = async () => {
      setIsLoadingChart(true);
      try {
        const data = await fetchCandlestickData(id, selectedTimeframe, price);
        setChartData(data);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    loadChartData();
  }, [id, selectedTimeframe, price]);

  const { change, percentChange } = useMemo(() => {
    return calculatePriceChange(chartData);
  }, [chartData]);

  const isPositive = percentChange >= 0;

  const { high: maxPrice, low: minPrice } = useMemo(() => {
    return getHighLowPrices(chartData);
  }, [chartData]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFavorite(!isFavorite)}
          className="rounded-full"
        >
          <Star className={cn("h-5 w-5", isFavorite && "fill-yellow-500 text-yellow-500")} />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <CryptoIcon name={id} color={color} size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-muted-foreground">{symbol}</p>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</h2>
            <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-green-500" : "text-red-500")}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Balance: {balance.toFixed(id === 'bitcoin' ? 8 : 4)} {symbol} (${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </p>
        </div>

        <Card className="crypto-card border-none">
          <CardContent className="p-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {ChartTimeframes.map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={cn(
                    "rounded-full text-xs px-4 whitespace-nowrap",
                    selectedTimeframe === timeframe
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent hover:bg-muted"
                  )}
                >
                  {timeframe}
                </Button>
              ))}
            </div>

            <div className="relative w-full">
              {isLoadingChart ? (
                <div className="flex items-center justify-center" style={{ height: '320px' }}>
                  <div className="text-muted-foreground">Loading chart...</div>
                </div>
              ) : (
                <CandlestickChart
                  data={chartData}
                  color={color}
                  height={320}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/send", { state: { selectedCrypto: crypto } })}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl font-semibold text-base"
          >
            <ArrowUpRight className="h-5 w-5 mr-2" />
            Send
          </Button>
          <Button
            onClick={() => navigate("/receive", { state: { selectedCrypto: crypto } })}
            variant="outline"
            className="w-full py-6 rounded-xl font-semibold text-base border-2"
          >
            <ArrowDownLeft className="h-5 w-5 mr-2" />
            Receive
          </Button>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card crypto-card border-none">
            <TabsTrigger value="stats" className="data-[state=active]:bg-muted/70">Stats</TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-muted/70">About</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-3 mt-4">
            <Card className="crypto-card border-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">${(price * balance * 1000000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-semibold">${(price * balance * 500000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{TIMEFRAMES[selectedTimeframe]?.label} High</span>
                  <span className="font-semibold">${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{TIMEFRAMES[selectedTimeframe]?.label} Low</span>
                  <span className="font-semibold">${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Holdings</span>
                  <span className="font-semibold">{balance.toFixed(id === 'bitcoin' ? 8 : 4)} {symbol}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <Card className="crypto-card border-none">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {name} is a {id === 'bitcoin' ? 'decentralized digital currency' : 'cryptocurrency'} that enables
                  peer-to-peer transactions on a decentralized network.
                  {id === 'bitcoin' && ' Bitcoin is the first and most widely recognized cryptocurrency, often referred to as digital gold.'}
                  {id === 'ethereum' && ' Ethereum is a decentralized platform that runs smart contracts and decentralized applications.'}
                  {id === 'solana' && ' Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AssetChart;
