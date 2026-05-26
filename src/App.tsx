import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  Settings, 
  FolderGit2, 
  LogOut, 
  LogIn, 
  User, 
  HelpCircle,
  Gem,
  CheckCircle,
  KeyRound,
  Gamepad2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Storefront from "./components/Storefront.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import ApiPlayground from "./components/ApiPlayground.tsx";
import AiSparkle from "./components/AiSparkle.tsx";

export default function App() {
  const [activeTab, setActiveTab] = useState<"storefront" | "admin" | "playground" | "ai">("storefront");
  
  // Auth credentials states
  const [token, setToken] = useState<string | null>(localStorage.getItem("tinytreasure_token"));
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Force child triggers in API Logging
  const [logRefreshTrigger, setLogRefreshTrigger] = useState(0);

  // Check and restore active user session from credentials token
  const restoreUserSession = async (activeToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      } else {
        // stale token
        handleSignOut();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      restoreUserSession(token);
    }
  }, [token]);

  const handleSignIn = async (emailToSubmit: string, nameToSubmit?: string) => {
    setAuthError(null);
    try {
      let endpoint = "/api/auth/login";
      let body: any = { email: emailToSubmit.trim() };

      if (isRegisterMode && nameToSubmit) {
        endpoint = "/api/auth/register";
        body.name = nameToSubmit.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("tinytreasure_token", data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAuthOpen(false);
        setAuthEmail("");
        setAuthName("");
        triggerLogUpdate();
      } else {
        setAuthError(data.error || "Authentication procedure failed.");
      }
    } catch (err) {
      setAuthError("Failed to connect to express gateway.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("tinytreasure_token");
    setToken(null);
    setCurrentUser(null);
    triggerLogUpdate();
  };

  const triggerLogUpdate = () => {
    setLogRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-brand-pink/20 bg-[#FBF7F4]">
      
      {/* GLOBAL HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo Identity */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("storefront")}>
            <span className="w-9 h-9 bg-brand-pink text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shadow-brand-pink/20 float-hover">
              🍬
            </span>
            <div className="text-left leading-none">
              <h1 className="text-sm font-bold tracking-tight font-display text-slate-800">TinyTreasure</h1>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest block">Premium Kids Boutique</span>
            </div>
          </div>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("storefront")}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === "storefront" 
                  ? "bg-brand-pink/10 text-brand-pink font-bold" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              🧸 Retail Store
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                activeTab === "ai" 
                  ? "bg-brand-pink text-white font-bold shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Magical Stories
            </button>

            <button
              onClick={() => setActiveTab("playground")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                activeTab === "playground" 
                  ? "bg-brand-navy text-white font-bold shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" /> REST Playground
            </button>

            <button
              onClick={() => {
                if (currentUser?.isAdmin) {
                  setActiveTab("admin");
                } else {
                  setIsAuthOpen(true);
                  setIsRegisterMode(false);
                }
              }}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                activeTab === "admin" 
                  ? "bg-brand-navy text-white font-bold" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Caretaker Room
            </button>
          </nav>

          {/* User Session Profile Controls */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-800 block leading-none">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {currentUser.isAdmin ? "👑 Caretaker Admin" : "🏡 Parent Session"}
                  </span>
                </div>
                
                <img
                  src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=cozy"}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50"
                />

                <button
                  onClick={handleSignOut}
                  className="p-1.5 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthOpen(true);
                  setIsRegisterMode(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Portal Log In</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MOBILE LOWER TABS HELPER */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2.5 z-40 flex justify-around items-center text-[10px] font-semibold text-slate-500 shadow-xs">
        <button onClick={() => setActiveTab("storefront")} className={`flex flex-col items-center gap-0.5 ${activeTab === "storefront" ? "text-brand-pink" : ""}`}>
          <span>🧸</span> Retail Store
        </button>
        <button onClick={() => setActiveTab("ai")} className={`flex flex-col items-center gap-0.5 ${activeTab === "ai" ? "text-brand-pink" : ""}`}>
          <Sparkles className="w-4 h-4" /> Magical stories
        </button>
        <button onClick={() => setActiveTab("playground")} className={`flex flex-col items-center gap-0.5 ${activeTab === "playground" ? "text-brand-navy" : ""}`}>
          <FolderGit2 className="w-4 h-4" /> REST
        </button>
        <button 
          onClick={() => {
            if (currentUser?.isAdmin) {
              setActiveTab("admin");
            } else {
              setIsAuthOpen(true);
            }
          }} 
          className={`flex flex-col items-center gap-0.5 ${activeTab === "admin" ? "text-brand-navy" : ""}`}
        >
          <Settings className="w-4 h-4" /> Caretaker
        </button>
      </div>

      {/* SYSTEM NOTICE ALERT ON SECRETS */}
      <div className="bg-brand-navy text-slate-200 text-xs py-2 px-4 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span>
              <strong>Platform Notice:</strong> Live Custom REST API architecture active on port <code>3000</code>. Fits multi-role credentials securely.
            </span>
          </div>
          <div className="text-[10px] text-slate-450 uppercase font-semibold">
             Grounded Gemini Sandbox Active
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT CANVAS CONTAINER */}
      <main id="main-content-canvas" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-12 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "storefront" && (
              <Storefront 
                token={token} 
                onOpenAuth={() => setIsAuthOpen(true)} 
                onTriggerLog={triggerLogUpdate} 
              />
            )}

            {activeTab === "admin" && (
              <AdminDashboard 
                token={token} 
                onOpenAuth={() => setIsAuthOpen(true)}
                onTriggerLog={triggerLogUpdate} 
              />
            )}

            {activeTab === "playground" && (
              <ApiPlayground 
                token={token} 
                onRefreshStates={triggerLogUpdate} 
              />
            )}

            {activeTab === "ai" && (
              <AiSparkle 
                onTriggerLog={triggerLogUpdate} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* COMPACT FOOTER BRANDING */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-slate-400 text-xs select-none">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-display font-bold text-slate-700 text-xs">TinyTreasure Premium Kids Store</p>
          <p>Clean REST & Firebase Architecture Built with Deep Love and Cozy Stardust.</p>
        </div>
      </footer>

      {/* MULTI-ROLE AUTH DIALOG MODAL */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setIsAuthOpen(false)}
            ></motion.div>

            {/* Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 space-y-4 text-center z-10"
            >
              <div className="w-12 h-12 bg-brand-pink/10 text-brand-pink rounded-full flex items-center justify-center mx-auto text-lg mb-2">
                👑
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-bold text-md text-slate-850">
                  {isRegisterMode ? "Create Kids-friendly Account" : "Access Parent & Caretaker Portal"}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enter your parent credentials to synchronize cart items, post product reviews, and see invoice logs.
                </p>
              </div>

              {authError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[11px] font-semibold">
                  ⚠️ {authError}
                </div>
              )}

              {/* Form entries */}
              <div className="space-y-3">
                {isRegisterMode && (
                  <input
                    type="text"
                    placeholder="My Name (e.g., Liam's Dad)"
                    className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                )}

                <input
                  type="email"
                  placeholder="My Email address"
                  className="w-full p-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />

                <button
                  onClick={() => handleSignIn(authEmail, authName)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  {isRegisterMode ? "Formulate Account" : "Access Credentials"}
                </button>
              </div>

              {/* SHORTCUTS QUICK-LOGIN FOR USER CONVENIENCE */}
              <div className="pt-3 border-t border-slate-105 space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Login Presets (Zero Typing!)
                </span>
                
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setAuthEmail("saigoutham700@gmail.com");
                      setIsRegisterMode(false);
                      handleSignIn("saigoutham700@gmail.com");
                    }}
                    className="p-2 bg-brand-pink/10 text-brand-pink hover:bg-brand-pink hover:text-white rounded-xl text-[10.5px] font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" /> saigoutham700@gmail.com (Caretaker Admin)
                  </button>

                  <button
                    onClick={() => {
                      setAuthEmail("emily.parent@gmail.com");
                      setIsRegisterMode(false);
                      handleSignIn("emily.parent@gmail.com");
                    }}
                    className="p-2 bg-brand-blue/20 text-slate-800 hover:bg-brand-blue rounded-xl text-[10.5px] font-medium transition-all flex items-center justify-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" /> emily.parent@gmail.com (Cozy Parent)
                  </button>
                </div>
              </div>

              {/* Switch links */}
              <div className="text-[11px] text-slate-400">
                {isRegisterMode ? (
                  <span>
                    Already registered?{" "}
                    <button onClick={() => setIsRegisterMode(false)} className="text-brand-pink hover:underline font-semibold font-display">
                      Sign in back
                    </button>
                  </span>
                ) : (
                  <span>
                    New parent to TinyTreasure?{" "}
                    <button onClick={() => setIsRegisterMode(true)} className="text-brand-pink hover:underline font-semibold font-display">
                      Register free account here
                    </button>
                  </span>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
