import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Send as SendIcon,
  Download,
  RefreshCw,
  Settings as SettingsIcon,
  Menu,
  MoreVertical,
  X,
  Bitcoin,
  Wallet,
  LogOut,
  LogIn,
  Repeat,
  History,
  Globe,
  Bell,
  HelpCircle,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useModal } from "@/context/ModalContext";
import NotificationModal from "@/components/modals/NotificationModal";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { getTotalBalance } = useWallet();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { isModalOpen } = useModal();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/swap", label: "Swap", icon: Repeat },
    { path: "/explorer", label: "Explorer", icon: Globe },
    { path: "/convert", label: "Convert", icon: RefreshCw },
    { path: "/history", label: "History", icon: History },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getUserInitials = () => {
    if (!user || !user.email) return "USER";
    return user.email.substring(0, 5).toUpperCase();
  };

  const getUserName = () => {
    if (!user || !user.email) return "User";
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); 
  };
  
  const handleLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleHelpClick = () => {
    console.log('Help clicked');
  };

  const notifications = [
    {
      id: 1,
      type: "deposit",
      title: "Deposit Received",
      message: "Your Bitcoin deposit has been confirmed and added to your wallet.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      amount: "0.00125",
      currency: "BTC"
    },
    {
      id: 2,
      type: "promotion",
      title: "Special Offer: 0% Trading Fees",
      message: "Trade with zero fees for the next 24 hours! Limited time offer for premium users.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false
    },
    {
      id: 3,
      type: "security",
      title: "New Login Detected",
      message: "We detected a new login from Chrome on Windows. If this wasn't you, please secure your account.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      isRead: true
    },
  ];

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Check if current route is explorer to apply full-screen layout
  const isExplorerPage = location.pathname === '/explorer';
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {!isExplorerPage && (
        <header className="sticky top-0 z-50 flex items-center justify-between p-4 md:hidden bg-background/95 backdrop-blur-md border-b border-border/30">
        {user ? (
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-white dark:bg-white flex items-center justify-center border-2 border-primary/30 overflow-hidden shrink-0">
              <img
                src="/my-new-logo.png"
                alt="HyperX Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="text-sm font-semibold text-foreground">Hi, {getUserName()}</span>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">HyperX</span>
          </Link>
        )}
        {user && (
          <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full relative"
              onClick={() => setIsNotificationModalOpen(true)}
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                  {unreadNotificationsCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full"
              onClick={handleHelpClick}
            >
              <HelpCircle size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X /> : <MoreVertical />}
            </Button>
          </div>
        )}
        </header>
      )}

      {user && (
        <motion.aside
          className={cn(
            "glass-effect fixed inset-0 z-40 flex flex-col overflow-y-auto border-r border-border/30 p-6 md:relative md:w-64 md:translate-x-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          initial={false}
          animate={{ 
            translateX: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? "-100%" : 0) 
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">HyperX</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              <X />
            </Button>
          </div>

          <div className="crypto-card rounded-xl p-4 mb-8">
            <div
              className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                navigate('/profile');
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-white flex items-center justify-center border-2 border-primary/30 overflow-hidden shrink-0">
                <img
                  src="/my-new-logo.png"
                  alt="HyperX Logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Hi, {getUserName()}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="border-t border-border/50 pt-3">
              <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
              <h2 className="text-2xl font-bold">${getTotalBalance().toLocaleString('en-US', { maximumFractionDigits: 2 })}</h2>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-muted relative",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 h-full w-1 rounded-r-full bg-primary"
                      layoutId="sidebar-highlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 space-y-2">
            {user ? (
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <Button variant="default" className="w-full crypto-gradient" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bitcoin className="h-4 w-4" />
              <span>Powered by HyperX Inc.</span>
            </div>
          </div>
        </motion.aside>
      )}

      {user && isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <main className={cn(
        "flex-1", 
        !user && "md:ml-0",
        isExplorerPage ? "p-0" : "p-4 md:p-8 pb-20 md:pb-8"
      )}>{children}</main>

      {!isModalOpen && user && (location.pathname === "/" || location.pathname === "/explorer" || location.pathname === "/card") && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-background/80 backdrop-blur-md md:hidden">
          <div className="flex justify-around items-center h-16">
            {[
              { path: "/", label: "Home", icon: Home },
              { path: "/swap", label: "Swap", icon: Repeat },
              { path: "/card", label: "Card", icon: CreditCard },
              { path: "/explorer", label: "Explorer", icon: Globe },
            ].map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full transition-colors duration-200 relative",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-6 w-6 mb-0.5", isActive && "text-primary")} />
                  <span className="text-xs">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 h-0.5 w-1/2 rounded-t-full bg-primary"
                      layoutId="bottom-nav-highlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
      />
    </div>
  );
};

export default Layout;