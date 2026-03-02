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
        <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 mt-10 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Create a New Poll</h2>

            {syncError && (
                <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-300 text-sm animate-fade-in">
                    ⚠️ {syncError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Poll Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPending || isTxConfirming || isSyncing}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isPending || isTxConfirming || isSyncing}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 h-24 resize-none disabled:opacity-50"
                />

                <div className="flex flex-col gap-2 mt-4">
                    <label className="text-slate-400 font-medium">Voting Options</label>
                    {options.map((option, index) => (
                        <input
                            key={index}
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            disabled={isPending || isTxConfirming || isSyncing}
                            className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                    ))}
                    <button
                        type="button"
                        onClick={addOption}
                        disabled={isPending || isTxConfirming || isSyncing}
                        className="text-blue-400 text-sm self-start mt-2 hover:text-blue-300 disabled:opacity-50"
                    >
                        + Add another option
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isPending || isTxConfirming || isSyncing}
                    className="mt-6 w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md disabled:bg-slate-700 disabled:text-slate-400 transition-all flex justify-center"
                >
                    {isPending ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                            Confirm in Wallet...
                        </span>
                    ) : isTxConfirming ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                            Mining Block...
                        </span>
                    ) : isSyncing ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-purple-200 border-t-transparent rounded-full animate-spin"></div>
                            RPC Verifying Ownership...
                        </span>
                    ) : (
                        'Deploy Poll On-Chain'
                    )}
                </button>
            </form>
        </div>
    );
};
