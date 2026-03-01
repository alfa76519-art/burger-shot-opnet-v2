const { useState, useEffect } = React;

function BurgerShotMint() {
  // --- CONFIG ---
  const BSHOT_PRICE = 0.001;
  const GAS_RESERVE = 0.0002; // Cadangan gas biar ga error saat MAX

  // --- STATES (Semua State Balik Lagi!) ---
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [rBTCBalance, setRBTCBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [mintAmount, setMintAmount] = useState(1);
  const [slippage, setSlippage] = useState(0.5); // Slippage Selector Balik!
  const [isDark, setIsDark] = useState(true);
  const [loadingState, setLoadingState] = useState({ connecting: false, minting: false });
  const [toasts, setToasts] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- THEME (Tetap Mewah) ---
  const th = isDark ? {
    bg: "#0a0a0a", card: "rgba(20,20,20,0.95)", border: "rgba(221,159,95,0.12)",
    text: "#ffffff", sub: "rgba(255,255,255,0.4)", accent: "#dd9f5f"
  } : {
    bg: "#faf6f0", card: "rgba(255,255,255,0.97)", border: "rgba(184,115,51,0.2)",
    text: "#1a0e00", sub: "rgba(30,20,5,0.5)", accent: "#b87333"
  };

  const addToast = (t) => {
    const id = Date.now();
    setToasts(p => [...p, { id, ...t }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 5000);
  };

  // --- REAL BALANCE LOGIC ---
  const updateBalance = async () => {
    if (window.opnet) {
      try {
        const res = await window.opnet.getBalance();
        const realVal = parseFloat(res.confirmed / 100000000);
        setRBTCBalance(realVal);
        setDisplayBalance(realVal);
      } catch (e) { console.error(e); }
    }
  };

  const handleMax = () => {
    const max = Math.floor((rBTCBalance - GAS_RESERVE) / BSHOT_PRICE);
    setMintAmount(max > 0 ? max : 1);
    addToast({ type: "info", title: "Max Amount Calculated!" });
  };

  const handleConnect = async () => {
    setLoadingState(p => ({ ...p, connecting: true }));
    try {
      // Kita cek satu-satu: window.opwallet dulu, baru window.opnet sebagai cadangan
      const provider = window.opwallet || window.opnet;

      if (typeof provider !== 'undefined') {
        console.log("Wallet ditemukan!", provider);
        
        // Minta ijin konek akun
        const accounts = await provider.requestAccounts();
        
        if (accounts && accounts.length > 0) {
          setConnected(true);
          setWalletAddress(accounts[0]);
          
          // Update saldo pake provider yang ketemu
          const res = await provider.getBalance();
          const realVal = parseFloat(res.confirmed / 100000000);
          setRBTCBalance(realVal);
          setDisplayBalance(realVal);
          
          addToast({ type: "success", title: "Welcome to BurgerShot!" });
        }
      } else {
        // Kalau beneran ga ada, lempar ke link yang kamu kasih tadi
        alert("OPWallet tidak terdeteksi! Mengalihkan ke Chrome Store...");
        window.open('https://chromewebstore.google.com/detail/opwallet/pmbjpcmaaladnfpacpmhmnfmpklgbdjb', '_blank');
      }
    } catch (e) {
      console.error("Gagal konek:", e);
      addToast({ type: "error", title: "Connection Rejected" });
    } finally {
      setLoadingState(p => ({ ...p, connecting: false }));
    }
  };

  const handleMint = async () => {
    const totalCost = (mintAmount * BSHOT_PRICE);
    if (rBTCBalance < totalCost) return addToast({ type: "error", title: "Saldo Tipis, Bos!" });
    
    setLoadingState(p => ({ ...p, minting: true }));
    try {
      await new Promise(r => setTimeout(r, 2000)); // Simulasi Blockchain
      setShowConfetti(true);
      addToast({ type: "success", title: "MINT BERHASIL! 🔥", mintAmt: mintAmount });
      await updateBalance();
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (e) { addToast({ type: "error", title: "Mint Gagal!" }); }
    finally { setLoadingState(p => ({ ...p, minting: false })); }
  };
  // --- UI RENDER ---
  return (
    <div style={{ 
      background: isDark ? "#080808" : "#faf6f0", 
      color: th.text, 
      fontFamily: "'Syne', sans-serif", 
      minHeight: "100vh", 
      transition: "0.5s all",
      position: "relative",
      overflowX: "hidden"
    }}>
      {/* BACKGROUND GRID (Efek Kotak-kotak di Foto) */}
      <div style={{ 
        position: "fixed", inset: 0, 
        backgroundImage: `linear-gradient(${isDark ? 'rgba(221,159,95,0.03)' : 'rgba(184,115,51,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(221,159,95,0.03)' : 'rgba(184,115,51,0.03)'} 1px, transparent 1px)`, 
        backgroundSize: "40px 40px", zIndex: 0 
      }}></div>

      {/* HEADER NAVIGATION */}
      <nav style={{ position: "relative", zIndex: 10, padding: "25px 50px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "35px", height: "35px", background: "linear-gradient(135deg, #dd9f5f, #b87333)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍔</div>
          <span style={{ fontWeight: "900", fontSize: "22px", letterSpacing: "-1px" }}>BurgerShot</span>
        </div>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
           <div style={{ padding: "6px 12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", fontWeight: "bold" }}>● OP_NET</div>
           <button onClick={() => setIsDark(!isDark)} style={{ background: th.card, border: `1px solid ${th.border}`, padding: "8px 12px", borderRadius: "12px", cursor: "pointer", fontSize: "16px" }}>
             {isDark ? "🌙" : "☀️"}
           </button>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px" }}>
        
        {/* TITLE SECTION */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-block", padding: "5px 15px", borderRadius: "25px", background: "rgba(221,159,95,0.1)", border: "1px solid #dd9f5f40", fontSize: "11px", color: "#dd9f5f", marginBottom: "20px", fontWeight: "bold", letterSpacing: "1px" }}>✦ TOKEN LAUNCH</div>
          <h1 style={{ fontSize: "85px", fontWeight: "900", lineHeight: "0.8", margin: "0", letterSpacing: "-4px" }}>Mint</h1>
          <h1 style={{ fontSize: "85px", fontWeight: "900", color: "#dd9f5f", margin: "0", letterSpacing: "-4px" }}>$BSHOT</h1>
          <p style={{ color: th.sub, maxWidth: "420px", fontSize: "13px", marginTop: "20px", lineHeight: "1.6" }}>The official token of the Burger Shot ecosystem on OP_NET's Bitcoin layer.</p>
        </div>

        {/* MAIN MINT CARD (Sesuai Screenshot) */}
        <div style={{ background: th.card, width: "100%", maxWidth: "480px", borderRadius: "28px", padding: "30px", border: `1px solid ${th.border}`, backdropFilter: "blur(20px)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
          
          {/* WALLET DISPLAY */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "18px", padding: "18px", marginBottom: "25px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ fontSize: "22px", opacity: 0.6 }}>🛡️</div>
              <div>
                <p style={{ fontSize: "10px", color: th.sub, margin: 0, fontWeight: "bold" }}>CONNECTED</p>
                <p style={{ fontSize: "13px", fontWeight: "bold", margin: 0, fontFamily: "monospace", color: "#dd9f5f" }}>{connected ? `${walletAddress.slice(0,8)}...${walletAddress.slice(-6)}` : "Not Connected"}</p>
              </div>
            </div>
            {connected && <button style={{ background: "rgba(255,0,0,0.1)", color: "#ff5555", border: "1px solid rgba(255,0,0,0.2)", padding: "4px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: "bold" }}>[• Disconnect]</button>}
          </div>

          {/* BALANCE BOX */}
          <div style={{ marginBottom: "30px", padding: "0 10px" }}>
            <p style={{ fontSize: "12px", color: th.sub, marginBottom: "10px", fontWeight: "bold" }}>TBTC BALANCE</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "42px", fontWeight: "900", margin: 0, fontFamily: "monospace" }}>{displayBalance.toFixed(4)} <span style={{ fontSize: "16px", color: th.sub }}>tBTC</span></h2>
              <div style={{ fontSize: "35px", opacity: 0.1 }}>₿</div>
            </div>
          </div>

          {/* MINT INTERFACE */}
          <div style={{ marginBottom: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <span style={{ fontSize: "12px", color: th.sub, fontWeight: "bold" }}>MINT AMOUNT</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                 <button onClick={handleMax} style={{ background: "#dd9f5f", border: "none", color: "black", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "900", cursor: "pointer" }}>MAX</button>
                 <span style={{ fontSize: "12px", opacity: 0.5 }}>{rBTCBalance.toFixed(4)} tBTC</span>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.4)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "12px" }}>
              <button onClick={() => setMintAmount(Math.max(1, mintAmount-1))} style={{ background: "none", border: "none", color: "#dd9f5f", fontSize: "24px", cursor: "pointer", fontWeight: "bold" }}>−</button>
              <span style={{ fontSize: "36px", fontWeight: "900" }}>{mintAmount}</span>
              <button onClick={() => setMintAmount(mintAmount+1)} style={{ background: "none", border: "none", color: "#dd9f5f", fontSize: "24px", cursor: "pointer", fontWeight: "bold" }}>+</button>
            </div>

            {/* QUICK SELECT BUTTONS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {[5, 10, 25, 50].map(val => (
                <button key={val} onClick={() => setMintAmount(val)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold", cursor: "pointer" }}>{val}</button>
              ))}
            </div>
          </div>

          {/* PRICING DETAILS */}
          <div style={{ borderTop: "1px dotted rgba(255,255,255,0.1)", paddingTop: "20px", fontSize: "13px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: th.sub }}>Price per $BSHOT</span>
                <span>{BSHOT_PRICE} tBTC</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: th.sub }}>Gas fee (est.)</span>
                <span style={{ color: "#ff5555" }}>~0.00002 tBTC</span>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <span style={{ color: th.sub }}>Max Slippage</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0.5, 1, 3, 5].map(s => (
                    <button key={s} onClick={() => setSlippage(s)} style={{ background: slippage === s ? "#dd9f5f" : "rgba(255,255,255,0.05)", border: "none", color: slippage === s ? "black" : "white", padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>{s}%</button>
                  ))}
                </div>
             </div>
             <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "16px", color: "#dd9f5f", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "15px" }}>
                <span>Total</span>
                <span>{(mintAmount * BSHOT_PRICE).toFixed(4)} tBTC</span>
             </div>
          </div>

          <button 
            onClick={handleMint}
            disabled={!connected || loadingState.minting}
            style={{ width: "100%", marginTop: "25px", padding: "20px", borderRadius: "15px", background: "linear-gradient(135deg, #dd9f5f, #b87333)", border: "none", color: "black", fontWeight: "900", fontSize: "18px", cursor: "pointer", transition: "0.3s opacity" }}
          >
            {loadingState.minting ? "MINING TRANSACTION..." : `🍔 Mint ${mintAmount} $BSHOT`}
          </button>
        </div>
        
        <p style={{ marginTop: "30px", fontSize: "11px", color: th.sub, letterSpacing: "1px" }}>Built on OP_NET — Bitcoin's Smart Contract Layer</p>
      </main>

      {/* RECENT MINTS PANEL (Sesuai Screenshot Kiri Bawah) */}
      <div style={{ position: "fixed", bottom: "30px", left: "30px", width: "220px", background: "rgba(15,15,15,0.8)", borderRadius: "15px", border: "1px solid rgba(221,159,95,0.2)", padding: "15px", backdropFilter: "blur(10px)", zIndex: 100 }}>
         <p style={{ fontSize: "10px", fontWeight: "bold", color: "#dd9f5f", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>● RECENT MINTS <span style={{ opacity: 0.5 }}>🔄</span></p>
         <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "11px", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
               <span style={{ color: th.sub }}>bc1p...4z7f</span><br/>
               <strong>+28 $BSHOT</strong> <span style={{ float: "right", opacity: 0.3 }}>1s ago</span>
            </div>
            <div style={{ fontSize: "11px", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
               <span style={{ color: th.sub }}>bc1p...9xka</span><br/>
               <strong>+10 $BSHOT</strong> <span style={{ float: "right", opacity: 0.3 }}>21s ago</span>
            </div>
         </div>
      </div>

      {/* NOTIFICATION TOAST (Kanan Atas) */}
      <div style={{ position: "fixed", top: "30px", right: "30px", zIndex: 1000 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: "#0c0c0c", border: "1px solid #4ade8040", padding: "25px", borderRadius: "20px", minWidth: "320px", boxShadow: "0 30px 60px rgba(0,0,0,0.8)", animation: "slideIn 0.4s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#4ade80", fontWeight: "900", fontSize: "16px" }}>
              <span style={{ background: "#4ade8020", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>✓</span> Mint Successful!
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: "10px 0 20px" }}>Successfully minted {t.mintAmt} $BSHOT. Check your wallet.</p>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
               <p style={{ fontSize: "9px", color: th.sub, margin: "0 0 5px" }}>TX ID</p>
               <p style={{ fontSize: "11px", fontFamily: "monospace", margin: 0, color: "#4ade80" }}>0x4c7dae...a7c883 ↗</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// THE FINAL RENDER
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BurgerShotMint />);
