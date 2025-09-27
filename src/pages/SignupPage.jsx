import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, UserPlus, CreditCard, Zap, Wallet } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import EmailVerification from '@/components/auth/EmailVerification';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    const success = await signup(email, password);
    setLoading(false);
    
    if (success) {
      setShowVerification(true);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
    // User will be automatically redirected to dashboard from EmailVerification component
  };

  if (showVerification) {
    return <EmailVerification email={email} onVerified={handleVerificationComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 overflow-hidden">
      {/* Header with Logo */}
      <div className="text-center pt-6 pb-5">
        <div className="flex justify-center items-center mb-3">
          <img 
            src="/my-new-logo.png" 
            alt="HyperX Logo" 
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">HyperX</h1>
        <p className="text-sm text-muted-foreground">by HyperX Inc.</p>
      </div>

      {/* Welcome Message */}
      <div className="text-center pb-4">
        <h2 className="text-2xl font-bold text-foreground">Create Your Wallet!</h2>
      </div>

      {/* Signup Form */}
      <div className="flex-1 flex flex-col justify-center space-y-4 px-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-10 border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 text-sm"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="h-10 border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 pr-8 text-sm"
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

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="h-10 border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 pr-8 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Create Account Button */}
          <div className="pt-3">
            <Button 
              type="submit"
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
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log In Here
            </Link>
          </p>
        </div>

        {/* Info Text */}
        <div className="space-y-1 text-xs text-muted-foreground pt-2">
          <p>- Join thousands of users managing crypto securely.</p>
          <p>- Get instant access to send, receive, and convert crypto.</p>
          <p>- Your security is our top priority.</p>
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
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground">Get a Card</p>
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

export default SignupPage;