import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import EmailVerification from '@/components/auth/EmailVerification';
import BiodataForm from '@/components/auth/BiodataForm';
import ProgressStepper from '@/components/ui/progress-stepper';

const SignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, submitBiodata } = useAuth();
  const { toast } = useToast();

  const handleCredentialsSubmit = async (e) => {
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
      setCurrentStep(2);
    }
  };

  const handleVerificationComplete = () => {
    setCurrentStep(3);
  };

  const handleBiodataComplete = async (biodataFormData) => {
    try {
      await submitBiodata(email, biodataFormData);
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to HyperX. Redirecting to setup your PIN...",
      });
      setTimeout(() => {
        window.location.href = '/setup-pin';
      }, 1500);
    } catch (error) {
      console.error('Error submitting biodata:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleBackToCredentials = () => {
    setCurrentStep(1);
  };

  const handleBackToVerification = () => {
    setCurrentStep(2);
  };

  if (currentStep === 2) {
    return (
      <EmailVerification
        email={email}
        onVerified={handleVerificationComplete}
        onBack={handleBackToCredentials}
      />
    );
  }

  if (currentStep === 3) {
    return (
      <BiodataForm
        email={email}
        onComplete={handleBiodataComplete}
        onBack={handleBackToVerification}
      />
    );
  }

  const steps = [
    { label: 'Credentials' },
    { label: 'Verify Email' },
    { label: 'Biodata' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      <div className="text-center pt-6 pb-2">
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

      <ProgressStepper steps={steps} currentStep={currentStep} />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Wallet</h2>
            <p className="text-sm text-muted-foreground">
              Join thousands of users managing crypto securely
            </p>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-11 border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="h-11 border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 pr-8 text-sm"
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

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="h-11 border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 pr-8 text-sm"
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

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base rounded-xl shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="h-4 w-4 border-2 border-transparent border-t-white rounded-full mr-2"
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Continue
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="text-center pb-6 pt-4">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignupPage;