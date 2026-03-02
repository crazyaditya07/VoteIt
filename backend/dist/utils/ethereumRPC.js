"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPollCreationTx = void 0;
const ethers_1 = require("ethers");
// Explicitly use string signatures or full ABI to decode logs.
// Using string signature for the specific event we care about.
const pollCreatedSignature = [
    "event PollCreated(uint256 indexed pollId, address indexed creator, string title)"
];
const verifyPollCreationTx = async (txHash, expectedContract, expectedCreator) => {
    try {
        const rpcUrl = process.env.SEPOLIA_RPC_URL;
        if (!rpcUrl) {
            throw new Error("RPC URL not configured on server.");
        }
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
            console.error(`[RPC Verify] No receipt found for tx: ${txHash}`);
            return null; // Tx not mined or invalid
        }
        // Must be successful
        if (receipt.status !== 1) {
            console.error(`[RPC Verify] Transaction reverted: ${txHash}`);
            return null;
        }
        if (receipt.to?.toLowerCase() !== expectedContract.toLowerCase()) {
            console.error(`[RPC Verify] Transaction target mismatch. Exp: ${expectedContract}, Got: ${receipt.to}`);
            return null;
        }
        // Instantiate interface to decode logs
        const iface = new ethers_1.ethers.Interface(pollCreatedSignature);
        for (const log of receipt.logs) {
            try {
                // Ensure the log came from the expected contract specifically decoupled from false emits
                if (log.address.toLowerCase() !== expectedContract.toLowerCase())
                    continue;
                const decoded = iface.parseLog({
                    topics: [...log.topics],
                    data: log.data
                });
                if (decoded && decoded.name === 'PollCreated') {
                    const creatorParam = (decoded.args[1] || '').toString().toLowerCase();
                    if (creatorParam !== expectedCreator.toLowerCase()) {
                        console.error(`[RPC Verify] Creator mismatch! Log creator: ${creatorParam}, Expecting: ${expectedCreator}`);
                        return null; // Return null intentionally to kill transaction mappings that impersonate
                    }
                    const pollId = Number(decoded.args[0]);
                    return { pollId };
                }
            }
            catch (err) {
                // Log may not map to PollCreated, that's fine. Ignore mismatch logs.
                continue;
            }
        }
        console.error(`[RPC Verify] No valid PollCreated event found in tx: ${txHash}`);
        return null;
    }
    catch (error) {
        console.error(`[RPC Verify] Error resolving RPC verification for ${txHash}`, error);
        throw error;
    }
};
exports.verifyPollCreationTx = verifyPollCreationTx;
