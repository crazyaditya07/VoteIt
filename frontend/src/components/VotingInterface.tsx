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
        <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl animate-fade-in transition-all">
            <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">{title as string}</h2>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed">{description as string}</p>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full text-sm font-medium text-blue-400 border border-slate-700 shadow-inner">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Total Votes Cast: {totalVotes}
                </div>
            </div>

            <div className="space-y-4">
                {options.map((option, index) => {
                    const voteCount = counts[index] || 0;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                    return (
                        <div
                            key={index}
                            onClick={() => !hasVoted && !isPending && !isTxConfirming && setSelectedOption(index)}
                            className={`
                                relative overflow-hidden rounded-xl border p-4 sm:p-5 transition-all duration-300
                                ${hasVoted || isPending || isTxConfirming ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01] hover:border-slate-500'}
                                ${hasVoted ? 'border-slate-700 bg-slate-800/80 shadow-inner' :
                                    selectedOption === index ? 'border-blue-500 bg-blue-900/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700 bg-slate-900'}
                            `}
                        >
                            <div
                                className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${selectedOption === index ? 'bg-blue-600/20' : 'bg-slate-700/40'}`}
                                style={{ width: `${percentage}%` }}
                            />

                            <div className="relative flex justify-between items-center z-10">
                                <span className={`font-semibold text-base sm:text-lg ${selectedOption === index ? 'text-blue-300' : 'text-slate-200'}`}>{option}</span>
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono text-sm sm:text-base ${selectedOption === index ? 'text-blue-200' : 'text-slate-400'}`}>{voteCount} votes</span>
                                    {(hasVoted || totalVotes > 0) && (
                                        <span className={`text-sm font-bold w-12 text-right transition-colors ${selectedOption === index ? 'text-blue-400' : 'text-slate-500'}`}>{percentage}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50">
                {hasVoted ? (
                    <div className="text-center p-4 sm:p-5 bg-blue-900/20 border border-blue-500/30 rounded-xl text-blue-300 font-medium animate-fade-in flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">✓</span>
                        <span>Your vote has been securely recorded on-chain.</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <button
                            disabled={selectedOption === null || isPending || isTxConfirming}
                            onClick={handleVote}
                            className={`
                                w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                                ${selectedOption === null || isPending || isTxConfirming
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-70'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]'
                                }
                            `}
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                                    Confirm in Wallet...
                                </span>
                            ) : isTxConfirming ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                                    Mining Transaction...
                                </span>
                            ) : 'Submit Secure Vote'}
                        </button>

                        {errorMessage && (
                            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-300 text-sm text-center animate-fade-in">
                                {errorMessage}
                            </div>
                        )}
                        {isTxSuccess && (
                            <div className="p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-sm text-center animate-fade-in font-medium">
                                ✓ Vote successfully mined and recorded!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
