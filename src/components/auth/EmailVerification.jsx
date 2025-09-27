import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Mail, KeyRound, RefreshCw } from 'lucide-react';

const EmailVerification = ({ email, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyEmail, resendVerification } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setIsVerifying(true);
    const success = await verifyEmail(email, otp);
    setIsVerifying(false);

    if (success) {
      if (onVerified) {
        onVerified();
      }
      // Navigate to dashboard after successful verification
      setTimeout(() => {
        window.location.href = '/setup-pin';
      }, 1000);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    await resendVerification(email);
    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="w-full max-w-sm"
      >
        <Card className="bg-card/80 backdrop-blur-lg border-primary/30 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="text-center p-8 bg-primary/10">
            <div className="flex justify-center items-center mb-4">
              <Mail className="h-20 w-20 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Verify Your Email</CardTitle>
            <CardDescription className="text-muted-foreground">
              We've sent a verification code to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  required
                  className="pl-10 bg-background/70 border-border/50 focus:border-primary h-12 text-base text-center tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full crypto-gradient text-lg py-3 h-12 font-semibold tracking-wider hover:opacity-90 transition-opacity duration-300" 
                disabled={isVerifying || !otp.trim()}
              >
                {isVerifying ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-5 w-5 border-2 border-transparent border-t-white rounded-full mr-2" />
                ) : (
                  <Mail className="mr-2 h-5 w-5" />
                )}
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Didn't receive the code?
              </p>
              <Button 
                variant="outline" 
                onClick={handleResend}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailVerification;