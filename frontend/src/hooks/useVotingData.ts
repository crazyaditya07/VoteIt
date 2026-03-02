import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { VOTING_ABI, VOTING_CONTRACT_ADDRESS } from '../contracts/VotingABI';

export function useVotingData(pollId: number) {
    const { address } = useAccount();

    const { data: pollData, isLoading: isLoadingPoll } = useReadContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'polls',
        args: [BigInt(pollId)],
    });

    const { data: optionsCountData, isLoading: isLoadingCount } = useReadContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'getOptionsCount',
        args: [BigInt(pollId)],
    });

    const optionsCount = optionsCountData ? Number(optionsCountData) : 0;

    const optionCalls = Array.from({ length: optionsCount }).map((_, i) => ({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'getOption',
        args: [BigInt(pollId), BigInt(i)],
    }));

    const countCalls = Array.from({ length: optionsCount }).map((_, i) => ({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'getVoteCount',
        args: [BigInt(pollId), BigInt(i)],
    }));

    const { data: optionsData, isLoading: isLoadingOptions } = useReadContracts({
        contracts: optionCalls as any,
    });

    const { data: countsData, isLoading: isLoadingCounts, refetch: refetchCounts } = useReadContracts({
        contracts: countCalls as any,
    });

    const { data: hasVoted, isLoading: isLoadingVoted, refetch: refetchHasVoted } = useReadContract({
        address: VOTING_CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'hasVoted',
        args: address ? [BigInt(pollId), address as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        }
    });

    const options = optionsData?.map(d => d.result as string) || [];
    const counts = countsData?.map(d => Number(d.result)) || [];

    const isLoading = isLoadingPoll || isLoadingCount || isLoadingOptions || isLoadingCounts || isLoadingVoted;

    const totalVotes = counts.reduce((acc, curr) => acc + curr, 0);

    // @ts-ignore
    const title = pollData ? pollData[0] : "";
    // @ts-ignore
    const description = pollData ? pollData[1] : "";

    return {
        title: title as string,
        description: description as string,
        optionsCount,
        options,
        counts,
        totalVotes,
        hasVoted: Boolean(hasVoted),
        isLoading,
        refetchHasVoted,
        refetchCounts
    };
}
