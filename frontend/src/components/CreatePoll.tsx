import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { VOTING_ABI, VOTING_CONTRACT_ADDRESS } from '../contracts/VotingABI';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const CreatePoll = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [successPollId, setSuccessPollId] = useState<number | null>(null);

    const navigate = useNavigate();
    const { user } = useAuth();
    const { address } = useAccount();

    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

    // In Plan 6 we track receipt locally extracting txHash seamlessly.
    const {
        isLoading: isTxConfirming,
        isSuccess: isTxSuccess,
        isError: receiptError,
        data: receiptData
    } = useWaitForTransactionReceipt({
        hash,
    });

    // Enforce DB Sync on local TX completion.
    useEffect(() => {
        const syncPollWithDatabase = async () => {
            if (isTxSuccess && receiptData && user?.token && address) {
                // Ensure wallet is linked on user so RPC check passes
                try {
                    // Quick pre-sync: ensure wallet address is linked native to account
                    await fetch('http://localhost:5000/api/auth/wallet', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token}`
                        },
                        body: JSON.stringify({ walletAddress: address.toLowerCase() })
                    });
                } catch (e) {
                    console.error("Wallet link failed gracefully");
                }

                setIsSyncing(true);
                setSyncError(null);

                try {
                    const response = await fetch('http://localhost:5000/api/polls', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token}`
                        },
                        body: JSON.stringify({
                            txHash: receiptData.transactionHash,
                            contractAddress: VOTING_CONTRACT_ADDRESS
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Server rejected synchronization.');
                    }

                    // Strict Trust boundary passed natively!
                    setSuccessPollId(data.pollId);
                } catch (error: any) {
                    console.error("Database sync failed rigidly:", error);
                    setSyncError(error.message || 'Failed to sync with secure backend.');
                } finally {
                    setIsSyncing(false);
                }
            }
        };

        syncPollWithDatabase();
    }, [isTxSuccess, receiptData, user?.token, address]);

    useEffect(() => {
        if (writeError) setSyncError('Transaction cancelled or failed in wallet.');
        if (receiptError) setSyncError('Transaction reverted or failed dropping block.');
    }, [writeError, receiptError]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSyncError(null);
        if (!title || !description || options.some(opt => !opt)) return;

        writeContract({
            address: VOTING_CONTRACT_ADDRESS,
            abi: VOTING_ABI,
            functionName: 'createPoll',
            args: [title, description, options],
        });
    };

    if (successPollId !== null) {
        return (
            <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 mt-10 animate-fade-in text-center">
                <div className="text-emerald-400 p-6 border border-emerald-500/50 rounded-lg bg-emerald-900/20 mb-6">
                    <span className="text-3xl block mb-2">🎉</span>
                    <h2 className="text-2xl font-bold mb-2">RPC Verified!</h2>
                    <p className="text-emerald-200">
                        Smart Contract deployed successfully. The server has natively bridged ownership correctly assigning Poll #{successPollId}.
                    </p>
                </div>
                <button
                    onClick={() => navigate(`/vote/${successPollId}`)}
                    className="w-full bg-blue-600 py-4 font-bold text-lg rounded-xl text-white hover:bg-blue-500 shadow-md transition-all active:scale-95"
                >
                    View Secure Poll Now
                </button>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto w-full animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Deploy New Poll</h2>

            {syncError && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium animate-fade-in flex items-center gap-2 shadow-inner">
                    <span>⚠️</span> {syncError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Poll Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isPending || isTxConfirming || isSyncing}
                        className="w-full p-4 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner disabled:opacity-50"
                    />
                    <textarea
                        placeholder="Detailed Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isPending || isTxConfirming || isSyncing}
                        className="w-full p-4 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner h-32 resize-none disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <label className="text-slate-400 font-medium text-sm tracking-wide uppercase">Voting Options</label>
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div key={index} className="relative group">
                                <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    disabled={isPending || isTxConfirming || isSyncing}
                                    className="w-full p-4 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner disabled:opacity-50 pr-12"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addOption}
                        disabled={isPending || isTxConfirming || isSyncing}
                        className="text-blue-400 text-sm font-medium self-start mt-2 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1 group"
                    >
                        <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">+</span>
                        Add another option
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <button
                        type="submit"
                        disabled={isPending || isTxConfirming || isSyncing}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:bg-none disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:transform-none disabled:border disabled:border-slate-700 transition-all flex justify-center items-center"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                Awaiting Wallet Signature...
                            </span>
                        ) : isTxConfirming ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                                Mining Contract Deployment...
                            </span>
                        ) : isSyncing ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                                Verifying RPC Trust Boundary...
                            </span>
                        ) : (
                            'Sign & Deploy to Sepolia'
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-4 opacity-70">Requires small amount of Sepolia ETH for gas.</p>
                </div>
            </form>
        </div>
    );
};
