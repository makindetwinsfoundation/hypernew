export const TIMEFRAMES = {
  '5M': { label: '5M', minutes: 5, candleCount: 288 },
  '15M': { label: '15M', minutes: 15, candleCount: 96 },
  '30M': { label: '30M', minutes: 30, candleCount: 48 },
  '1H': { label: '1H', minutes: 60, candleCount: 168 },
  '4H': { label: '4H', minutes: 240, candleCount: 180 },
  '1D': { label: '1D', minutes: 1440, candleCount: 90 },
  '1W': { label: '1W', minutes: 10080, candleCount: 52 },
  '1M': { label: '1M', minutes: 43200, candleCount: 12 }
};

export const generateCandlestickData = (basePrice, timeframe, percentChange = 0) => {
  const config = TIMEFRAMES[timeframe];
  if (!config) return [];

  const candleCount = config.candleCount;
  const volatility = basePrice * 0.02;
  const trendPerCandle = (percentChange / 100) * basePrice / candleCount;

  let data = [];
  let currentTime = Math.floor(Date.now() / 1000) - (candleCount * config.minutes * 60);
  let lastClose = basePrice * (1 - (percentChange / 100) / 2);

  for (let i = 0; i < candleCount; i++) {
    const trendAdjustment = trendPerCandle * i;
    const noise = (Math.random() - 0.5) * volatility;

    const open = lastClose;
    const trend = (Math.random() - 0.5) * volatility * 0.5;
    const close = open + trend + noise + trendAdjustment / candleCount;

    const high = Math.max(open, close) + Math.abs((Math.random() - 0.3) * volatility * 0.3);
    const low = Math.min(open, close) - Math.abs((Math.random() - 0.3) * volatility * 0.3);

    const volume = Math.random() * basePrice * 10 + basePrice * 5;

    data.push({
      time: currentTime,
      open: parseFloat(open.toFixed(8)),
      high: parseFloat(high.toFixed(8)),
      low: parseFloat(low.toFixed(8)),
      close: parseFloat(close.toFixed(8)),
      volume: parseFloat(volume.toFixed(2))
    });

    lastClose = close;
    currentTime += config.minutes * 60;
  }

  return data;
};

export const calculatePriceChange = (data) => {
  if (!data || data.length < 2) return { change: 0, percentChange: 0 };

  const firstPrice = data[0].close;
  const lastPrice = data[data.length - 1].close;
  const change = lastPrice - firstPrice;
  const percentChange = (change / firstPrice) * 100;

  return {
    change: parseFloat(change.toFixed(2)),
    percentChange: parseFloat(percentChange.toFixed(2))
  };
};

export const getHighLowPrices = (data) => {
  if (!data || data.length === 0) return { high: 0, low: 0 };

  const high = Math.max(...data.map(d => d.high));
  const low = Math.min(...data.map(d => d.low));

  return {
    high: parseFloat(high.toFixed(8)),
    low: parseFloat(low.toFixed(8))
  };
};
