/*
  # Create Candlestick Data Storage Schema

  ## Overview
  This migration sets up the database schema for storing cryptocurrency candlestick (OHLC) data
  with proper security and indexing for efficient queries.

  ## Tables Created
  
  ### `candlestick_data`
  Stores historical OHLC (Open, High, Low, Close) price data for cryptocurrencies
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each candlestick record
  - `crypto_id` (text) - Cryptocurrency identifier (e.g., 'bitcoin', 'ethereum')
  - `timeframe` (text) - Timeframe interval (5M, 15M, 30M, 1H, 4H, 1D, 1W, 1M)
  - `timestamp` (timestamptz) - Unix timestamp for the candlestick period
  - `open` (numeric) - Opening price for the period
  - `high` (numeric) - Highest price during the period
  - `low` (numeric) - Lowest price during the period
  - `close` (numeric) - Closing price for the period
  - `volume` (numeric) - Trading volume for the period
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ## Indexes
  - Composite index on (crypto_id, timeframe, timestamp) for efficient queries
  - Individual index on timestamp for time-based queries

  ## Security
  - Row Level Security (RLS) enabled
  - Public read access policy for all authenticated users
  - Insert/update restricted to service role only (for data ingestion)

  ## Notes
  - Candlestick data is considered public market data
  - Users can read all candlestick data but cannot modify it
  - Data ingestion should be done via backend service with elevated privileges
*/

CREATE TABLE IF NOT EXISTS candlestick_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_id text NOT NULL,
  timeframe text NOT NULL,
  timestamp timestamptz NOT NULL,
  open numeric NOT NULL,
  high numeric NOT NULL,
  low numeric NOT NULL,
  close numeric NOT NULL,
  volume numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candlestick_crypto_timeframe_timestamp 
  ON candlestick_data(crypto_id, timeframe, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_candlestick_timestamp 
  ON candlestick_data(timestamp DESC);

ALTER TABLE candlestick_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read candlestick data"
  ON candlestick_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only service role can insert candlestick data"
  ON candlestick_data
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only service role can update candlestick data"
  ON candlestick_data
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Only service role can delete candlestick data"
  ON candlestick_data
  FOR DELETE
  TO authenticated
  USING (false);
