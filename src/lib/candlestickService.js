import { createClient } from '@supabase/supabase-js';
import { generateCandlestickData, TIMEFRAMES } from './candlestick';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CACHE_DURATION = 5 * 60 * 1000;
const memoryCache = new Map();

const getCacheKey = (cryptoId, timeframe) => `${cryptoId}_${timeframe}`;

export const fetchCandlestickData = async (cryptoId, timeframe, currentPrice) => {
  const cacheKey = getCacheKey(cryptoId, timeframe);
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const timeframeConfig = TIMEFRAMES[timeframe];
    if (!timeframeConfig) {
      throw new Error(`Invalid timeframe: ${timeframe}`);
    }

    const now = Math.floor(Date.now() / 1000);
    const startTime = now - (timeframeConfig.candleCount * timeframeConfig.minutes * 60);

    const { data, error } = await supabase
      .from('candlestick_data')
      .select('*')
      .eq('crypto_id', cryptoId)
      .eq('timeframe', timeframe)
      .gte('timestamp', new Date(startTime * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching from Supabase:', error);
    }

    let candlestickData;

    if (!data || data.length === 0) {
      const changes = {
        '5M': 0.5, '15M': 1.2, '30M': 2.1, '1H': 3.45,
        '4H': 5.2, '1D': -2.1, '1W': 12.8, '1M': 45.2
      };
      const percentChange = changes[timeframe] || 0;
      candlestickData = generateCandlestickData(currentPrice, timeframe, percentChange);
    } else {
      candlestickData = data.map(item => ({
        time: Math.floor(new Date(item.timestamp).getTime() / 1000),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume)
      }));
    }

    memoryCache.set(cacheKey, {
      data: candlestickData,
      timestamp: Date.now()
    });

    return candlestickData;
  } catch (error) {
    console.error('Error in fetchCandlestickData:', error);

    const changes = {
      '5M': 0.5, '15M': 1.2, '30M': 2.1, '1H': 3.45,
      '4H': 5.2, '1D': -2.1, '1W': 12.8, '1M': 45.2
    };
    const percentChange = changes[timeframe] || 0;
    return generateCandlestickData(currentPrice, timeframe, percentChange);
  }
};

export const storeCandlestickData = async (cryptoId, timeframe, candlestickData) => {
  try {
    const records = candlestickData.map(item => ({
      crypto_id: cryptoId,
      timeframe: timeframe,
      timestamp: new Date(item.time * 1000).toISOString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('candlestick_data')
      .upsert(records, {
        onConflict: 'crypto_id,timeframe,timestamp',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error storing candlestick data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in storeCandlestickData:', error);
    return false;
  }
};

export const clearCache = () => {
  memoryCache.clear();
};

export const clearCryptoCache = (cryptoId) => {
  Object.keys(TIMEFRAMES).forEach(timeframe => {
    const cacheKey = getCacheKey(cryptoId, timeframe);
    memoryCache.delete(cacheKey);
  });
};
