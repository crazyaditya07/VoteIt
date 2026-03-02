import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { VOTING_ABI, VOTING_CONTRACT_ADDRESS } from '../contracts/VotingABI';

export function useVotingData() {
    const { address } = useAccount();

    // Read single proposal details
    const { data: title, isLoading: isLoadingTitle } = useReadContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'title',
    });

    const { data: description, isLoading: isLoadingDesc } = useReadContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'description',
    });

    const { data: optionsCountData, isLoading: isLoadingCount } = useReadContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'getOptionsCount',
    });

    const optionsCount = optionsCountData ? Number(optionsCountData) : 0;

    // Read options and vote counts dynamically using useReadContracts based on the count
    const optionCalls = Array.from({ length: optionsCount }).map((_, i) => ({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'getOption',
        args: [BigInt(i)],
    }));

    const countCalls = Array.from({ length: optionsCount }).map((_, i) => ({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'voteCounts',
        args: [BigInt(i)],
    }));

    const { data: optionsData, isLoading: isLoadingOptions } = useReadContracts({
        contracts: optionCalls as any,
    });

    const { data: countsData, isLoading: isLoadingCounts } = useReadContracts({
        contracts: countCalls as any,
    });

    const { data: hasVoted, isLoading: isLoadingVoted, refetch: refetchHasVoted } = useReadContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'hasVoted',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        }
    });

    const options = optionsData?.map(d => d.result as string) || [];
    const counts = countsData?.map(d => Number(d.result)) || [];

    const isLoading = isLoadingTitle || isLoadingDesc || isLoadingCount || isLoadingOptions || isLoadingCounts || isLoadingVoted;

    const totalVotes = counts.reduce((acc, curr) => acc + curr, 0);

    return {
        title,
        description,
        optionsCount,
        options,
        counts,
        totalVotes,
        hasVoted,
        isLoading,
        refetchHasVoted
    };
}
