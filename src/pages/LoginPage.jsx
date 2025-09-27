import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Fingerprint, CreditCard, Zap, Wallet, DollarSign } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 overflow-hidden">
      {/* Header with Logo */}
      <div className="text-center pt-6 pb-6">
        <div className="flex justify-center items-center mb-3">
          <img 
            src="/my-new-logo.png" 
            alt="HyperX Logo" 
            className="w-24 h-24 object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">HyperX</h1>
        <p className="text-sm text-muted-foreground">by HyperX Inc.</p>
      </div>

      {/* Welcome Message */}
      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome Back!</h2>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex flex-col justify-center space-y-6 px-2">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Email Address</label>
          <div className="relative">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sm5669888@gmail.com"
              required
              className="h-10 border-0 border-b-2 border-muted-foreground/30 rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-10 border-0 border-b-2 border-muted-foreground/30 rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 pr-8 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right pt-2">
          <Link 
            to="/forgot-password" 
            className="text-primary hover:underline text-sm font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login Button */}
        <div className="pt-2">
          <Button 
            onClick={handleSubmit}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="h-4 w-4 border-2 border-transparent border-t-white rounded-full"
              />
            ) : (
              <>
                <Fingerprint className="h-5 w-5" />
                Log in with Biometrics
              </>
            )}
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Unable to Log in? Kindly{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign Up
            </Link>{' '}
            if;
          </p>
        </div>

        {/* Info Text */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>- You are new to crypto and HyperX.</p>
          <p>- You are new to HyperX and have a crypto account.</p>
          <p>- You are new to HyperX and have other wallets.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pb-4">
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            className="text-center p-3 rounded-xl bg-primary/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground">Get a Loan</p>
          </motion.div>

          <motion.div 
            className="text-center p-3 rounded-xl bg-primary/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground">Quick Links</p>
          </motion.div>

          <motion.div 
            className="text-center p-3 rounded-xl bg-primary/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground">Get a wallet</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;