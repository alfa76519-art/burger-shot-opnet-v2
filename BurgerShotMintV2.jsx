import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Moon, Sun, Wallet, ShoppingCart, Clock, CheckCircle, ChevronRight, ExternalLink, Menu, X, Bitcoin } from 'lucide-react';

// 🍔 BurgerShot BGS Contract — OP_NET Testnet
const BGS_CONTRACT_ADDRESS = "0x527828de2b1484f50731ed7bcd6bcf8705c875ab3d56f9e1de0e778306a7e65a";
const OPNET_RPC = "https://testnet.opnet.org";
const BSHOT_PRICE = 0.001;

// 🔊 Audio setup
const grillAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
grillAudio.volume = 0.4;
grillAudio.preload = "auto";
const bellAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/931/931-preview.mp3");
bellAudio.volume = 0.4;
bellAudio.preload = "auto";

const playSound = (audio) => {
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(e => console.warn("Audio blocked:", e));
  } catch(e) {
    console.warn("Audio error (non-fatal):", e);
  }
};

function BurgerShotMint() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [rBTCBalance, setRBTCBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [mintAmount, setMintAmount] = useState(0);
  const [slippage, setSlippage] = useState(2.5);
  const [particles, setParticles] = useState([]);
  const [loadingState, setLoadingState] = useState({ connecting: false, minting: false });
  const [mintStatus, setMintStatus] = useState(null);
  const [lastTxId, setLastTxId] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [txCountdown, setTxCountdown] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [showBob, setShowBob] = useState(false); // 🤖 AI BOB chat popup

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.duration || 5000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const [isDark, setIsDark] = useState(true);
  const th = isDark ? {
    bg: "#0a0a0a", card: "rgba(20,20,20,0.95)", cardBorder: "rgba(221,159,95,0.12)",
    text: "#ffffff", subtext: "rgba(255,255,255,0.4)", mutedtext: "rgba(255,255,255,0.2)",
    inputBg: "rgba(255,255,255,0.03)", inputBorder: "rgba(255,255,255,0.06)",
    panelBg: "rgba(12,12,12,0.92)", panelBorder: "rgba(221,159,95,0.15)",
    rowHover: "rgba(255,255,255,0.04)", rowBorder: "rgba(255,255,255,0.05)",
    gridLine: "rgba(221,159,95,0.03)", walletText: "rgba(255,255,255,0.5)",
    accent: "#DD9F5F",
  } : {
    bg: "#faf6f0", card: "rgba(255,255,255,0.97)", cardBorder: "rgba(184,115,51,0.2)",
    text: "#1a0e00", subtext: "rgba(30,20,5,0.5)", mutedtext: "rgba(30,20,5,0.3)",
    inputBg: "rgba(221,159,95,0.05)", inputBorder: "rgba(221,159,95,0.15)",
    panelBg: "rgba(255,248,238,0.97)", panelBorder: "rgba(184,115,51,0.2)",
    rowHover: "rgba(221,159,95,0.06)", rowBorder: "rgba(221,159,95,0.1)",
    gridLine: "rgba(184,115,51,0.06)", walletText: "rgba(30,20,5,0.45)",
    accent: "#B87333",
  };

  const minting = loadingState.minting;
  const connecting = loadingState.connecting;

  const MOCK_WALLETS = ["bc1p...9xka", "bc1q...3zft", "tb1p...m2rw", "bc1p...7yqt", "tb1q...44hn"];
  const MOCK_TOKENS = ["BSHOT", "GREASE", "BSHOT", "BSHOT", "GREASE"];

  const generateMintEvent = () => ({
    id: Date.now() + Math.random(),
    wallet: MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)],
    token: MOCK_TOKENS[Math.floor(Math.random() * MOCK_TOKENS.length)],
    amount: Math.floor(Math.random() * 20) + 1,
    time: new Date(),
    isNew: true,
  });

  const [recentMints, setRecentMints] = useState(() => [
    { id: 1, wallet: "bc1p...9xka", token: "BSHOT", amount: 5,  time: new Date(Date.now() - 12000), isNew: false },
    { id: 2, wallet: "bc1q...3zft", token: "GREASE", amount: 1, time: new Date(Date.now() - 38000), isNew: false },
    { id: 3, wallet: "tb1p...m2rw", token: "BSHOT", amount: 10, time: new Date(Date.now() - 74000), isNew: false },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    const poll = setInterval(() => {
      if (Math.random() < 0.4) {
        const newEvent = generateMintEvent();
        setRecentMints((prev) => [newEvent, ...prev].slice(0, 8));
        setLastRefreshed(new Date());
      }
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  const handleMaxClick = () => {
    const reserveForGas = 0.0001;
    const availableBalance = Math.max(0, rBTCBalance - reserveForGas);
    const maxBSHOT = Math.floor(availableBalance / BSHOT_PRICE);
    setMintAmount(Math.min(1000, Math.max(1, maxBSHOT)));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    const newEvent = generateMintEvent();
    setRecentMints((prev) => [newEvent, ...prev].slice(0, 8));
    setLastRefreshed(new Date());
    setRefreshing(false);
  };

  const addSelfToFeed = (amount) => {
    const selfEvent = {
      id: Date.now(),
      wallet: walletAddress || "bc1p...4x7f",
      token: "BSHOT",
      amount,
      time: new Date(),
      isNew: true,
    };
    setRecentMints((prev) => [selfEvent, ...prev].slice(0, 8));
    setLastRefreshed(new Date());
  };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return diff + "s ago";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    return Math.floor(diff / 3600) + "h ago";
  };

  useEffect(() => {
    const p = Array.from({ length: 18 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 4, dur: Math.random() * 6 + 4,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    if (mintStatus !== "success") return;
    setTxCountdown(8);
    const interval = setInterval(() => {
      setTxCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mintStatus]);

  const handleConnect = async () => {
    if (typeof window.opnet === "undefined") {
      window.open("https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb?hl=en-US&utm_source=ext_sidebar", "_blank");
      return;
    }
    setLoadingState((prev) => ({ ...prev, connecting: true }));
    try {
      const accounts = await window.opnet.requestAccounts();
      if (!accounts || accounts.length === 0) throw new Error("No accounts");
      const address = accounts[0];
      setConnected(true);
      setWalletAddress(address);
      const balanceRaw = await window.opnet.getBalance();
      const satoshi = balanceRaw?.confirmed || balanceRaw?.total || 0;
      const balance = parseFloat((satoshi / 1e8).toFixed(8));
      setRBTCBalance(balance);
      setDisplayBalance(balance);
    } catch (err) {
      console.warn("OPWallet connect cancelled:", err.message);
    } finally {
      setLoadingState((prev) => ({ ...prev, connecting: false }));
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setWalletAddress("");
    setMintStatus(null);
    setLastTxId("");
    setShowConfetti(false);
  };

  const animateBalance = (from, to, duration = 1200) => {
    const steps = 40;
    const stepTime = duration / steps;
    const diff = from - to;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBalance(parseFloat((from - diff * eased).toFixed(5)));
      if (step >= steps) {
        clearInterval(timer);
        setDisplayBalance(to);
        setRBTCBalance(to);
      }
    }, stepTime);
  };

  const handleMint = async () => {
    if (!connected) return;
    playSound(grillAudio);
    setLoadingState((prev) => ({ ...prev, minting: true }));
    setMintStatus(null);
    if (!window.opnet) {
  alert("OPWallet tidak terdeteksi!");
  return;
}
    try {
      // ✅ Selector publicMint dari SHA-256 OP_NET style: 5b293f3b
      const SELECTOR = "5b293f3b";

      // ✅ Konversi amount ke u256 (18 decimals) lalu hex 32 byte big-endian
      const amountU256 = BigInt(mintAmount) * BigInt("1000000000000000000");
      const amountHex = amountU256.toString(16).padStart(64, "0");
      const finalHexCalldata = ("0x5b293f3b" + amountHex).trim().replace(/\s+/g, "");

      // ✅ Final calldata = 0x + selector (4 byte) + amount (32 byte) = 36 byte total
      console.log("Calldata:", finalHexCalldata);

      const tx = await window.opnet.signAndBroadcastInteraction({
        to: BGS_CONTRACT_ADDRESS,
        calldata: finalHexCalldata,
        gasLimit: 500000n,
      });

      console.log("TX response:", tx);
      if (!tx) throw new Error("Transaction failed — no response from wallet");
      const realTx = typeof tx === "string" ? tx : (tx.hash || tx.txid || tx.transactionId || tx.result || "unknown");
      setLastTxId(realTx);
      setMintStatus("success");
      setShowConfetti(true);
      addSelfToFeed(mintAmount);
      playSound(bellAudio);
      addToast({ type: "success", mintAmt: mintAmount, txId: realTx, duration: 8000 });
      const newBalance = parseFloat((rBTCBalance - parseFloat(totalCost)).toFixed(5));
      animateBalance(rBTCBalance, Math.max(0, newBalance));
      setTimeout(() => setShowConfetti(false), 5000);
      setTimeout(() => { setMintStatus(null); setLastTxId(""); }, 8000);
    } catch (err) {
      setMintStatus("error");
      addToast({ type: "error", duration: 3500 });
      setTimeout(() => setMintStatus(null), 3500);
    } finally {
      setLoadingState((prev) => ({ ...prev, minting: false }));
    }
  };

  const totalCost = (mintAmount * BSHOT_PRICE).toFixed(4);
  const canAfford = rBTCBalance >= parseFloat(totalCost);

  const getButtonLabel = () => {
    if (loadingState.minting) return "GRILLING... 🔥";
    if (loadingState.connecting) return "ENTERING KITCHEN... 🚪";
    if (!connected) return "ENTER SHOP 🛎️";
    if (!canAfford) return "NOT ENOUGH CASH 💸";
    return "PLACE ORDER! 🍔";
  };

  return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: th.bg, color: th.text, transition: "background 0.4s ease, color 0.3s ease" }} className="min-h-screen relative overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute" style={{
              background: ['#dd9f5f','#f5c97a','#4ade80','#ffffff','#b87333','#34d399','#fbbf24','#6ee7b7'][i % 8],
              width: [8,12,6,10][i%4]+'px', height: [3,2,4,2][i%4]+'px',
              left: `${Math.random()*100}%`, top: `-10%`,
              opacity: Math.random()*0.6+0.4,
              transform: `rotate(${Math.random()*360}deg)`,
              animation: `confetti-fall ${2+Math.random()*3}s linear forwards`
            }} />
          ))}
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(221,159,95,0.12) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${th.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${th.gridLine} 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />
        {particles.map((p) => (
          <div key={p.id} className="absolute rounded-full" style={{
            left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`,
            background: "#dd9f5f", opacity: 0.25,
            animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float { from { transform: translateY(0px) scale(1); opacity: 0.15; } to { transform: translateY(-20px) scale(1.3); opacity: 0.45; } }
        @keyframes pulse-ring { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(221,159,95,0.5); } 70% { transform: scale(1); box-shadow: 0 0 0 14px rgba(221,159,95,0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(221,159,95,0); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes slide-up { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes toast-in { from { opacity: 0; transform: translateX(110%); } to { opacity: 1; transform: translateX(0); } }
        .shimmer-text { background: linear-gradient(90deg, #dd9f5f 0%, #f5c97a 40%, #dd9f5f 60%, #b87333 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        .mint-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 40px rgba(221,159,95,0.5), 0 8px 30px rgba(0,0,0,0.5); }
        .mint-btn:active:not(:disabled) { transform: translateY(0); }
        .mint-btn { transition: all 0.2s ease; }
        .connect-btn:hover { background: rgba(221,159,95,0.15) !important; border-color: rgba(221,159,95,0.8) !important; }
        .connect-btn { transition: all 0.2s ease; }
        .card-glow { box-shadow: 0 0 0 1px rgba(221,159,95,0.15), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05); }
        .slide-up { animation: slide-up 0.5s ease forwards; }
        .toast-enter { animation: toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "linear-gradient(135deg, #dd9f5f, #b87333)", boxShadow: "0 4px 16px rgba(221,159,95,0.4)" }}>🍔</div>
          <span className="font-bold text-lg tracking-tight">Burger<span className="shimmer-text">Shot</span></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "rgba(221,159,95,0.08)", border: "1px solid rgba(221,159,95,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse-ring 2s infinite" }} />
          <span className="text-[#dd9f5f]" style={{ fontFamily: "'Space Mono', monospace" }}>OP_NET</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8" style={{ minHeight: "calc(100vh - 100px)" }}>
        <div className="w-full max-w-md">

          {/* Hero */}
          <div className="text-center mb-8 slide-up">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(221,159,95,0.1)", border: "1px solid rgba(221,159,95,0.25)", color: "#dd9f5f" }}>✦ Token Launch</div>
            <h1 className="text-5xl font-extrabold leading-none mb-3 tracking-tight">Mint <span className="shimmer-text">$BSHOT</span></h1>
            <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: th.subtext }}>BurgerShot: Bleed Bitcoin, Eat Burgers. No Napkins Required.</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-6 card-glow slide-up" style={{ background: th.card, border: `1px solid ${th.cardBorder}`, animationDelay: "0.1s" }}>

            {/* Wallet Section */}
            {!connected ? (
              <div className="mb-5">
                <button onClick={handleConnect} disabled={connecting} className="connect-btn w-full py-4 rounded-xl font-semibold text-sm tracking-wide flex items-center justify-center gap-3" style={{ background: "rgba(221,159,95,0.08)", border: "1px solid rgba(221,159,95,0.3)", color: "#dd9f5f", cursor: connecting ? "wait" : "pointer" }}>
                  {connecting ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-t-transparent" style={{ borderColor: "#dd9f5f", borderTopColor: "transparent", animation: "spin-slow 0.8s linear infinite" }} />Connecting...</>
                  ) : (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7"/><path d="M22 7l-6-4"/><circle cx="17" cy="14" r="1" fill="currentColor"/></svg>Connect OPWallet</>
                  )}
                </button>
                {typeof window !== "undefined" && typeof window.opnet === "undefined" && (
                  <a href="https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb?hl=en-US&utm_source=ext_sidebar" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-2 py-2 px-3 rounded-xl text-[11px] font-medium transition-all hover:opacity-80" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(251,191,36,0.9)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    OPWallet not detected — Click to install
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
              </div>
            ) : (
              <div className="mb-5 p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(221,159,95,0.06)", border: "1px solid rgba(221,159,95,0.15)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg, #dd9f5f22, #dd9f5f44)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dd9f5f" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Connected</p>
                  <p className="text-xs font-semibold truncate" style={{ fontFamily: "'Space Mono', monospace", color: "#dd9f5f" }}>{walletAddress}</p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <button onClick={handleDisconnect} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "rgba(248,113,113,0.7)" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Disconnect
                  </button>
                </div>
              </div>
            )}

            {/* Balance */}
            <div className="rounded-xl p-4 mb-4" style={{ background: th.inputBg, border: `1px solid ${th.inputBorder}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: th.subtext }}>tBTC Balance</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
                    <span className="shimmer-text">{displayBalance.toFixed(4)}</span>
                    <span className="text-sm ml-1 font-normal" style={{ color: th.mutedtext }}>tBTC</span>
                  </p>
                </div>
                <div className="text-3xl opacity-60">₿</div>
              </div>
            </div>

            <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, rgba(221,159,95,0.2), transparent)" }} />

            {/* Mint Amount */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest" style={{ color: th.subtext }}>Mint Amount</p>
                <div className="flex items-center gap-2">
                  <button onClick={handleMaxClick} className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-widest transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #dd9f5f, #b87333)", color: "#1a0e00", boxShadow: "0 2px 8px rgba(221,159,95,0.35)" }}>⚡ MAX</button>
                  <p className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: "#dd9f5f" }}>{totalCost} tBTC</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setMintAmount(Math.max(1, mintAmount - 1))} className="w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center transition-all hover:scale-105" style={{ background: "rgba(221,159,95,0.1)", border: "1px solid rgba(221,159,95,0.2)", color: "#dd9f5f" }}>−</button>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={mintAmount === 0 ? "" : mintAmount} placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    if (raw === "") { setMintAmount(0); return; }
                    const val = parseInt(raw, 10);
                    if (!isNaN(val)) setMintAmount(Math.min(1000, val));
                  }}
                  className="flex-1 text-center text-2xl font-extrabold bg-transparent outline-none w-full"
                  style={{ fontFamily: "'Space Mono', monospace", color: th.text }}
                />
                <button onClick={() => setMintAmount(Math.min(1000, mintAmount + 1))} className="w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center transition-all hover:scale-105" style={{ background: "rgba(221,159,95,0.1)", border: "1px solid rgba(221,159,95,0.2)", color: "#dd9f5f" }}>+</button>
              </div>
              <div className="flex gap-2 mt-3">
                {[100, 250, 500, 1000].map((n) => (
                  <button key={n} onClick={() => setMintAmount(n)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105" style={{ background: mintAmount === n ? "linear-gradient(135deg, #dd9f5f, #b87333)" : th.inputBg, border: `1px solid ${mintAmount === n ? "rgba(221,159,95,0.5)" : th.inputBorder}`, color: mintAmount === n ? "#1a0e00" : th.subtext }}>{n}</button>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: th.inputBg, border: `1px solid ${th.inputBorder}` }}>
              <div className="flex justify-between mb-1" style={{ color: th.subtext }}>
                <span>Price per $BGS</span>
                <span style={{ fontFamily: "'Space Mono', monospace" }}>{BSHOT_PRICE} tBTC</span>
              </div>
              <div className="flex justify-between mb-1" style={{ color: th.subtext }}>
                <span>Max per tx</span>
                <span style={{ fontFamily: "'Space Mono', monospace", color: "#dd9f5f" }}>1,000 BGS</span>
              </div>
              <div className="flex justify-between mb-1" style={{ color: th.subtext }}>
                <span>Gas fee (est.)</span>
                <span style={{ fontFamily: "'Space Mono', monospace" }}>~0.00002 tBTC</span>
              </div>
              <div className="mt-2 mb-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ color: th.subtext }}>Max Slippage</span>
                  <div className="flex items-center gap-1">
                    {[2.5, 3.0, 5.0].map((v) => (
                      <button key={v} onClick={() => setSlippage(v)} className="text-[10px] font-bold px-1.5 py-0.5 rounded transition-all" style={{ background: slippage === v ? "rgba(221,159,95,0.25)" : "rgba(255,255,255,0.05)", border: `1px solid ${slippage === v ? "rgba(221,159,95,0.6)" : "rgba(255,255,255,0.08)"}`, color: slippage === v ? "#dd9f5f" : th.subtext }}>{v}%</button>
                    ))}
                    <div className="flex items-center rounded px-1.5 py-0.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <input type="number" min="2.5" max="10" step="0.1" value={slippage}
                        onChange={(e) => { const val = parseFloat(e.target.value); if (!isNaN(val)) setSlippage(Math.min(10, Math.max(2.5, val))); }}
                        className="w-8 text-[10px] font-bold text-center bg-transparent outline-none"
                        style={{ color: "#dd9f5f", fontFamily: "'Space Mono', monospace" }}
                      />
                      <span className="text-[10px]" style={{ color: th.subtext }}>%</span>
                    </div>
                  </div>
                </div>
                {slippage > 3.0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] text-amber-400" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <span>⚠️</span> High slippage — your transaction may be front-run.
                  </div>
                )}
              </div>
              <div className="h-px my-2" style={{ background: "rgba(221,159,95,0.15)" }} />
              <div className="flex justify-between font-bold">
                <span style={{ color: "#dd9f5f" }}>Total</span>
                <span style={{ fontFamily: "'Space Mono', monospace", color: "#dd9f5f" }}>{totalCost} tBTC</span>
              </div>
            </div>

            {connected && !canAfford && (
              <div className="mb-4 p-3 rounded-xl text-xs text-amber-400 flex gap-2" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <span>⚠️</span> Insufficient tBTC balance for this mint amount.
              </div>
            )}

            {/* Mint Button */}
            <button onClick={handleMint} disabled={!connected || minting || !canAfford}
              className="mint-btn w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: connected && canAfford ? "linear-gradient(135deg, #dd9f5f 0%, #c47d2e 100%)" : "rgba(221,159,95,0.2)", color: connected && canAfford ? "#1a0e00" : "rgba(221,159,95,0.5)", boxShadow: connected && canAfford && !minting ? "0 0 24px rgba(221,159,95,0.3), 0 4px 16px rgba(0,0,0,0.4)" : "none" }}
            >
              {loadingState.minting && <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#1a0e00]" style={{ animation: "spin-slow 0.8s linear infinite" }} />}
              {getButtonLabel()}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-4 pt-6" style={{ borderTop: `1px solid ${isDark ? "rgba(221,159,95,0.1)" : "rgba(184,115,51,0.1)"}` }}>
            <p className="text-[11px] font-semibold tracking-wide uppercase" style={{ fontFamily: "'Space Mono', monospace", color: isDark ? "rgba(221,159,95,0.6)" : "rgba(184,115,51,0.7)" }}>
              Built on OP_NET — Bitcoin's Smart Contract Layer 1
            </p>
            <div className="flex justify-center gap-4 text-[10px] font-mono opacity-40 uppercase tracking-widest">
              <a href="https://opscan.org/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-all" style={{ color: th.accent }}>Opscan</a>
              <span style={{ color: th.accent }}>•</span>
              <a href="https://optools.org/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-all" style={{ color: th.accent }}>OP Tools</a>
            </div>
            <div className="flex items-center justify-center gap-6 pb-4">
              {/* X */}
              <a href="https://x.com/Elvan_Adi28" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:scale-110" style={{ color: th.accent }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.25h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Discord — fixed SVG */}
              <a href="https://discord.gg/opnet" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:scale-110" style={{ color: th.accent }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a href="https://t.me/opnetbtc" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:scale-110" style={{ color: th.accent }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.762 5.319-1.083 7.029-.137.724-.403.967-.658.99-.554.051-1.06-.327-1.597-.679-.84-.551-1.314-.894-2.13-1.432-1.02-.673-.359-1.042.222-1.647.152-.158 2.796-2.564 2.848-2.787a.214.214 0 0 0-.05-.188.252.252 0 0 0-.24-.046c-.084.02-1.42.903-4.002 2.647-.378.26-.722.387-1.03.38-.34-.007-1.012-.19-1.507-.35-.607-.197-1.089-.301-1.047-.636.022-.175.263-.355.724-.539 2.825-1.23 4.707-2.042 5.647-2.437 2.682-1.127 3.24-1.322 3.603-1.328z"/></svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com/alfa76519-art" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:scale-110" style={{ color: th.accent }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              {/* Docs */}
              <a href="https://docs.opnet.org/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:scale-110" style={{ color: th.accent }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Portal */}
      <div className="fixed z-[9999] flex flex-col gap-2" style={{ maxWidth: "320px", top: "80px", right: "20px" }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-enter rounded-2xl overflow-hidden" style={{ background: isDark ? "rgba(15,15,15,0.97)" : "rgba(255,252,247,0.97)", border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(20px)" }}>
            <div className="h-0.5 w-full" style={{ background: toast.type === "success" ? "linear-gradient(90deg, #4ade80, #34d399)" : "linear-gradient(90deg, #f87171, #ef4444)" }} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{toast.type === "success" ? "✅" : "❌"}</span>
                  <span className="text-sm font-bold" style={{ color: toast.type === "success" ? "#4ade80" : "#f87171" }}>
                    {toast.type === "success" ? "ORDER READY! 🍔" : "KITCHEN BUSY! ⚠️"}
                  </span>
                </div>
                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity" style={{ color: th.subtext }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <p className="text-xs mb-3" style={{ color: th.subtext }}>
                {toast.type === "success" ? "Your BSHOT burgers have been served to your wallet." : "The chef is tired or gas is high. Try again!"}
              </p>
              {toast.type === "success" && toast.txId && (
                <div className="rounded-xl p-2.5" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: "'Space Mono', monospace", color: "rgba(74,222,128,0.5)", fontSize: "9px" }}>TX ID</span>
                    <a href={"https://explorer.opnet.org/tx/" + toast.txId} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline px-2 py-1 rounded-lg transition-all hover:bg-green-400/10" style={{ fontFamily: "'Space Mono', monospace", color: "#4ade80", fontSize: "10px" }}>
                      {toast.txId.slice(0, 8)}...{toast.txId.slice(-6)}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(52,211,153,0.1)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(txCountdown/8)*100}%`, background: txCountdown > 3 ? "#4ade80" : "#fbbf24", transition: "width 1s linear, background 0.3s ease" }} />
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: txCountdown > 3 ? "rgba(74,222,128,0.6)" : "rgba(251,191,36,0.8)", minWidth: "68px", textAlign: "right" }}>Link expires in {txCountdown}s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Mints Panel */}
      <div className="fixed bottom-5 left-5 z-50" style={{ width: "260px" }}>
        <div className="rounded-2xl overflow-hidden" style={{ background: th.panelBg, border: `1px solid ${th.panelBorder}`, backdropFilter: "blur(16px)", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
          <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#4ade80" }}/>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#dd9f5f" }}>Recent Mints</span>
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center justify-center w-6 h-6 rounded-lg transition-all hover:scale-110 disabled:opacity-40" style={{ background: "rgba(221,159,95,0.1)", border: "1px solid rgba(221,159,95,0.2)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#dd9f5f" strokeWidth="2.5" style={{ animation: refreshing ? "spin-slow 0.8s linear infinite" : "none" }}>
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
          </div>
          <div className="px-2 py-2 space-y-1" style={{ maxHeight: "220px", overflowY: "auto" }}>
            {recentMints.map((event) => (
              <div key={event.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: event.isNew ? "rgba(221,159,95,0.12)" : th.rowHover, border: event.isNew ? "1px solid rgba(221,159,95,0.2)" : "1px solid transparent", transition: "all 0.4s ease" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: "rgba(221,159,95,0.12)" }}>🍔</div>
                <div className="flex-1 min-w-0">
                  <a href={"https://explorer.opnet.org/address/" + event.wallet} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] truncate hover:underline transition-colors duration-200"
                    style={{ fontFamily: "'Space Mono', monospace", color: th.walletText, display: "block" }}
                    onMouseEnter={e => e.currentTarget.style.color="#dd9f5f"}
                    onMouseLeave={e => e.currentTarget.style.color=th.walletText}
                  >{event.wallet}</a>
                  <p className="text-[11px] font-bold" style={{ color: event.token === "GREASE" ? "#a3e635" : "#dd9f5f" }}>+{event.amount} ${event.token}</p>
                </div>
                <span className="text-[9px] text-white/25 flex-shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>{formatTime(event.time)}</span>
              </div>
            ))}
          </div>
          <div className="px-3.5 py-2" style={{ borderTop: `1px solid ${th.rowBorder}` }}>
            <p className="text-[9px]" style={{ fontFamily: "'Space Mono', monospace", color: th.mutedtext }}>Updated {formatTime(lastRefreshed)} · auto-refresh 5s</p>
          </div>
        </div>
      </div>

      {/* 🤖 AI BOB Chat Popup */}
      {showBob && (
        <div className="fixed z-[10000]" style={{ bottom: "140px", right: "20px", width: "360px", height: "500px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(221,159,95,0.3)", border: `1px solid ${th.accent}` }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: isDark ? "rgba(15,15,15,0.98)" : "rgba(255,248,238,0.98)", borderBottom: `1px solid rgba(221,159,95,0.2)` }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: "linear-gradient(135deg, #dd9f5f, #b87333)" }}>🤖</div>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "'Space Mono', monospace", color: th.accent }}>AI BOB — OP_NET</span>
            </div>
            <button onClick={() => setShowBob(false)} className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:scale-110" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "rgba(248,113,113,0.8)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {/* iFrame */}
          <iframe
            src="https://ai.opnet.org/"
            title="AI BOB"
            width="100%"
            height="100%"
            style={{ border: "none", background: "#0a0a0a" }}
            allow="clipboard-write"
          />
        </div>
      )}

      {/* 🤖 AI BOB + 🌓 Theme Toggle — Floating Control Hub */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
        {/* AI BOB Button */}
        <button
          onClick={() => setShowBob((b) => !b)}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl transition-all hover:scale-105"
          style={{ background: th.panelBg, border: `1px dashed ${th.accent}`, backdropFilter: "blur(16px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)", color: th.accent, cursor: "pointer" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>{showBob ? "CLOSE BOB ✕" : "ASK BOB 🤖"}</span>
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: th.panelBg, border: `1px solid ${th.panelBorder}`, backdropFilter: "blur(16px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.25)" : "#dd9f5f"} strokeWidth="2.5">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <button onClick={() => setIsDark((d) => !d)} className="relative flex-shrink-0" style={{ width: "44px", height: "24px", borderRadius: "12px", background: isDark ? "linear-gradient(135deg, #dd9f5f, #b87333)" : "rgba(221,159,95,0.25)", border: "1px solid rgba(221,159,95,0.3)", cursor: "pointer", transition: "background 0.35s ease", padding: 0 }}>
            <span style={{ position: "absolute", top: "3px", left: isDark ? "22px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: isDark ? "#1a0e00" : "#dd9f5f", transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", display: "block" }} />
          </button>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#dd9f5f" : "rgba(30,20,5,0.25)"} strokeWidth="2.5">
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
          </svg>
        </div>
      </div>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BurgerShotMint />);