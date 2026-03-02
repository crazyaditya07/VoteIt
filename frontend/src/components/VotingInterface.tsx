import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useVotingData } from '../hooks/useVotingData';
import { VOTING_ABI, VOTING_CONTRACT_ADDRESS } from '../contracts/VotingABI';

export const VotingInterface = () => {
    const { title, description, options, counts, totalVotes, isLoading, hasVoted, refetchHasVoted } = useVotingData();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();

    const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isTxSuccess) {
            refetchHasVoted();
        }
    }, [isTxSuccess, refetchHasVoted]);

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const handleVote = async () => {
        if (selectedOption === null) return;

        writeContract({
            address: VOTING_CONTRACT_ADDRESS,
            abi: VOTING_ABI,
            functionName: 'vote',
            args: [BigInt(selectedOption)],
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{title as string}</h2>
                <p className="text-slate-400 text-lg">{description as string}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-slate-900 rounded-full text-sm font-medium text-blue-400 border border-slate-700">
                    Total Votes: {totalVotes}
                </div>
            </div>

            <div className="space-y-4">
                {options.map((option, index) => {
                    const voteCount = counts[index] || 0;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                    return (
                        <div
                            key={index}
                            onClick={() => !hasVoted && setSelectedOption(index)}
                            className={`
                relative overflow-hidden rounded-xl border p-4 transition-all cursor-pointer
                ${hasVoted ? 'border-slate-700 bg-slate-800/50 cursor-default' :
                                    selectedOption === index ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}
              `}
                        >
                            {/* Basic percentage bar as required by Plan 2 */}
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-slate-700/30 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />

                            <div className="relative flex justify-between items-center z-10">
                                <span className="font-semibold text-white">{option}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-300 font-mono">{voteCount} votes</span>
                                    {(hasVoted || totalVotes > 0) && (
                                        <span className="text-sm font-medium text-slate-400 w-12 text-right">{percentage}%</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
                {hasVoted ? (
                    <div className="text-center p-4 bg-blue-900/30 border border-blue-500/50 rounded-xl text-blue-300 font-medium">
                        ✓ You have already cast your vote for this proposal.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <button
                            disabled={selectedOption === null || isPending || isTxConfirming}
                            onClick={handleVote}
                            className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all
                ${selectedOption === null || isPending || isTxConfirming
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/25 active:scale-[0.98]'
                                }
              `}
                        >
                            {isPending ? 'Confirm in Wallet...' : isTxConfirming ? 'Processing Transaction...' : 'Submit Vote'}
                        </button>

                        {(writeError as any) && (
                            <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
                                Transaction failed or rejected.
                            </div>
                        )}
                        {isTxSuccess && (
                            <div className="p-3 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm text-center">
                                Vote successfully cast!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
