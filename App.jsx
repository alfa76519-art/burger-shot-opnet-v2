const { useState, useEffect } = React;

const BurgerShotV2 = () => {
    const [connected, setConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [rBTCBalance, setRBTCBalance] = useState(0.11);
    const [displayBalance, setDisplayBalance] = useState(0.11);
    const [slippage, setSlippage] = useState(2.5);
    const [status, setStatus] = useState('idle');
    const [txHash, setTxHash] = useState('');

    const handleMint = () => {
        setStatus('minting');
        setTimeout(() => {
            setStatus('success');
            setTxHash('0x' + Math.random().toString(16).slice(2, 10) + '...opnet');
            setRBTCBalance(prev => (parseFloat(prev) - 0.01).toFixed(2));
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="glass-card p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[#30363d] bg-[#161b22]/80 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-orange-500">🍔 BurgerShot V2</h1>
                    <span className="bg-blue-900 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">OP_NET Testnet</span>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
                        <p className="text-gray-400 text-xs">Available Balance</p>
                        <p className="text-xl font-mono font-bold text-white">{rBTCBalance} rBTC</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Slippage (%)</label>
                            <input 
                                type="number" 
                                value={slippage}
                                onChange={(e) => setSlippage(e.target.value)}
                                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-sm text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Amount</label>
                            <input 
                                type="number" 
                                value="1"
                                disabled
                                className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2 text-sm text-gray-500"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleMint}
                        disabled={status === 'minting'}
                        className={`w-full py-3 rounded-lg font-bold transition-all transform active:scale-95 ${
                            status === 'minting' ? 'bg-gray-700 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                        }`}
                    >
                        {status === 'minting' ? '⌛ Processing...' : '🔥 Mint Burger'}
                    </button>

                    {status === 'success' && (
                        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 text-xs animate-pulse">
                            <p className="font-bold mb-1">✅ Transaction Confirmed!</p>
                            <p className="font-mono truncate opacity-70">{txHash}</p>
                        </div>
                    )}
                </div>
            </div>
            <p className="mt-6 text-gray-600 text-[10px] font-mono tracking-widest uppercase">Operative-07 // OP_NET Protocol</p>
        </div>
    );
};

// Render to Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<BurgerShotV2 />);
