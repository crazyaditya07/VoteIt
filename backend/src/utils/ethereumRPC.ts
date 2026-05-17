import { ethers } from 'ethers';

const pollCreatedSignature = [
    "event PollCreated(uint256 indexed pollId, address indexed creator, string title)"
];

export const verifyPollCreationTx = async (
    txHash: string,
    expectedContract: string,
    expectedCreator: string
): Promise<{ pollId: number } | null> => {
    try {
        const rpcUrl = process.env.SEPOLIA_RPC_URL;
        if (!rpcUrl) {
            throw new Error("RPC URL not configured on server.");
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            console.error(`[RPC] No receipt found for tx: ${txHash}`);
            return null;
        }

        if (receipt.status !== 1) {
            console.error(`[RPC] Transaction reverted: ${txHash}`);
            return null;
        }

        if (receipt.to?.toLowerCase() !== expectedContract.toLowerCase()) {
            console.error(`[RPC] Transaction target mismatch. Expected: ${expectedContract}, got: ${receipt.to}`);
            return null;
        }

        const iface = new ethers.Interface(pollCreatedSignature);

        for (const log of receipt.logs) {
            try {
                if (log.address.toLowerCase() !== expectedContract.toLowerCase()) continue;

                const decoded = iface.parseLog({
                    topics: [...log.topics],
                    data: log.data
                });

                if (decoded && decoded.name === 'PollCreated') {
                    const creatorParam = (decoded.args[1] || '').toString().toLowerCase();
                    if (creatorParam !== expectedCreator.toLowerCase()) {
                        console.error(`[RPC] Creator mismatch. Log creator: ${creatorParam}, expected: ${expectedCreator}`);
                        return null;
                    }

                    const pollId = Number(decoded.args[0]);
                    return { pollId };
                }
            } catch {
                continue;
            }
        }

        console.error(`[RPC] No valid PollCreated event found in tx: ${txHash}`);
        return null;

    } catch (error) {
        console.error(`[RPC] Verification error for tx: ${txHash}`, error);
        throw error;
    }
};
