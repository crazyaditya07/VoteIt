import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useVotingData } from '../hooks/useVotingData';
import { VOTING_ABI, VOTING_CONTRACT_ADDRESS } from '../contracts/VotingABI';

export const VotingInterface = () => {
    const { pollId } = useParams<{ pollId: string }>();
    const parsedPollId = pollId ? parseInt(pollId, 10) : 0;
    const { title, description, options, counts, totalVotes, isLoading, hasVoted, refetchHasVoted, refetchCounts } = useVotingData(parsedPollId);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();

    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isTxSuccess) {
            refetchHasVoted();
            refetchCounts();
            setSelectedOption(null);
            setErrorMessage(null);
        }
    }, [isTxSuccess, refetchHasVoted, refetchCounts]);

    useEffect(() => {
        if (writeError) {
            const errorMsg = writeError.message || 'Transaction failed or rejected.';
            if (errorMsg.includes('User rejected the request')) {
                setErrorMessage('Transaction was cancelled in the wallet.');
            } else if (errorMsg.includes('Already voted')) {
                setErrorMessage('You have already voted!');
                refetchHasVoted(); // Failsafe
            } else if (errorMsg.includes('Invalid option index')) {
                setErrorMessage('Invalid voting option selected.');
            } else {
                setErrorMessage('Transaction failed. Please try again.');
            }
        }
    }, [writeError, refetchHasVoted]);


    if (isLoading) {
        return (
            <div className="w-full h-48 flex items-center justify-center animate-fade-in">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const handleVote = async () => {
        if (selectedOption === null) return;
        setErrorMessage(null);

        writeContract({
            address: VOTING_CONTRACT_ADDRESS,
            abi: VOTING_ABI,
            functionName: 'vote',
            args: [BigInt(parsedPollId), BigInt(selectedOption)],
        });
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-800/40 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] animate-fade-in relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 p-8 opacity-20 blur-3xl bg-blue-500 w-64 h-64 rounded-full transform translate-x-20 -translate-y-20 pointer-events-none" />

            <div className="mb-10 relative z-10">
                <div className="flex items-center gap-3 mb-4 text-slate-400 font-medium tracking-widest text-xs uppercase">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                    Secure On-Chain Poll #{parsedPollId}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">{title as string}</h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">{description as string}</p>
                <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 bg-slate-900/60 rounded-xl text-sm font-medium text-blue-400 border border-white/5 shadow-inner">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Total Votes Cast: {totalVotes}
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {options.map((option, index) => {
                    const voteCount = counts[index] || 0;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                    return (
                        <div
                            key={index}
                            onClick={() => !hasVoted && !isPending && !isTxConfirming && setSelectedOption(index)}
                            className={`
                                relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300
                                ${hasVoted || isPending || isTxConfirming ? 'cursor-default' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'}
                                ${hasVoted ? 'border-white/5 bg-slate-800/40 shadow-inner' :
                                    selectedOption === index ? 'border-blue-500/50 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-800/60'}
                            `}
                        >
                            <div
                                className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${selectedOption === index ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/10' : 'bg-slate-700/30'}`}
                                style={{ width: `${percentage}%` }}
                            />

                            <div className="relative flex justify-between items-center z-10">
                                <span className={`font-semibold text-lg sm:text-xl tracking-tight ${selectedOption === index ? 'text-blue-300' : 'text-slate-200'}`}>{option}</span>
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono text-sm sm:text-base ${selectedOption === index ? 'text-blue-200' : 'text-slate-400'}`}>
                                        <span className="font-bold">{voteCount}</span> {voteCount === 1 ? 'vote' : 'votes'}
                                    </span>
                                    {(hasVoted || totalVotes > 0) && (
                                        <span className={`text-base font-extrabold w-14 text-right transition-colors ${selectedOption === index ? 'text-blue-400' : 'text-slate-500'}`}>{percentage}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 relative z-10">
                {hasVoted ? (
                    <div className="text-center p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl text-emerald-300 font-medium animate-fade-in flex flex-col items-center justify-center gap-3 backdrop-blur-md shadow-inner">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <span className="text-2xl">✓</span>
                        </div>
                        <div>
                            <span className="block text-lg font-bold">Vote Successfully Recorded</span>
                            <span className="text-emerald-400/80 text-sm mt-1">Cryptographically secured on the Sepolia network.</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <button
                            disabled={selectedOption === null || isPending || isTxConfirming}
                            onClick={handleVote}
                            className={`
                                w-full py-5 px-6 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 focus:outline-none flex justify-center items-center
                                ${selectedOption === null || isPending || isTxConfirming
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 shadow-none opacity-80'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                                }
                            `}
                        >
                            {isPending ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                    Awaiting Signature...
                                </span>
                            ) : isTxConfirming ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                                    Mining Block...
                                </span>
                            ) : 'Submit Secure Vote'}
                        </button>

                        {errorMessage && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center animate-fade-in shadow-inner flex items-center justify-center gap-2">
                                <span>⚠️</span> {errorMessage}
                            </div>
                        )}
                        {isTxSuccess && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium text-center animate-fade-in shadow-inner flex items-center justify-center gap-2">
                                <span>✓</span> Vote successfully mined and synchronized!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
